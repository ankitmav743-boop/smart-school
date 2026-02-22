import React, { useState } from 'react';
import { LogIn, ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginPrincipal } from '../lib/api';

export function PrincipalLogin({ onBack }: { onBack: () => void }) {
    const { school, loginAsPrincipal } = useAuth();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!school) return;

        setLoading(true);
        setError('');

        try {
            const principalUser = await loginPrincipal({
                schoolId: school.id,
                password: password.trim()
            });
            loginAsPrincipal(principalUser, school);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Invalid Principal Password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md border border-indigo-100 animate-fade-in-up">
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors duration-300 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Selection
                </button>

                <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center mb-2">
                    Principal Portal
                </h1>
                <p className="text-center text-gray-500 font-medium mb-8">
                    {school?.school_name}
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
                        <p className="text-sm text-indigo-800 text-center font-medium">
                            Welcome, {school?.principal_name}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Secure Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
                            placeholder="Enter your principal password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
