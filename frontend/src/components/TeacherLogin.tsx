import { useState } from 'react';
import { GraduationCap, LogIn, ArrowLeft, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginTeacher } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'English',
  'Hindi',
  'Social Science',
  'Computer Science',
  'Sanskrit',
  'Physical Education',
  'Drawing / Art',
  'General Knowledge',
  'Moral Science',
  'Other',
];

export function TeacherLogin({ onBack }: { onBack: () => void }) {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { school, loginAsTeacher } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      setError('Please select your subject.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // API check karega teacherId aur password ko
      const data = await loginTeacher({
        teacherId,
        schoolId: school!.id,
        password,
        subject,
      });

      // Frontend Pe Validate Karein: Jo subject teacher ne form me dala, 
      // wahi database me usko assigned hai ya nahi
      if (data.subject !== subject) {
        throw new Error("Aapne galat subject select kiya hai. Kripya apna sahi subject chunein.");
      }

      const teacherWithSubject = { ...data, subject };
      await new Promise((res) => setTimeout(res, 600));
      loginAsTeacher(teacherWithSubject, school!);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMsg);
      console.error("Login Error:", err);
      // Explicit popup alert
      if (errorMsg.includes('galat subject') || errorMsg.includes('subject')) {
        alert("⚠️ GALAT SUBJECT! ⚠️\n\n" + errorMsg + "\n\nAapne jo details daali wo database se match nahi kar rahi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-gradient-to-bl from-blue-300 to-transparent rounded-[100px] blur-3xl transform rotate-12"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -100 }}
          animate={{ opacity: 0.3, scale: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-sky-400 to-transparent rounded-[100px] blur-3xl transform -rotate-12"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-8 md:p-10 w-full max-w-md border border-white"
      >
        <button
          onClick={onBack}
          className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors duration-300 font-bold bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 transform -rotate-6"
          >
            <GraduationCap className="w-10 h-10 text-white transform rotate-6" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-slate-800 text-center mb-2"
          >
            Teacher Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-blue-600 font-semibold"
          >
            {school?.school_name}
          </motion.p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Teacher ID */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <label className="block text-sm font-bold text-slate-700 mb-2">Teacher ID</label>
            <input
              type="text"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 outline-none bg-slate-50 focus:bg-white text-slate-800 font-medium"
              placeholder="e.g. T101"
              required
            />
          </motion.div>

          {/* Subject Dropdown */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-500" />
                Subject
              </span>
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 outline-none bg-slate-50 focus:bg-white text-slate-800 font-medium appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select your subject...</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <AnimatePresence>
              {subject && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {subject} selected
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 outline-none bg-slate-50 focus:bg-white text-slate-800 font-medium"
              placeholder="Enter your password"
              required
            />
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 group"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full" />
            ) : (
              <>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Access Dashboard
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
