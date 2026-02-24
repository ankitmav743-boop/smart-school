import { pool } from "./db.js";
const [[school1]] = await pool.query("SELECT id FROM schools WHERE udise_code=?", ["08123456789"]);
const [[school2]] = await pool.query("SELECT id FROM schools WHERE udise_code=?", ["08987654321"]);
const s1 = school1.id;
const s2 = school2.id;
const [students] = await pool.query("SELECT id, sr_number, class, school_id FROM students");
const subjects1st5th = ["Hindi", "English", "Mathematics", "Science", "Social Science"];
const subjects6th8th = ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit"];
const subjects9th10th = ["Hindi", "English", "Mathematics", "Science", "Social Science"];
const subjects11th12th = ["Physics", "Chemistry", "Mathematics", "English", "Computer Science"];
function getSubjects(cls) { const n = parseInt(cls); if (n <= 5) return subjects1st5th; if (n <= 8) return subjects6th8th; if (n <= 10) return subjects9th10th; return subjects11th12th; }
function randomMarks(total) { return Math.floor(Math.random() * (total * 0.4) + total * 0.6); }
function getGrade(marks, total) { const pct = (marks / total) * 100; if (pct >= 90) return "A+"; if (pct >= 75) return "A"; if (pct >= 60) return "B"; if (pct >= 45) return "C"; return "D"; }
const examTypes = ["Unit Test 1", "Mid Term", "Unit Test 2", "Final Exam"];
const homeworkList = [
  { subject: "Mathematics", desc: "Complete exercise 5.1 from NCERT", days: 3 },
  { subject: "Science", desc: "Draw and label the diagram of human heart", days: 4 },
  { subject: "English", desc: "Write a paragraph on My School", days: 2 },
  { subject: "Hindi", desc: "paath 3 ke prashn uttar likhen", days: 3 },
  { subject: "Social Science", desc: "Mark major rivers on India map", days: 5 },
];
await pool.query("DELETE FROM marks");
await pool.query("DELETE FROM homework");
await pool.query("DELETE FROM exam_timetable");
console.log("Inserting marks...");
for (const student of students) {
  const subjects = getSubjects(student.class);
  for (const examType of examTypes) {
    const total = examType === "Final Exam" ? 100 : 50;
    for (const subject of subjects) {
      const marks = randomMarks(total);
      const grade = getGrade(marks, total);
      await pool.query("INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type) VALUES (UUID(),?,?,?,?,?,?)", [student.id, subject, marks, total, grade, examType]);
    }
  }
}
console.log("Marks done!");
const [teachers] = await pool.query("SELECT id, school_id, class FROM teachers");
const classes = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"];
for (const school of [s1, s2]) {
  const schoolTeachers = teachers.filter(t => t.school_id === school);
  for (const cls of classes) {
    for (const hw of homeworkList) {
      const teacher = schoolTeachers[Math.floor(Math.random() * schoolTeachers.length)];
      if (!teacher) continue;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + hw.days);
      await pool.query("INSERT INTO homework (id, school_id, teacher_id, class, subject, description, due_date) VALUES (UUID(),?,?,?,?,?,?)", [school, teacher.id, cls, hw.subject, hw.desc, dueDate.toISOString().split("T")[0]]);
    }
  }
}
console.log("Homework done!");
const examSchedule = [
  { subject: "Mathematics", date: "2026-03-10", time: "10:00 AM", type: "Final Exam" },
  { subject: "Science", date: "2026-03-12", time: "10:00 AM", type: "Final Exam" },
  { subject: "English", date: "2026-03-14", time: "10:00 AM", type: "Final Exam" },
  { subject: "Hindi", date: "2026-03-16", time: "10:00 AM", type: "Final Exam" },
  { subject: "Social Science", date: "2026-03-18", time: "10:00 AM", type: "Final Exam" },
];
for (const school of [s1, s2]) {
  for (const cls of classes) {
    for (const exam of examSchedule) {
      await pool.query("INSERT INTO exam_timetable (id, school_id, class, subject, exam_date, exam_time, exam_type) VALUES (UUID(),?,?,?,?,?,?)", [school, cls, exam.subject, exam.date, exam.time, exam.type]);
    }
  }
}
console.log("ALL DONE!");
process.exit(0);
