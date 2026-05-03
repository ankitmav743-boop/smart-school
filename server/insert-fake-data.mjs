import { pool } from "./db.js";
const [[school]] = await pool.query("SELECT id FROM schools WHERE udise_code=?", ["08123456789"]);
const s1 = school.id;
const [students] = await pool.query("SELECT id, sr_number, class, school_id FROM students");

// ========== SUBJECTS PER CLASS ==========
const subjects1to5 = ["Hindi", "English", "Mathematics", "Environment", "Physical Education", "Computer Science"];
const subjects6to10 = ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit", "Physical Education", "Computer Science"];
const subjects11to12 = ["Hindi Sahitya", "Hindi Anivarya", "English", "History", "Geography", "Physical Education", "Computer Science"];

function getSubjects(cls) {
  const n = parseInt(cls);
  if (n <= 5) return subjects1to5;
  if (n <= 10) return subjects6to10;
  return subjects11to12;
}

function randomMarks(total) { return Math.floor(Math.random() * (total * 0.4) + total * 0.6); }
function getGrade(marks, total) { const pct = (marks / total) * 100; if (pct >= 90) return "A+"; if (pct >= 75) return "A"; if (pct >= 60) return "B"; if (pct >= 45) return "C"; return "D"; }
const examTypes = ["Unit Test 1", "Mid Term", "Unit Test 2", "Final Exam"];

// ========== HOMEWORK PER CLASS GROUP ==========
const homeworkList1to5 = [
  { subject: "Hindi", desc: "paath 3 ke prashn uttar likhen", days: 3 },
  { subject: "English", desc: "Write a paragraph on My School", days: 2 },
  { subject: "Mathematics", desc: "Complete exercise 5.1 from NCERT", days: 3 },
  { subject: "Environment", desc: "Apne aas-paas ke pedon ke naam likhen aur unka chitra banayein", days: 4 },
  { subject: "Physical Education", desc: "Write about the rules of Kabaddi", days: 2 },
  { subject: "Computer Science", desc: "Computer ke parts ke naam likho aur chitra banao", days: 3 },
];
const homeworkList6to10 = [
  { subject: "Hindi", desc: "paath 3 ke prashn uttar likhen", days: 3 },
  { subject: "English", desc: "Write a paragraph on My School", days: 2 },
  { subject: "Mathematics", desc: "Complete exercise 5.1 from NCERT", days: 3 },
  { subject: "Science", desc: "Draw and label the diagram of human heart", days: 4 },
  { subject: "Social Science", desc: "Mark major rivers on India map", days: 5 },
  { subject: "Sanskrit", desc: "Shlok 1 se 5 yaad karein aur likhen", days: 3 },
  { subject: "Physical Education", desc: "Kho-Kho ke niyam likhen", days: 2 },
  { subject: "Computer Science", desc: "MS Word mein ek page design karo", days: 3 },
];
const homeworkList11to12 = [
  { subject: "Hindi Sahitya", desc: "Kabir ke dohe ka bhavarth likhen", days: 3 },
  { subject: "Hindi Anivarya", desc: "Nibandh likhen - Bharat ki Sanskriti", days: 4 },
  { subject: "English", desc: "Write a critical analysis of the poem", days: 3 },
  { subject: "History", desc: "Chapter 4 ke prashn uttar likhen", days: 5 },
  { subject: "Geography", desc: "Draw and label the map of India with states", days: 4 },
  { subject: "Physical Education", desc: "Olympics ke baare mein ek nibandh likhen", days: 3 },
  { subject: "Computer Science", desc: "HTML mein ek basic webpage banao", days: 4 },
];

function getHomeworkList(cls) {
  const n = parseInt(cls);
  if (n <= 5) return homeworkList1to5;
  if (n <= 10) return homeworkList6to10;
  return homeworkList11to12;
}

