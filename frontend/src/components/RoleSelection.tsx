import { GraduationCap, Users, Building2, Info } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: "0px 20px 40px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

const KineticText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(" ");

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className={className}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-3">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "150%" },
              visible: {
                y: 0,
                transition: { type: "spring", damping: 12, stiffness: 100 }
              }
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};

export function RoleSelection({
  onSelectRole,
  onShowAbout
}: {
  onSelectRole: (role: 'teacher' | 'parent' | 'principal') => void;
  onShowAbout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Ambient Moving Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
          }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="absolute top-0 left-0 w-[80vw] h-[80vw] bg-blue-300 mix-blend-multiply rounded-full blur-[100px] opacity-50"
        />
        <motion.div
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["20%", "-20%", "20%"],
          }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[70vw] h-[70vw] bg-indigo-300 mix-blend-multiply rounded-full blur-[100px] opacity-40"
        />
      </div>

      {/* About Developer Button */}
      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={onShowAbout}
        className="absolute top-6 right-6 md:top-8 md:right-8 group flex items-center gap-2 bg-white/70 backdrop-blur-md px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:border-blue-400 z-20"
      >
        <Info className="w-5 h-5 text-indigo-600 group-hover:text-blue-600 transition-colors duration-300" />
        <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">About Developer</span>
      </motion.button>

      {/* Top Left Logo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-4 left-4 md:top-6 md:left-6 z-30"
      >
        <img src="/logo.png" alt="Smart School Logo" className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] object-contain drop-shadow-md bg-white/60 backdrop-blur-md rounded-2xl p-2 border border-white/40" />
      </motion.div>

      {/* Header Section */}
      <div className="text-center mb-12 relative z-10 perspective-1000 mt-12 md:mt-4">

        <KineticText
          text="Govt Senior Secondary School Kadiya"
          className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 mb-6 drop-shadow-sm"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium"
        >
          Login to access your dashboard, view student progress, and manage daily activities.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 w-full max-w-4xl space-y-10"
      >
        {/* Role Selection */}
        <div>
          <label className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-8">
            <span className="bg-blue-100 p-2 rounded-xl text-blue-600"><Users className="w-6 h-6" /></span>
            Continue As
          </label>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Principal Card */}
            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onSelectRole('principal')}
              className="group flex flex-col items-center p-8 lg:p-10 bg-gradient-to-br from-white to-purple-50/50 border border-purple-100/50 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl group-hover:bg-purple-400/20 transition-colors" />
              <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(147,51,234,0.15)] transition-all duration-300 group-hover:rotate-3">
                <Building2 className="w-12 h-12 text-purple-600 transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-purple-700 transition-colors">Principal Login</h2>
              <p className="text-slate-500 font-medium text-center leading-relaxed">
                Oversee school performance and monitor student academic data directly
              </p>
            </motion.button>

            {/* Teacher Card */}
            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onSelectRole('teacher')}
              className="group flex flex-col items-center p-8 lg:p-10 bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-colors" />
              <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 group-hover:-rotate-3">
                <GraduationCap className="w-12 h-12 text-blue-600 transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">Teacher Login</h2>
              <p className="text-slate-500 font-medium text-center leading-relaxed">
                Manage your classes, assign homework, and update student records
              </p>
            </motion.button>

            {/* Parent Card */}
            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onSelectRole('parent')}
              className="group flex flex-col items-center p-8 lg:p-10 bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100/50 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors" />
              <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:rotate-3">
                <Users className="w-12 h-12 text-emerald-600 transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">Student Login</h2>
              <p className="text-slate-500 font-medium text-center leading-relaxed">
                View academic progress, AI study guides, and track performance
              </p>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
