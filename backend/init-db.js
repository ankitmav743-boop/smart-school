/**
 * Initialize MySQL database: create DB, tables, and seed multi-tenant data.
 * Run: npm run db:init
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const host = process.env.MYSQL_HOST ?? 'localhost';
const port = Number(process.env.MYSQL_PORT ?? 3306) || 3306;
const user = process.env.MYSQL_USER ?? 'root';
const password = process.env.MYSQL_PASSWORD ?? '';
const database = process.env.MYSQL_DATABASE ?? 'school_portal';

const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

// Array of common authentic Indian names
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Rishi', 'Ananya', 'Diya', 'Suhana', 'Pari', 'Avni', 'Aadhya', 'Khushi', 'Neha', 'Riya', 'Aarti', 'Anjali', 'Kunal', 'Rohan', 'Sneha', 'Simran', 'Pooja', 'Vikram', 'Siddharth', 'Nisha', 'Rahul', 'Anita', 'Sunil', 'Meena', 'Rakesh', 'Suresh', 'Kiran', 'Deepak', 'Geeta', 'Vijay', 'Seema', 'Rajesh', 'Preeti', 'Sanjay', 'Mukesh', 'Renu'];
const lastNames = ['Sharma', 'Verma', 'Singh', 'Patel', 'Kumar', 'Kapoor', 'Chauhan', 'Mehta', 'Gupta', 'Jain', 'Bansal', 'Agarwal', 'Yadav', 'Mishra', 'Reddy', 'Das', 'Roy', 'Sen', 'Srivastava', 'Choudhary', 'Rathore', 'Rajput', 'Joshi', 'Trivedi', 'Pandey', 'Dubey', 'Tiwari', 'Shukla', 'Bhatt', 'Nair', 'Menon', 'Pillai', 'Rao', 'Gowda', 'Naidu', 'Iyer', 'Desai', 'Kulkarni', 'Deshmukh', 'Joshi', 'Patil', 'Kadam', 'Bhosale', 'Pawar', 'More', 'Gaikwad', 'Shinde', 'Jadhav', 'Kale', 'Wagh'];

function getRandomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function generateStudents(prefix, countPerClass) {
  let students = [];
  let srCounter = parseInt(prefix + '001');

  // To ensure uniqueness, keep tracking names
  const assignedNames = new Set();

  classes.forEach(cls => {
    for (let i = 0; i < countPerClass; i++) {

      let fullName = getRandomName();
      while (assignedNames.has(fullName)) {
        fullName = getRandomName();
      }
      assignedNames.add(fullName);

      students.push({
        srNumber: srCounter.toString(),
        name: fullName,
        classValue: cls,
        email: 'ankitmav743@gmail.com',
        password: '331022@aman'
      });
      srCounter++;
    }
  });
  return students;
}

const seedSchools = [
  {
    school: {
      principalName: 'Shri Vinod Dhobi',
      udiseCode: '08123456789',
      schoolName: 'Govt. Senior Secondary School, Churu',
    },
    teachers: [
      {
        teacherId: 'T101',
        name: 'Manish Sain',
        subject: 'Computer Science',
        classValue: '11th',
        password: 'password123',
      },
      {
        teacherId: 'T102',
        name: 'Sunita Sharma',
        subject: 'Mathematics',
        classValue: '10th',
        password: 'password123',
      },
    ],
    students: generateStudents('1', 5)
  },
  {
    school: {
      principalName: 'Mrs. Anita Desai',
      udiseCode: '08987654321',
      schoolName: 'City Public School, Jaipur',
    },
    teachers: [
      {
        teacherId: 'T201',
        name: 'Ramesh Patel',
        subject: 'Physics',
        classValue: '12th',
        password: 'password123',
      },
      {
        teacherId: 'T202',
        name: 'Kavita Verma',
        subject: 'English',
        classValue: '9th',
        password: 'password123',
      },
    ],
    students: generateStudents('2', 5)
  },
  {
    school: {
      principalName: 'Dr. R.K. Meena',
      udiseCode: '08555555555',
      schoolName: 'Adarsh Vidya Mandir, Sikar',
    },
    teachers: [
      {
        teacherId: 'T301',
        name: 'Suresh Choudhary',
        subject: 'Hindi',
        classValue: '8th',
        password: 'password123',
      }
    ],
    students: generateStudents('3', 5)
  }
];

async function ensureSchool(conn, school) {
  const [rows] = await conn.query(`SELECT id FROM schools WHERE udise_code = ? LIMIT 1`, [
    school.udiseCode,
  ]);
  if (rows.length) return rows[0].id;

  const id = school.id || 'UUID()';
  const query = school.id
    ? `INSERT INTO schools (id, principal_name, udise_code, school_name, password) VALUES (?, ?, ?, ?, ?)`
    : `INSERT INTO schools (id, principal_name, udise_code, school_name, password) VALUES (UUID(), ?, ?, ?, ?)`;

  const params = school.id
    ? [id, school.principalName, school.udiseCode, school.schoolName, '331022']
    : [school.principalName, school.udiseCode, school.schoolName, '331022'];

  await conn.query(query, params);

  const [createdRows] = await conn.query(`SELECT id FROM schools WHERE udise_code = ? LIMIT 1`, [
    school.udiseCode,
  ]);
  return createdRows[0]?.id;
}

async function ensureTeacher(conn, schoolId, teacher) {
  const [rows] = await conn.query(
    `SELECT id FROM teachers WHERE teacher_id = ? AND school_id = ? LIMIT 1`,
    [teacher.teacherId, schoolId]
  );

  if (rows.length) {
    const teacherId = rows[0].id;
    await conn.query(
      `UPDATE teachers
       SET name = ?, subject = ?, \`class\` = ?, password = ?
       WHERE id = ?`,
      [
        teacher.name,
        teacher.subject,
        teacher.classValue,
        teacher.password,
        teacherId,
      ]
    );
    return teacherId;
  }

  await conn.query(
    `INSERT INTO teachers (id, teacher_id, name, subject, \`class\`, school_id, password)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [
      teacher.teacherId,
      teacher.name,
      teacher.subject,
      teacher.classValue,
      schoolId,
      teacher.password,
    ]
  );

  const [createdRows] = await conn.query(
    `SELECT id FROM teachers WHERE teacher_id = ? AND school_id = ? LIMIT 1`,
    [teacher.teacherId, schoolId]
  );
  return createdRows[0]?.id;
}

async function ensureStudent(conn, schoolId, student) {
  const [rows] = await conn.query(
    `SELECT id FROM students WHERE sr_number = ? AND school_id = ? LIMIT 1`,
    [student.srNumber, schoolId]
  );

  if (rows.length) {
    const studentId = rows[0].id;
    await conn.query(
      `UPDATE students SET name = ?, \`class\` = ?, email = ?, password = ? WHERE id = ?`,
      [student.name, student.classValue, student.email ?? null, student.password, studentId]
    );
    return studentId;
  }

  await conn.query(
    `INSERT INTO students (id, sr_number, name, \`class\`, school_id, email, password)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [student.srNumber, student.name, student.classValue, schoolId, student.email ?? null, student.password]
  );

  const [createdRows] = await conn.query(
    `SELECT id FROM students WHERE sr_number = ? AND school_id = ? LIMIT 1`,
    [student.srNumber, schoolId]
  );
  return createdRows[0]?.id;
}

async function addFakeHomeworkAndMarks(conn, schoolId, teacherId, studentId, teacherSubject, classValue) {
  // --- SABHI 6 SUBJECTS KA DATA ---
  const allSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];

  const homeworkDescriptions = {
    'Mathematics': 'Chapter 5 ke saare examples solve karo aur notebook mein likhkar lao.',
    'Science': 'Photosynthesis par ek page ka summary likhkar lao aur diagram banao.',
    'English': 'Essay "My School" (200 words) likhkar lao aur vocabulary list banao.',
    'Hindi': 'Paath 6 ki kahani ka summary likhkar aur 10 mushkil shabdon ka arth likhao.',
    'Social Studies': 'India ke rajya aur unki rajdhani ka chart banao.',
    'Computer Science': 'Python mein calculator program banao - add, subtract, multiply, divide.',
  };

  const exams = ['Quarterly Exam', 'Half Yearly', 'Pre Board', 'Final Exams'];

  for (const subject of allSubjects) {
    // --- HOMEWORK: Har subject ka ek homework ---
    const hwDesc = homeworkDescriptions[subject] || `${subject} ke important topics revise karo.`;
    const [hwRows] = await conn.query(
      `SELECT id FROM homework WHERE school_id = ? AND subject = ? AND \`class\` = ? LIMIT 1`,
      [schoolId, subject, classValue]
    );
    if (!hwRows.length) {
      await conn.query(
        `INSERT INTO homework (id, school_id, subject, \`class\`, description, assigned_date, due_date, teacher_id, created_at)
         VALUES (UUID(), ?, ?, ?, ?, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), ?, NOW())`,
        [schoolId, subject, classValue, hwDesc, teacherId]
      );
    }

    // --- MARKS: 4 exams har subject ke liye improving trend ke saath ---
    for (let i = 0; i < exams.length; i++) {
      const exam = exams[i];
      const [marksRows] = await conn.query(
        `SELECT id FROM marks WHERE student_id = ? AND subject = ? AND exam_type = ? LIMIT 1`,
        [studentId, subject, exam]
      );
      if (!marksRows.length) {
        const baseMark = 42 + (i * 10);
        const variance = Math.floor(Math.random() * 15) - 5;
        const marks = Math.min(Math.max(baseMark + variance, 33), 100);
        const grade = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Weak';
        const monthsAgo = exams.length - i;

        await conn.query(
          `INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type, created_at)
           VALUES (UUID(), ?, ?, ?, 100, ?, ?, DATE_SUB(NOW(), INTERVAL ? MONTH))`,
          [studentId, subject, marks, grade, exam, monthsAgo]
        );
      }
    }
  }
}
async function addFakeTimetable(conn, schoolId, classValue) {
  // Subjects aur exam schedule for all classes
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
  const examTypes = [
    { type: 'Quarterly Exam', startDate: '2025-07-15' },
    { type: 'Half Yearly', startDate: '2025-10-01' },
    { type: 'Pre Board', startDate: '2026-01-10' },
    { type: 'Final Exams', startDate: '2026-03-01' },
  ];
  const times = ['09:00 AM - 12:00 PM', '10:00 AM - 01:00 PM', '09:30 AM - 12:30 PM'];

  for (const examObj of examTypes) {
    for (let si = 0; si < subjects.length; si++) {
      const examDate = new Date(examObj.startDate);
      examDate.setDate(examDate.getDate() + si); // har subject ke liye alag din
      const dateStr = examDate.toISOString().slice(0, 10);
      const examTime = times[si % times.length];

      const [existing] = await conn.query(
        `SELECT id FROM exam_timetable WHERE school_id = ? AND \`class\` = ? AND subject = ? AND exam_type = ? LIMIT 1`,
        [schoolId, classValue, subjects[si], examObj.type]
      );
      if (!existing.length) {
        await conn.query(
          `INSERT INTO exam_timetable (id, school_id, \`class\`, subject, exam_date, exam_time, exam_type, created_at)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`,
          [schoolId, classValue, subjects[si], dateStr, examTime, examObj.type]
        );
      }
    }
  }
}

async function run() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
    console.log('Connected to MySQL');

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`Database '${database}' ready`);
    await conn.query(`USE \`${database}\``);

    const schema = readFileSync(join(__dirname, 'schema.mysql.sql'), 'utf8');
    const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      if (stmt) await conn.query(stmt);
    }
    console.log('Schema applied');

    // CLEAR ALL EXISTING DATA FOR FRESH SEED
    console.log('Clearing old student and mark data to regenerate nice names...');
    await conn.query(`DELETE FROM marks`);
    await conn.query(`DELETE FROM students`);
    await conn.query(`DELETE FROM homework`);

    // We can also clear teachers and schools 
    // to cleanly re-create them all.
    await conn.query('DELETE FROM teachers');
    await conn.query('DELETE FROM schools');


    for (const item of seedSchools) {
      const schoolId = await ensureSchool(conn, item.school);
      console.log(`Processing school: ${item.school.schoolName}`);

      let firstTeacherId = null;
      for (const teacher of item.teachers) {
        const teacherId = await ensureTeacher(conn, schoolId, teacher);
        if (!firstTeacherId) firstTeacherId = teacherId;
      }

      for (const student of item.students) {
        const studentId = await ensureStudent(conn, schoolId, student);

        // Add homework + marks for each student linked to first teacher
        if (firstTeacherId) {
          await addFakeHomeworkAndMarks(conn, schoolId, firstTeacherId, studentId, item.teachers[0].subject, student.classValue);
        }
      }

      // Add timetable for every class in this school
      for (const cls of classes) {
        await addFakeTimetable(conn, schoolId, cls);
      }
      console.log(`  ✓ Timetable seeded for all classes in ${item.school.schoolName}`);
    }
    console.log('All seed data inserted successfully!');

    console.log('\n--- HACKATHON DEMO CREDENTIALS ---');
    console.log('1. Govt. Senior Secondary School, Churu');
    console.log('   Teacher Login => ID: T101 | Name: Manish Sain | Sub: Computer Science | Class: 11th');
    console.log('   Student Login => Name: (Check LOGIN_DETAILS.md) | SR No: 1001');
    console.log('\n2. City Public School, Jaipur');
    console.log('   Teacher Login => ID: T201 | Name: Ramesh Patel | Sub: Physics | Class: 12th');
    console.log('   Student Login => Name: (Check LOGIN_DETAILS.md) | SR No: 2001');
    console.log('----------------------------------\n');

    // Generating the markdown file automatically via script
    const fs = await import('fs/promises');
    let mdContent = `# 🔐 School Portal: Complete Login Credentials\n\nThis document contains a comprehensive list of all generated test credentials for the School Portal, specifically breaking down every single Parent/Student login generated by the database seed script.\n\n---\n\n`;

    seedSchools.forEach((schoolObj, sIdx) => {
      mdContent += `## 🏫 School ${sIdx + 1}: ${schoolObj.school.schoolName}\n`;
      mdContent += `**UDISE Code:** \`${schoolObj.school.udiseCode}\`\n`;
      mdContent += `**Principal Password:** \`331022\`\n\n`;

      mdContent += `### 👨‍🏫 Teachers\n`;
      mdContent += `| Teacher Name | Teacher ID | Subject | Class | Password |\n|---|---|---|---|---|\n`;
      schoolObj.teachers.forEach(t => {
        mdContent += `| ${t.name} | \`${t.teacherId}\` | ${t.subject} | ${t.classValue} | \`${t.password}\` |\n`;
      });
      mdContent += `\n`;

      mdContent += `### 👨‍👩‍👦 Students (5 Students per Class)\n`;
      mdContent += `*All students have the password: \`331022@aman\`*\n\n`;

      classes.forEach(c => {
        mdContent += `#### Class ${c}\n`;
        const classStudents = schoolObj.students.filter(stu => stu.classValue === c);
        classStudents.forEach((stu, sIndex) => {
          mdContent += `${sIndex + 1}. **Name:** ${stu.name} | **SR No:** ${stu.srNumber}\n`;
        });
        mdContent += `\n`;
      });
      mdContent += `---\n\n`;
    });

    await fs.writeFile(join(__dirname, '../LOGIN_DETAILS.md'), mdContent, 'utf8');
    console.log('Successfully generated LOGIN_DETAILS.md with all new authentic Indian names!');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
