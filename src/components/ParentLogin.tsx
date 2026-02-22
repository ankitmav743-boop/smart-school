import { useState } from 'react';
import { Users, LogIn, ArrowLeft } from 'lucide-react';
import { loginParent } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type ParentLoginProps = {
  onBack: () => void;
};

export function ParentLogin({ onBack }: ParentLoginProps) {
  const [studentName, setStudentName] = useState('');
  const [classValue, setClassValue] = useState('');
  const [srNumber, setSrNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { school, loginAsParent } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginParent({
        studentName,
        classValue,
        srNumber,
        schoolId: school!.id,
      });
      loginAsParent(data, school!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md border border-teal-100 animate-fade-in-up">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors duration-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Selection
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Users className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 text-center mb-2">
          Parent Login
        </h1>
        <p className="text-center text-gray-500 font-medium mb-8">
          {school?.school_name}
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="Enter student name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class
            </label>
            <input
              type="text"
              value={classValue}
              onChange={(e) => setClassValue(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="e.g., 10th A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              School Roll Number (SR No.)
            </label>
            <input
              type="text"
              value={srNumber}
              onChange={(e) => setSrNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="Enter SR number"
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
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Verifying...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
