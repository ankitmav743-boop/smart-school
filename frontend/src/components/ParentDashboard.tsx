import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Calendar, TrendingUp, LogOut, Award, Sparkles, User, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { AiStudyAssistant } from './AiStudyAssistant';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { getExamTimetableByClass, getHomeworkByClass, getMarksByStudentId } from '../lib/api';
import { ExamTimetable, Homework, Mark } from '../lib/types';

// Skeleton Loading Components
const SkeletonGraph = () => (
  <div className="animate-pulse flex flex-col items-center justify-center h-72 bg-gray-100 rounded-xl border border-gray-200 w-full mt-4">
    <div className="w-11/12 h-4/5 bg-gray-200 rounded-lg"></div>
  </div>
);

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="bg-gray-200 h-2 rounded-full w-1/2"></div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="h-12 bg-gray-50 border-b border-gray-100"></div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex justify-between p-4 border-b border-gray-50">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
      </div>
    ))}
  </div>
);

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { type: "tween", ease: "anticipate", duration: 0.4 }
};

export function ParentDashboard() {
  const { student, school, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'performance' | 'marks' | 'homework' | 'timetable' | 'ai'>(
    'performance'
  );
  const [marks, setMarks] = useState<Mark[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!student || !school) return;

    setLoading(true);
    // Artificially extend loading very slightly (400ms) so skeleton loader is appreciated
    const wait = new Promise(resolve => setTimeout(resolve, 400));

    try {
      if (activeTab === 'marks' || activeTab === 'performance') {
        const [marksData] = await Promise.all([getMarksByStudentId(student.id), wait]);
        setMarks(marksData || []);
      } else if (activeTab === 'homework') {
        const [homeworkData] = await Promise.all([getHomeworkByClass(school.id, student.class), wait]);
        setHomeworkList(homeworkData || []);
      } else if (activeTab === 'timetable') {
        const [timetableData] = await Promise.all([getExamTimetableByClass(school.id, student.class), wait]);
        setTimetables(timetableData || []);
      } else {
        await wait; // Just for AI tab switch feeling
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, school, student]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getGradeColor = (grade: string) => {
    if (grade === 'Good') return 'bg-emerald-500';
    if (grade === 'Average') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const calculateSubjectPerformance = () => {
    const subjectMap = new Map<string, { total: number; count: number }>();

    marks.forEach((mark) => {
      const percentage = (mark.marks / mark.total_marks) * 100;
      if (!subjectMap.has(mark.subject)) {
        subjectMap.set(mark.subject, { total: 0, count: 0 });
      }
      const current = subjectMap.get(mark.subject)!;
      current.total += percentage;
      current.count += 1;
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      average: data.total / data.count,
      grade: data.total / data.count >= 75 ? 'Good' : data.total / data.count >= 50 ? 'Average' : 'Weak',
    }));
  };

  const overallPerformance = calculateSubjectPerformance();
  const overallAverage = overallPerformance.length
    ? overallPerformance.reduce((acc, curr) => acc + curr.average, 0) / overallPerformance.length
    : 0;

  const getProgressData = () => {
    const examMap = new Map<string, { total: number; count: number; date: Date }>();
    marks.forEach((mark) => {
      const percentage = (mark.marks / mark.total_marks) * 100;
      if (!examMap.has(mark.exam_type)) {
        examMap.set(mark.exam_type, { total: 0, count: 0, date: new Date(mark.created_at) });
      }
      const current = examMap.get(mark.exam_type)!;
      current.total += percentage;
      current.count += 1;
      if (new Date(mark.created_at) < current.date) {
        current.date = new Date(mark.created_at);
      }
    });

    return Array.from(examMap.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([examName, data]) => ({
        name: examName,
        average: Number((data.total / data.count).toFixed(1)),
      }));
  };

  if (!student || !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600">Please login again to access student records.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'performance', icon: TrendingUp, label: 'Performance', color: 'text-emerald-600' },
    { id: 'marks', icon: BookOpen, label: 'Marks History', color: 'text-teal-600' },
    { id: 'homework', icon: ClipboardList, label: 'Homework', color: 'text-cyan-600' },
    { id: 'timetable', icon: Calendar, label: 'Exams', color: 'text-sky-600' },
    { id: 'ai', icon: Sparkles, label: 'AI Guide', color: 'text-purple-600' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-teal-200">

      {/* Sticky Parallax Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md p-1 flex items-center justify-center">
              <img src="/logo.png" alt="EduVantage Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Student Portal</h1>
              <p className="text-sm font-medium text-emerald-600">{school.school_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell userId={student.id} />
            <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-4 py-2 rounded-xl transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Summary Card (Parallax Scroll Effect) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-teal-100 font-medium tracking-wide uppercase text-sm">Active Student Profile</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">{student.name}</h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/20">
                  <GraduationCap className="w-4 h-4" /> Class: {student.class}
                </span>
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/20">
                  SR: {student.sr_number}
                </span>
              </div>
            </div>

            {/* Dashboard Mini-Stat */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[160px]">
              <p className="text-teal-100 font-medium text-sm mb-1">Overall Average</p>
              <p className="text-4xl font-bold">{overallAverage.toFixed(1)}<span className="text-xl text-teal-200">%</span></p>
            </div>
          </div>
        </motion.div>

        {/* Staggered Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 p-1">
          <div className="flex overflow-x-auto hide-scrollbar snap-x">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap snap-center min-w-[150px] flex-1 rounded-xl
                    ${isActive ? tab.color : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? '' : 'opacity-70'}`} />
                  {tab.label}
                  {/* Glassmorphic Active Indicator Tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-slate-100 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area with AnimatePresence for smooth switching */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...pageTransition}
            className="min-h-[400px]"
          >
            {activeTab === 'performance' && (
              <div className="space-y-8">
                {/* Graph Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-emerald-500 bg-emerald-50 p-1 rounded-lg" />
                    Progress Timeline
                  </h2>
                  {loading ? (
                    <SkeletonGraph />
                  ) : getProgressData().length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-80 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getProgressData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 600, color: '#334155' }}
                            formatter={(value: any) => [`${value}%`, 'Score']}
                          />
                          <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={5} dot={{ fill: '#10b981', r: 6, strokeWidth: 3, stroke: 'white' }} activeDot={{ r: 9, strokeWidth: 0 }} animationDuration={1500} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-medium text-lg">No exam data available for timeline.</p>
                    </div>
                  )}
                </div>

                {/* Subject Cards Section with Card Flip / Hover Scale logic */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-teal-500 bg-teal-50 p-1 rounded-lg" />
                    Subject Mastery
                  </h2>

                  {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {overallPerformance.map((perf) => (
                        <motion.div
                          key={perf.subject}
                          variants={itemVariants}
                          whileHover={{ scale: 1.03, y: -5 }}
                          className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-xl text-slate-800">{perf.subject}</h3>
                            <span className={`${getGradeColor(perf.grade)} text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm`}>
                              {perf.grade}
                            </span>
                          </div>
                          <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-black text-slate-800">{perf.average.toFixed(1)}</span>
                            <span className="text-slate-400 font-bold mb-1">% AVG</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${perf.average}%` }}
                              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                              className={`${getGradeColor(perf.grade)} h-full rounded-full`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-cyan-500 bg-cyan-50 p-1 rounded-lg" />
                    Detailed Marks History
                  </h2>
                </div>
                {loading ? <SkeletonTable /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                          <th className="p-4 pl-8">Subject</th>
                          <th className="p-4">Exam Type</th>
                          <th className="p-4">Score</th>
                          <th className="p-4">Grade</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-center bg-emerald-50">Total</th>
                        </tr>
                      </thead>
                      <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                        {marks.map((mark, idx) => (
                          <motion.tr
                            variants={itemVariants}
                            key={mark.id}
                            className={`border-b border-slate-100 hover:bg-teal-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                          >
                            <td className="p-4 pl-8 font-bold text-slate-800">{mark.subject}</td>
                            <td className="p-4 text-slate-600 font-medium">{mark.exam_type}</td>
                            <td className="p-4">
                              <span className="font-bold text-slate-800">{mark.marks}</span>
                              <span className="text-slate-400">/{mark.total_marks}</span>
                              <span className="ml-2 text-sm text-slate-500 font-medium hidden sm:inline-block">({((mark.marks / mark.total_marks) * 100).toFixed(0)}%)</span>
                            </td>
                            <td className="p-4">
                              <span className={`${getGradeColor(mark.grade)} text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase`}>
                                {mark.grade}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-medium text-sm">
                              {new Date(mark.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="p-4 text-center bg-emerald-50">
                              <span className="font-black text-emerald-700">{mark.marks}</span>
                              <span className="text-emerald-400 text-xs">/{mark.total_marks}</span>
                              <span className="ml-1 text-xs font-bold text-emerald-600">({((mark.marks / mark.total_marks) * 100).toFixed(0)}%)</span>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'homework' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-sky-500 bg-sky-50 p-1 rounded-lg" />
                  Active Assignments
                </h2>
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
                    {homeworkList.map((hw) => (
                      <motion.div
                        variants={itemVariants}
                        key={hw.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group"
                      >
                        {/* Decorative side accent */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500 rounded-l-3xl"></div>

                        <div className="flex justify-between items-start mb-4 pl-2">
                          <div>
                            <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1 block">Subject</span>
                            <h3 className="font-black text-xl text-slate-800">{hw.subject}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Due Date</span>
                            <span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-sky-100">
                              {new Date(hw.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl mb-4 ml-2 border border-slate-100">
                          {hw.description}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold text-right">
                          Assigned: {new Date(hw.assigned_date).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                    {homeworkList.length === 0 && (
                      <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                        <p className="text-slate-500 font-medium text-lg">No pending homework right now! 🎉</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'timetable' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-indigo-500 bg-indigo-50 p-1 rounded-lg" />
                  Upcoming Exams
                </h2>
                {loading ? <SkeletonTable /> : (
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {timetables.map((tt) => (
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        key={tt.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden"
                      >
                        {/* Fake 3D fold corner */}
                        <div className="absolute top-0 right-0 border-[20px] border-slate-100 border-t-white border-r-white rounded-bl-xl shadow-sm"></div>

                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                          <Calendar className="w-8 h-8 text-indigo-600 transform -rotate-3" />
                        </div>

                        <h3 className="font-black text-2xl text-slate-800 mb-1">{tt.subject}</h3>
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-xs tracking-wider uppercase mb-6">
                          {tt.exam_type}
                        </span>

                        <div className="w-full bg-slate-50 rounded-2xl p-4 flex justify-around border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                            <p className="font-bold text-slate-700">
                              {new Date(tt.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="w-px bg-slate-200"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                            <p className="font-bold text-slate-700">{tt.exam_time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                  <Sparkles className="w-10 h-10 mb-4 text-purple-200 animate-pulse" />
                  <h2 className="text-3xl font-black mb-2">Personal AI Guide</h2>
                  <p className="text-purple-100 text-lg font-medium">Getting customized study advice based on recent performance scores.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <AiStudyAssistant studentId={student.id} studentName={student.name} />
                </div>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}
