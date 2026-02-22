import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, GraduationCap, ArrowLeft, BarChart2, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudents, getMarksByStudentIds, Student, MarkWithStudentName } from '../lib/api';

export function PrincipalDashboard() {
    const { principal, logout } = useAuth();

    // We'll hardcode the standard 1st to 12th classes conceptually, or derived from data.
    // For this hackathon, we assume 1st through 12th depending on the school config.
    const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<MarkWithStudentName[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch student and mark data when a class is clicked
    useEffect(() => {
        async function loadClassData() {
            if (!principal || !selectedClass) return;

            setLoading(true);
            setError('');
            try {
                const classStudents = await getStudents(principal.id, selectedClass);
                setStudents(classStudents);

                if (classStudents.length > 0) {
                    const studentIds = classStudents.map(s => s.id);
                    const classMarks = await getMarksByStudentIds(studentIds);
                    setMarks(classMarks);
                } else {
                    setMarks([]); // no students means no marks
                }
            } catch (err) {
                setError('Failed to load class data');
                console.error(err);
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

    // View: Selecting a class
    if (!selectedClass) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-indigo-600 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-8 h-8" />
                                <div>
                                    <h1 className="font-bold text-xl">Principal Dashboard</h1>
                                    <p className="text-sm text-indigo-200">{principal?.school_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-700 rounded-lg transition"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 animate-[fade-in-down_0.5s_ease-out]">
                        <h2 className="text-2xl font-bold text-gray-800">Class Overview</h2>
                        <p className="text-gray-600">Select a class to view detailed student analytics.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-[fade-in-up_0.8s_ease-out]">
                        {classes.map((className) => (
                            <button
                                key={className}
                                onClick={() => setSelectedClass(className)}
                                className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border-t-4 border-indigo-500 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                                    <Users className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Class {className}</h3>
                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                    <BarChart2 className="w-4 h-4" /> View Analytics
                                </p>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // View: Detailed Class Analytics
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-indigo-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-indigo-700 rounded-full transition">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="font-bold text-xl">Class {selectedClass} Analytics</h1>
                                <p className="text-sm text-indigo-200">{principal?.school_name}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-700 rounded-lg transition"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 shadow-sm">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Student Roster */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-[fade-in-up_0.5s_ease-out]">
                            <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Student Roster
                                </h2>
                                <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {students.length} Total
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {students.length === 0 ? (
                                    <p className="p-6 text-gray-500 text-center">No students registered in this class.</p>
                                ) : (
                                    students.map(student => (
                                        <div key={student.id} className="p-4 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center group">
                                            <div>
                                                <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition">{student.name}</p>
                                                <p className="text-sm text-gray-500">SR: {student.sr_number}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition">
                                                <GraduationCap className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Class Performance (Recharts) */}
                        <div className="lg:col-span-2 space-y-6 animate-[fade-in-up_0.6s_ease-out]">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <BarChart2 className="w-6 h-6 text-indigo-600" /> Class Performance Analytics
                                </h2>
                                {marks.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">No data available for analytics.</p>
                                    </div>
                                ) : (
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={getClassAverages()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="subject" tick={{ fill: '#4b5563' }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} tick={{ fill: '#4b5563' }} axisLine={false} tickLine={false} label={{ value: 'Avg %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#eff6ff' }}
                                                    contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`${value}%`, 'Average Score']}
                                                />
                                                <Bar dataKey="average" fill="url(#colorAvg)" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Academic Performance (Marks feed) */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-[fade-in-up_0.7s_ease-out]">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-indigo-600" /> Recent Examinations
                                </h2>
                                {marks.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No examination records found for this class.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {marks.map(mark => (
                                            <div key={mark.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                                <div className="mb-4 sm:mb-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-bold text-gray-900 text-lg">{mark.student_name}</h3>
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md font-semibold">{mark.exam_type}</span>
                                                    </div>
                                                    <p className="text-gray-600 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" /> {mark.subject}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500 font-medium lowercase capitalize">score</p>
                                                        <p className="text-2xl font-black text-indigo-600">{mark.marks}<span className="text-lg text-gray-400 font-normal">/{mark.total_marks}</span></p>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-lg font-bold ${mark.grade === 'Good' || mark.grade === 'A' ? 'bg-green-100 text-green-700' :
                                                        mark.grade === 'Average' || mark.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {mark.grade}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
