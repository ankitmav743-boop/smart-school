import { useState } from 'react';
import { Users, LogIn, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginParent } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type ParentLoginProps = {
  onBack: () => void;
};

// Kinetic Typography component
const KineticText = ({ text, className = "" }: { text: string; className?: string }) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring" as const, damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: 90,
      transition: { type: "spring" as const, damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.h1
      style={{ display: "flex", overflow: "hidden", perspective: 1000 }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} style={{ display: "inline-block" }}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
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
      // Small artificial delay to allow button animation to play out
      await new Promise((resolve) => setTimeout(resolve, 800));
      loginAsParent(data, school!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Morphing Shapes Background SVGator Alternative */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-40">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["20% 80% 60% 40% / 40% 40% 60% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 20% 80% 60%", "20% 80% 60% 40% / 40% 40% 60% 60%"],
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-green-300 via-emerald-200 to-teal-400 mix-blend-multiply blur-3xl absolute"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [360, 270, 180, 90, 0],
            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "20% 80% 60% 40% / 40% 40% 60% 60%", "40% 60% 70% 30% / 40% 20% 80% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 1
          }}
          className="w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-gradient-to-tr from-teal-300 via-cyan-200 to-emerald-400 mix-blend-multiply blur-3xl absolute opacity-70 translate-x-1/4 -translate-y-1/4"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative z-10 bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 md:p-10 w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="group mb-8 flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-all duration-300 font-medium bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full border border-teal-100"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-teal-600 p-5 rounded-2xl shadow-xl shadow-teal-500/20 mb-6"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>

          <KineticText
            text="Parent Portal"
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 text-center mb-2 justify-center"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-teal-600/80 font-medium"
          >
            {school?.school_name}
          </motion.p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Staggered form inputs */}
          <div className="space-y-5">
            {[
              { label: "Student Name", value: studentName, set: setStudentName, placeholder: "Enter student name", type: "text", example: "Example: Student 1001" },
              { label: "Class", value: classValue, set: setClassValue, placeholder: "e.g., 1st, 10th", type: "text", example: "Example: 1st" },
              { label: "SR Number", value: srNumber, set: setSrNumber, placeholder: "Enter SR number", type: "text", example: "Example: 1001" }
            ].map((input, idx) => (
              <motion.div
                key={input.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
              >
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {input.label}
                  </label>
                  <span className="text-xs text-teal-600/60 font-medium">{input.example}</span>
                </div>
                <div className="relative group">
                  <input
                    type={input.type}
                    value={input.value}
                    onChange={(e) => input.set(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-teal-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-300 outline-none bg-white/50 focus:bg-white text-gray-800 font-medium shadow-sm hover:border-teal-300"
                    placeholder={input.placeholder}
                    required
                  />
                  {/* Subtle input highlight border on hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-105 group-hover:scale-100" />
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-medium flex items-center overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_12px_25px_rgba(20,184,166,0.4)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {/* Button Inner Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Secure Parent Access
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
