import { useState } from 'react';
import { GraduationCap, LogIn, ArrowLeft } from 'lucide-react';
import { loginTeacher } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type TeacherLoginProps = {
  onBack: () => void;
};

export function TeacherLogin({ onBack }: TeacherLoginProps) {
  const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [classValue, setClassValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { school, loginAsTeacher } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginTeacher({
        teacherId,
        name,
        subject,
        classValue,
        schoolId: school!.id,
        password,
      });
      loginAsTeacher(data, school!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md border border-red-100 animate-fade-in-up">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors duration-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Selection
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 text-center mb-2">
          Teacher Login
        </h1>
        <p className="text-center text-gray-500 font-medium mb-8">
          {school?.school_name}
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teacher ID
            </label>
            <input
              type="text"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="Enter your teacher ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="e.g., Mathematics"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="e.g., 10th A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 outline-none bg-gray-50 focus:bg-white"
              placeholder="Enter your password"
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
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Verifying...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
