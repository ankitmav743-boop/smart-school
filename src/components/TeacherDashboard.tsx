import { useCallback, useEffect, useState } from 'react';
import { LogOut, ArrowLeft, Users, BookOpen, Star, Send, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createHomework, createMark, getMarksByStudentIds, getStudents } from '../lib/api';
import { MarkWithStudentName, Student } from '../lib/types';

const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

// Framer Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function TeacherDashboard() {
  const { teacher, school, logout } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkWithStudentName[]>([]);
  const [loading, setLoading] = useState(false);

  // Homework state
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState('');

  // Mark/Eval Modal state
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'Marks' | 'Weekly'>('Marks');
  const [markValue, setMarkValue] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [examType, setExamType] = useState('First Test');

  const loadData = useCallback(async () => {
    if (!teacher || !school || !selectedClass) return;
    setLoading(true);
    try {
      const studentsData = await getStudents(school.id, selectedClass);
      setStudents(studentsData || []);
      if (studentsData && studentsData.length > 0) {
        const marksData = await getMarksByStudentIds(studentsData.map((s) => s.id));
        setMarks(marksData || []);
      } else {
        setMarks([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [school, teacher, selectedClass]);

  useEffect(() => {
    if (selectedClass) void loadData();
  }, [selectedClass, loadData]);

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !teacher || !selectedClass) return;
    try {
      await createHomework({
        school_id: school.id,
        subject: teacher.subject || 'General',
        class: selectedClass,
        description: homeworkDescription,
        due_date: homeworkDueDate,
        teacher_id: teacher.id,
      });
      setHomeworkDescription('');
      setHomeworkDueDate('');
      alert('Homework assigned to the entire class successfully!');
    } catch (error) {
      console.error('Error adding homework:', error);
      alert('Failed to assign homework');
    }
  };

  const calculateGrade = (marksValue: number, total: number) => {
    const percentage = (marksValue / total) * 100;
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Weak';
  };

  const handleSubmitMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentId || !teacher) return;
    try {
      const m = Number(markValue);
      const t = modalType === 'Weekly' ? 10 : Number(totalMarks);
      await createMark({
        student_id: activeStudentId,
        subject: teacher.subject || 'General',
        marks: m,
        total_marks: t,
        grade: calculateGrade(m, t),
        exam_type: modalType === 'Weekly' ? 'Weekly Evaluation' : examType,
      });
      setActiveStudentId(null);
      await loadData();
    } catch (error) {
      console.error('Error adding marks:', error);
      alert('Failed to add evaluation');
    }
  };

  if (!teacher || !school) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">

      {/* Sticky Premium Header */}
      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center transform rotate-3">
              <LayoutDashboard className="w-5 h-5 text-white transform -rotate-3" />
            </div>
            <div>
              <h1 className="text-xl font-black">{teacher.name}</h1>
              <p className="text-xs font-bold text-blue-400 tracking-wider uppercase">{teacher.subject}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition font-bold text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!selectedClass ? (
            <motion.div key="class-selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Class Directory</h2>
                <p className="text-slate-500 font-medium">Select a class to manage records and assignments.</p>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {CLASSES.map((cls) => (
                  <motion.button
                    variants={cardVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-6 flex flex-col items-center gap-4 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    <div className="bg-slate-50 p-4 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <Users className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="text-lg font-black text-slate-700">Class {cls}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedClass('')} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-3xl font-black text-slate-800">Class {selectedClass} Dashboard</h2>
                </div>
              </div>

              {/* Homework Form - Parallax Card Style */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl" />
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                  <Send className="w-5 h-5 text-blue-500" /> Dispatch Homework
                </h3>
                <form onSubmit={handleAddHomework} className="flex flex-col md:flex-row gap-4 relative z-10">
                  <input
                    type="text" placeholder="Add descriptive homework details..."
                    value={homeworkDescription} onChange={(e) => setHomeworkDescription(e.target.value)}
                    className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium bg-slate-50" required
                  />
                  <input
                    type="date" value={homeworkDueDate} onChange={(e) => setHomeworkDueDate(e.target.value)}
                    className="px-5 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium bg-slate-50" required
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group">
                    <span className="relative z-10">Assign</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </button>
                </form>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-6">Student Roster ({students.length})</h3>

              {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-6">
                  {students.map((student) => {
                    const studentMarks = marks.filter((m) => m.student_id === student.id).slice(0, 3);
                    return (
                      <motion.div variants={cardVariants} key={student.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-black text-xl text-slate-800 mb-1">{student.name}</h4>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">SR: {student.sr_number}</span>
                          </div>
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-lg">
                            {student.name.charAt(0)}
                          </div>
                        </div>

                        <div className="flex-grow mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Recent Grades</p>
                          {studentMarks.length > 0 ? (
                            <div className="space-y-3">
                              {studentMarks.map((m) => (
                                <div key={m.id} className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                  <span className="font-bold text-slate-600 text-sm truncate mr-4">{m.exam_type}</span>
                                  <span className="font-black text-slate-800 text-sm bg-slate-100 px-2 py-1 rounded-lg">{m.marks}/{m.total_marks}</span>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-sm font-medium text-slate-400 italic">No grade records.</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <button onClick={() => { setActiveStudentId(student.id); setModalType('Marks'); setMarkValue(''); setTotalMarks('100'); }} className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-3 rounded-xl transition-colors">
                            <BookOpen className="w-4 h-4" /> Exam Mark
                          </button>
                          <button onClick={() => { setActiveStudentId(student.id); setModalType('Weekly'); setMarkValue(''); }} className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold py-3 rounded-xl transition-colors">
                            <Star className="w-4 h-4" /> Weekly Eval
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {activeStudentId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  {modalType === 'Marks' ? <><BookOpen className="text-indigo-500" /> Log Exam Mark</> : <><Star className="text-emerald-500" /> Weekly Rating</>}
                </h3>
                <form onSubmit={handleSubmitMark} className="space-y-5">
                  {modalType === 'Marks' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Exam Type</label>
                      <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl outline-none font-bold bg-slate-50">
                        <option value="First Test">First Test</option><option value="Half Yearly Exam">Half Yearly</option><option value="Yearly Exam">Finals</option>
                      </select>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2">{modalType === 'Weekly' ? 'Rating (/10)' : 'Score'}</label>
                      <input type="number" value={markValue} onChange={(e) => setMarkValue(e.target.value)} className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl outline-none font-black text-xl text-center" required />
                    </div>
                    {modalType === 'Marks' && (
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-600 mb-2">Total</label>
                        <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl outline-none font-black text-xl text-center bg-slate-50" required />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setActiveStudentId(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button type="submit" className={`flex-1 py-4 font-bold text-white rounded-xl shadow-lg ${modalType === 'Marks' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>Save Record</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