// ========== EXAM SCHEDULES ==========
const examSchedule1to5 = [
  { subject: "Hindi", date: "2026-03-10", time: "10:00 AM", type: "Final Exam" },
  { subject: "English", date: "2026-03-12", time: "10:00 AM", type: "Final Exam" },
  { subject: "Mathematics", date: "2026-03-14", time: "10:00 AM", type: "Final Exam" },
  { subject: "Environment", date: "2026-03-16", time: "10:00 AM", type: "Final Exam" },
  { subject: "Physical Education", date: "2026-03-22", time: "10:00 AM", type: "Final Exam" },
  { subject: "Computer Science", date: "2026-03-24", time: "10:00 AM", type: "Final Exam" },
];
const examSchedule6to10 = [
  { subject: "Hindi", date: "2026-03-10", time: "10:00 AM", type: "Final Exam" },
  { subject: "English", date: "2026-03-12", time: "10:00 AM", type: "Final Exam" },
  { subject: "Mathematics", date: "2026-03-14", time: "10:00 AM", type: "Final Exam" },
  { subject: "Science", date: "2026-03-16", time: "10:00 AM", type: "Final Exam" },
  { subject: "Social Science", date: "2026-03-18", time: "10:00 AM", type: "Final Exam" },
  { subject: "Sanskrit", date: "2026-03-20", time: "10:00 AM", type: "Final Exam" },
  { subject: "Physical Education", date: "2026-03-22", time: "10:00 AM", type: "Final Exam" },
  { subject: "Computer Science", date: "2026-03-24", time: "10:00 AM", type: "Final Exam" },
];
const examSchedule11to12 = [
  { subject: "Hindi Sahitya", date: "2026-03-10", time: "10:00 AM", type: "Final Exam" },
  { subject: "Hindi Anivarya", date: "2026-03-12", time: "10:00 AM", type: "Final Exam" },
  { subject: "English", date: "2026-03-14", time: "10:00 AM", type: "Final Exam" },
  { subject: "History", date: "2026-03-16", time: "10:00 AM", type: "Final Exam" },
  { subject: "Geography", date: "2026-03-18", time: "10:00 AM", type: "Final Exam" },
  { subject: "Physical Education", date: "2026-03-22", time: "10:00 AM", type: "Final Exam" },
  { subject: "Computer Science", date: "2026-03-24", time: "10:00 AM", type: "Final Exam" },
];

function getExamSchedule(cls) {
  const n = parseInt(cls);
  if (n <= 5) return examSchedule1to5;
  if (n <= 10) return examSchedule6to10;
  return examSchedule11to12;
}

// ========== CLEAR OLD DATA ==========
await pool.query("DELETE FROM marks");
await pool.query("DELETE FROM homework");
await pool.query("DELETE FROM exam_timetable");

// ========== INSERT MARKS ==========
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

// ========== INSERT HOMEWORK ==========
const [teachers] = await pool.query("SELECT id, school_id, class FROM teachers");
const allClasses = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"];
const schoolTeachers = teachers.filter(t => t.school_id === s1);
for (const cls of allClasses) {
  const hwList = getHomeworkList(cls);
  for (const hw of hwList) {
    const teacher = schoolTeachers[Math.floor(Math.random() * schoolTeachers.length)];
    if (!teacher) continue;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + hw.days);
    await pool.query("INSERT INTO homework (id, school_id, teacher_id, class, subject, description, due_date) VALUES (UUID(),?,?,?,?,?,?)", [s1, teacher.id, cls, hw.subject, hw.desc, dueDate.toISOString().split("T")[0]]);
  }
}
console.log("Homework done!");

// ========== INSERT EXAM TIMETABLE ==========
for (const cls of allClasses) {
  const schedule = getExamSchedule(cls);
  for (const exam of schedule) {
    await pool.query("INSERT INTO exam_timetable (id, school_id, class, subject, exam_date, exam_time, exam_type) VALUES (UUID(),?,?,?,?,?,?)", [s1, cls, exam.subject, exam.date, exam.time, exam.type]);
  }
}
console.log("Exam timetable done!");

console.log("ALL DONE!");
process.exit(0);
