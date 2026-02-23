import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, GraduationCap, ArrowLeft, BarChart2, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudents, getMarksByStudentIds, Student, MarkWithStudentName } from '../lib/api';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function PrincipalDashboard() {
    const { principal, logout } = useAuth();
    const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<MarkWithStudentName[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadClassData() {
            if (!principal || !selectedClass) return;
            setLoading(true);
            try {
                const classStudents = await getStudents(principal.id, selectedClass);
                setStudents(classStudents);
                if (classStudents.length > 0) {
                    const studentIds = classStudents.map(s => s.id);
                    const classMarks = await getMarksByStudentIds(studentIds);
                    setMarks(classMarks);
                } else {
                    setMarks([]);
                }
            } catch (err) {
                console.error('Failed to load class data', err);
            } finally {
                setLoading(false);
            }
        }
        loadClassData();
    }, [principal, selectedClass]);

    const getClassAverages = () => {
        const map = new Map<string, { total: number; count: number }>();
        marks.forEach(m => {
            const perc = (m.marks / m.total_marks) * 100;
            if (!map.has(m.subject)) map.set(m.subject, { total: 0, count: 0 });
            const curr = map.get(m.subject)!;
            curr.total += perc;
            curr.count += 1;
        });
        return Array.from(map.entries()).map(([subject, data]) => ({
            subject,
            average: Number((data.total / data.count).toFixed(1))
        }));
    };

    if (!selectedClass) {
        return (
            <div className="min-h-screen bg-[#faf5ff] selection:bg-purple-200 font-sans">
                <nav className="bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-200">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-xl text-slate-800">Principal Directory</h1>
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{principal?.school_name}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-4 py-2.5 rounded-xl font-bold transition-colors">
                            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 py-12 relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/50 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200/40 rounded-full blur-[100px] pointer-events-none" />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center relative z-10">
                        <h2 className="text-4xl font-black text-slate-800 mb-2">School Demographics</h2>
                        <p className="text-slate-500 font-medium">Select a class to view deep student analytics and roster performance.</p>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 relative z-10">
                        {classes.map((className) => (
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                key={className}
                                onClick={() => setSelectedClass(className)}
                                className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-[0_20px_40px_rgba(147,51,234,0.1)] border border-purple-50 flex flex-col items-center justify-center transition-all duration-300"
                            >
                                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6 text-purple-600">
                                    <Users className="w-10 h-10 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 group-hover:text-purple-700 transition-colors">Class {className}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">View Data</p>
                            </motion.button>
                        ))}
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf5ff] selection:bg-purple-200 font-sans">
            <nav className="bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedClass(null)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </motion.button>
                        <div>
                            <h1 className="font-black text-xl text-slate-800">Class {selectedClass} Protocol</h1>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{principal?.school_name}</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-[60vh]">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Student Roster (Left Rail) */}
                            <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-purple-50 flex flex-col h-[600px]">
                                <div className="bg-purple-50/50 p-6 border-b border-purple-100 flex items-center justify-between">
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-600" /> Administrative Roster
                                    </h2>
                                    <span className="bg-white text-purple-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm border border-purple-100 uppercase tracking-widest">
                                        {students.length} Total
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
                                    {students.length === 0 ? (
                                        <p className="p-8 text-slate-400 text-center font-medium">Class completely empty.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {students.map(student => (
                                                <motion.div whileHover={{ scale: 1.02 }} key={student.id} className="p-4 bg-slate-50/50 hover:bg-purple-50/80 rounded-2xl flex justify-between items-center group cursor-pointer border border-transparent hover:border-purple-100 transition-colors">
                                                    <div>
                                                        <p className="font-black text-slate-800 group-hover:text-purple-700 transition-colors">{student.name}</p>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">SR: {student.sr_number}</p>
                                                    </div>
                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-sm">
                                                        <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <div className="lg:col-span-2 space-y-8">
                                {/* Bar Chart */}
                                <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-50 p-6 md:p-8">
                                    <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                        <div className="bg-fuchsia-100 p-2 rounded-xl">
                                            <BarChart2 className="w-5 h-5 text-fuchsia-600" />
                                        </div>
                                        Class Master Analytics
                                    </h2>
                                    {marks.length === 0 ? (
                                        <div className="text-center py-16 text-slate-400"><p className="font-medium text-lg">No examination data populated yet.</p></div>
                                    ) : (
                                        <div className="h-80 w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={getClassAverages()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                    <defs>
                                                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#9333ea" stopOpacity={0.9} />
                                                            <stop offset="100%" stopColor="#c084fc" stopOpacity={0.4} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="subject" tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: '#faf5ff' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }} formatter={(value: any) => [`${value}%`, 'Class Avg']} />
                                                    <Bar dataKey="average" fill="url(#colorAvg)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Exam Log */}
                                <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-purple-50">
                                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-xl">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Global Examination Feed
                                    </h2>
                                    {marks.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400"><p className="font-medium">No records found.</p></div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {marks.map(mark => (
                                                <motion.div whileHover={{ scale: 1.01 }} key={mark.id} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-black text-slate-800 text-lg">{mark.student_name}</h3>
                                                            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest">{mark.exam_type}</span>
                                                        </div>
                                                        <p className="text-slate-500 font-bold text-sm tracking-wide flex items-center gap-2">
                                                            {mark.subject}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between sm:justify-end items-center gap-6 mt-4 sm:mt-0">
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
                                                            <p className="text-2xl font-black text-slate-800 leading-none">{mark.marks}<span className="text-base text-slate-400">/{mark.total_marks}</span></p>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-xl font-black tracking-widest uppercase text-sm ${mark.grade === 'Good' || mark.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : mark.grade === 'Average' || mark.grade === 'B' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {mark.grade}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}
