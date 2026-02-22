import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Calendar, TrendingUp, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createExamTimetable,
  createHomework,
  createMark,
  getExamTimetableByClass,
  getHomeworkByClass,
  getMarksByStudentIds,
  getStudents,
} from '../lib/api';
import { ExamTimetable, Homework, MarkWithStudentName, Student } from '../lib/types';

export function TeacherDashboard() {
  const { teacher, school, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'marks' | 'homework' | 'timetable' | 'performance'>(
    'marks'
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkWithStudentName[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [loading, setLoading] = useState(false);

  const [newMark, setNewMark] = useState({
    student_id: '',
    subject: teacher?.subject || '',
    marks: '',
    total_marks: '100',
    exam_type: 'First Test',
  });

  const [newHomework, setNewHomework] = useState({
    subject: teacher?.subject || '',
    class: teacher?.class || '',
    description: '',
    due_date: '',
  });

  const [newTimetable, setNewTimetable] = useState({
    class: teacher?.class || '',
    subject: teacher?.subject || '',
    exam_date: '',
    exam_time: '',
    exam_type: 'First Test',
  });

  const loadData = useCallback(async () => {
    if (!teacher || !school) {
      return;
    }

    setLoading(true);
    try {
      const studentsData = await getStudents(school.id, teacher.class);
      setStudents(studentsData || []);

      if (activeTab === 'marks' || activeTab === 'performance') {
        const marksData = await getMarksByStudentIds(studentsData.map((student) => student.id));
        setMarks(marksData || []);
      } else if (activeTab === 'homework') {
        const homeworkData = await getHomeworkByClass(school.id, teacher.class);
        setHomeworkList(homeworkData || []);
      } else if (activeTab === 'timetable') {
        const timetableData = await getExamTimetableByClass(school.id, teacher.class);
        setTimetables(timetableData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, school, teacher]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const calculateGrade = (marksValue: number, total: number) => {
    const percentage = (marksValue / total) * 100;
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Weak';
  };

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const grade = calculateGrade(Number(newMark.marks), Number(newMark.total_marks));
      await createMark({
        student_id: newMark.student_id,
        subject: newMark.subject,
        marks: Number(newMark.marks),
        total_marks: Number(newMark.total_marks),
        grade,
        exam_type: newMark.exam_type,
      });

      setNewMark({
        student_id: '',
        subject: teacher?.subject || '',
        marks: '',
        total_marks: '100',
        exam_type: 'Unit Test',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding marks:', error);
    }
  };

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !teacher) return;

    try {
      await createHomework({
        school_id: school.id,
        subject: newHomework.subject,
        class: newHomework.class,
        description: newHomework.description,
        due_date: newHomework.due_date,
        teacher_id: teacher.id,
      });

      setNewHomework({
        subject: teacher.subject || '',
        class: teacher.class || '',
        description: '',
        due_date: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding homework:', error);
    }
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !teacher) return;

    try {
      await createExamTimetable({
        school_id: school.id,
        class: newTimetable.class,
        subject: newTimetable.subject,
        exam_date: newTimetable.exam_date,
        exam_time: newTimetable.exam_time,
        exam_type: newTimetable.exam_type,
      });

      setNewTimetable({
        class: teacher.class || '',
        subject: teacher.subject || '',
        exam_date: '',
        exam_time: '',
        exam_type: 'Unit Test',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding timetable:', error);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'Good') return 'bg-green-500';
    if (grade === 'Average') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!teacher || !school) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-orange-200 rounded-lg shadow p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Missing</h2>
          <p className="text-gray-700">
            Teacher session load nahi hui. Please dubara login karein.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teacher Panel</h1>
            <p className="text-orange-100 mt-1">
              {teacher.name} - {teacher.subject} - {teacher.class}
            </p>
            <p className="text-orange-100 text-sm">{school.school_name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('marks')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'marks'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <BookOpen className="w-5 h-5" />
              Add Marks
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'homework'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <ClipboardList className="w-5 h-5" />
              Homework
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'timetable'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Calendar className="w-5 h-5" />
              Exam Timetable
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'performance'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              Student Performance
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 mb-6">
            Loading data...
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Marks
              </h2>
              <form onSubmit={handleAddMark} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student</label>
                  <select
                    value={newMark.student_id}
                    onChange={(e) => setNewMark({ ...newMark, student_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} (SR: {student.sr_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={newMark.subject}
                    onChange={(e) => setNewMark({ ...newMark, subject: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Marks</label>
                    <input
                      type="number"
                      value={newMark.marks}
                      onChange={(e) => setNewMark({ ...newMark, marks: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Marks</label>
                    <input
                      type="number"
                      value={newMark.total_marks}
                      onChange={(e) => setNewMark({ ...newMark, total_marks: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Type</label>
                  <select
                    value={newMark.exam_type}
                    onChange={(e) => setNewMark({ ...newMark, exam_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="First Test">First Test</option>
                    <option value="Second Test">Second Test</option>
                    <option value="Third Test">Third Test</option>
                    <option value="Half Yearly Exam">Half Yearly Exam</option>
                    <option value="Yearly Exam">Yearly Exam</option>
                    <option value="Today Class Test">Today Class Test</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add Marks
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recent Marks</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {marks.map((mark) => (
                  <div key={mark.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{mark.student_name}</p>
                        <p className="text-sm text-gray-600">{mark.subject}</p>
                      </div>
                      <span
                        className={`${getGradeColor(
                          mark.grade
                        )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                      >
                        {mark.grade}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Marks: {mark.marks}/{mark.total_marks}
                      </span>
                      <span className="text-gray-600">{mark.exam_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Homework
              </h2>
              <form onSubmit={handleAddHomework} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <input
                    type="text"
                    value={newHomework.class}
                    onChange={(e) => setNewHomework({ ...newHomework, class: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newHomework.description}
                    onChange={(e) =>
                      setNewHomework({ ...newHomework, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newHomework.due_date}
                    onChange={(e) => setNewHomework({ ...newHomework, due_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add Homework
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Homework List</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{hw.subject}</p>
                        <p className="text-sm text-gray-600">Class: {hw.class}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        Due: {new Date(hw.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{hw.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Exam Timetable
              </h2>
              <form onSubmit={handleAddTimetable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <input
                    type="text"
                    value={newTimetable.class}
                    onChange={(e) => setNewTimetable({ ...newTimetable, class: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={newTimetable.subject}
                    onChange={(e) =>
                      setNewTimetable({ ...newTimetable, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={newTimetable.exam_date}
                    onChange={(e) =>
                      setNewTimetable({ ...newTimetable, exam_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Time</label>
                  <input
                    type="time"
                    value={newTimetable.exam_time}
                    onChange={(e) =>
                      setNewTimetable({ ...newTimetable, exam_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Type</label>
                  <select
                    value={newTimetable.exam_type}
                    onChange={(e) =>
                      setNewTimetable({ ...newTimetable, exam_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="First Test">First Test</option>
                    <option value="Second Test">Second Test</option>
                    <option value="Third Test">Third Test</option>
                    <option value="Half Yearly Exam">Half Yearly Exam</option>
                    <option value="Yearly Exam">Yearly Exam</option>
                    <option value="Today Class Test">Today Class Test</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add to Timetable
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Exam Schedule</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timetables.map((tt) => (
                  <div key={tt.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{tt.subject}</p>
                        <p className="text-sm text-gray-600">Class: {tt.class}</p>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">{tt.exam_type}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{new Date(tt.exam_date).toLocaleDateString()}</span>
                      <span>{tt.exam_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Student Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const studentMarks = marks.filter((m) => m.student_id === student.id);
                    const avgMarks = studentMarks.length
                      ? studentMarks.reduce((acc, m) => acc + (m.marks / m.total_marks) * 100, 0) /
                      studentMarks.length
                      : 0;
                    const performance =
                      avgMarks >= 75 ? 'Good' : avgMarks >= 50 ? 'Average' : 'Weak';

                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 text-sm">{student.name}</td>
                        <td className="px-6 py-4 text-sm">{teacher.subject}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`${getGradeColor(
                              performance
                            )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                          >
                            {performance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{avgMarks.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
