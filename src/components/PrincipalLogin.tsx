import React, { useState } from 'react';
import { LogIn, ArrowLeft, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { loginPrincipal } from '../lib/api';

// Split Text Animation
const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
    return (
        <h1 className={className} style={{ display: "flex", overflow: "hidden", justifyContent: "center" }}>
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: index * 0.05,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    style={{ display: "inline-block", transformOrigin: "50% 100%" }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </h1>
    );
};

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
            // Delay for dramatic entry
            await new Promise((res) => setTimeout(res, 800));
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
        <div className="min-h-screen bg-[#faf5ff] flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Elegant Purple Velvet SVG Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-fuchsia-300 mix-blend-multiply rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-purple-400 mix-blend-multiply rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_rgba(147,51,234,0.1)] p-8 md:p-12 w-full max-w-md border border-white/60"
            >
                <button
                    onClick={onBack}
                    className="group mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-600 transition-colors duration-300 font-bold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex flex-col items-center justify-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-gradient-to-br from-fuchsia-500 to-purple-700 p-5 rounded-[2rem] shadow-xl shadow-purple-500/30 mb-8"
                    >
                        <Building2 className="w-10 h-10 text-white" />
                    </motion.div>

                    <SplitText
                        text="Principal Portal"
                        className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-800 mb-2"
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center text-purple-600/80 font-bold tracking-wide uppercase text-xs"
                    >
                        {school?.school_name}
                    </motion.p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-fuchsia-50/50 p-4 rounded-2xl border border-fuchsia-100 mb-6 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-fuchsia-600 font-bold shadow-sm">
                            {school?.principal_name?.charAt(0) || 'P'}
                        </div>
                        <p className="text-sm text-fuchsia-900 font-bold">
                            Welcome, {school?.principal_name}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2 ml-2">
                            Passcode Required
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-300 outline-none bg-white text-slate-800 font-black shadow-inner shadow-slate-50"
                            placeholder="Enter administrative code"
                            required
                        />
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-3 rounded-xl text-sm font-bold overflow-hidden"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0px 10px 30px rgba(147,51,234,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group relative overflow-hidden text-lg tracking-wide"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <span className="relative z-10">Access Dashboard</span>
                                    <LogIn className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
}
