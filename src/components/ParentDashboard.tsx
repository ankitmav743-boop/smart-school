import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Calendar, TrendingUp, LogOut, Award, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AiStudyAssistant } from './AiStudyAssistant';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { getExamTimetableByClass, getHomeworkByClass, getMarksByStudentId } from '../lib/api';
import { ExamTimetable, Homework, Mark } from '../lib/types';

export function ParentDashboard() {
  const { student, school, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'marks' | 'homework' | 'timetable' | 'performance' | 'ai'>(
    'performance'
  );
  const [marks, setMarks] = useState<Mark[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!student || !school) {
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'marks' || activeTab === 'performance') {
        const marksData = await getMarksByStudentId(student.id);
        setMarks(marksData || []);
      }

      if (activeTab === 'homework') {
        const homeworkData = await getHomeworkByClass(school.id, student.class);
        setHomeworkList(homeworkData || []);
      }

      if (activeTab === 'timetable') {
        const timetableData = await getExamTimetableByClass(school.id, student.class);
        setTimetables(timetableData || []);
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
    if (grade === 'Good') return 'bg-green-500';
    if (grade === 'Average') return 'bg-yellow-500';
    return 'bg-red-500';
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
      // Keep oldest date just in case
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-green-200 rounded-lg shadow p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Missing</h2>
          <p className="text-gray-700">
            Parent session load nahi hui. Please dubara login karein.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Parent Portal</h1>
            <p className="text-green-100 mt-1">
              Student: {student.name} - Class {student.class}
            </p>
            <p className="text-green-100 text-sm">{school.school_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={student.id} />
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'performance'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              Performance
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'marks'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <BookOpen className="w-5 h-5" />
              Marks
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'homework'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <ClipboardList className="w-5 h-5" />
              Homework
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'timetable'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Calendar className="w-5 h-5" />
              Exam Timetable
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'ai'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50 rounded-tr-lg'
                : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'
                }`}
            >
              <Sparkles className="w-5 h-5" />
              AI Guide
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6">
            Loading data...
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
                  <p className="text-green-100">
                    {student.name} is performing{' '}
                    {overallAverage >= 75
                      ? 'excellently'
                      : overallAverage >= 50
                        ? 'satisfactorily'
                        : 'needs improvement'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">{overallAverage.toFixed(1)}%</div>
                  <div className="text-green-100 mt-1">Average Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Progress Timeline
              </h2>
              {getProgressData().length > 0 ? (
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getProgressData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#4b5563' }} />
                      <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#4b5563' }} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'Average Score']}
                      />
                      <Line type="monotone" dataKey="average" stroke="#16a34a" strokeWidth={4} dot={{ fill: '#16a34a', r: 6, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  Not enough data to display progress graph.
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                Subject-wise Performance
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overallPerformance.map((perf) => (
                  <div key={perf.subject} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{perf.subject}</h3>
                      <span
                        className={`${getGradeColor(
                          perf.grade
                        )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                      >
                        {perf.grade}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{perf.average.toFixed(1)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className={`${getGradeColor(perf.grade)} h-2 rounded-full transition-all`}
                        style={{ width: `${perf.average}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">All Marks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Exam Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marks.map((mark) => (
                    <tr key={mark.id}>
                      <td className="px-6 py-4 text-sm font-medium">{mark.subject}</td>
                      <td className="px-6 py-4 text-sm">{mark.exam_type}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {mark.marks}/{mark.total_marks}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {((mark.marks / mark.total_marks) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${getGradeColor(
                            mark.grade
                          )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                        >
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(mark.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Homework Assignments</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{hw.subject}</h3>
                      <p className="text-sm text-gray-600">Class: {hw.class}</p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Due: {new Date(hw.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{hw.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Assigned: {new Date(hw.assigned_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Exam Timetable</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Exam Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timetables.map((tt) => (
                    <tr key={tt.id}>
                      <td className="px-6 py-4 text-sm font-medium">{tt.subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {tt.exam_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {new Date(tt.exam_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{tt.exam_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto mt-6">
            <AiStudyAssistant studentId={student.id} studentName={student.name} />
          </div>
        )}
      </div>
    </div>
  );
}
