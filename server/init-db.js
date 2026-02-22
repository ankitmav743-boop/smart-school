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

function generateStudents(prefix, countPerClass) {
  let students = [];
  let srCounter = parseInt(prefix + '001');

  classes.forEach(cls => {
    for (let i = 0; i < countPerClass; i++) {
      students.push({
        srNumber: srCounter.toString(),
        name: 'Student ' + srCounter,
        classValue: cls,
        password: 'password123'
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
    students: generateStudents('2', 3)
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
    students: generateStudents('3', 2)
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
      `UPDATE students SET name = ?, \`class\` = ?, password = ? WHERE id = ?`,
      [student.name, student.classValue, student.password, studentId]
    );
    return studentId;
  }

  await conn.query(
    `INSERT INTO students (id, sr_number, name, \`class\`, school_id, password)
     VALUES (UUID(), ?, ?, ?, ?, ?)`,
    [student.srNumber, student.name, student.classValue, schoolId, student.password]
  );

  const [createdRows] = await conn.query(
    `SELECT id FROM students WHERE sr_number = ? AND school_id = ? LIMIT 1`,
    [student.srNumber, schoolId]
  );
  return createdRows[0]?.id;
}

async function addFakeHomeworkAndMarks(conn, schoolId, teacherId, studentId, teacherSubject) {
  // Check if homework exists for this teacher
  const [hwRows] = await conn.query(`SELECT id FROM homework WHERE teacher_id = ? LIMIT 1`, [teacherId]);
  if (!hwRows.length) {
    await conn.query(
      `INSERT INTO homework (id, school_id, subject, \`class\`, description, assigned_date, due_date, teacher_id, created_at)
       VALUES (UUID(), ?, ?, '11th', 'Complete exercises 1 to 5 from chapter 4.', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), ?, NOW())`,
      [schoolId, teacherSubject, teacherId]
    );
  }

  // Define structured exams for progress tracking over time
  const exams = ['Quarterly Exam', 'Half Yearly', 'Pre Board', 'Final Exams'];

  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i];
    const [marksRows] = await conn.query(`SELECT id FROM marks WHERE student_id = ? AND subject = ? AND exam_type = ? LIMIT 1`, [studentId, teacherSubject, exam]);
    if (!marksRows.length) {
      // Create a progression trend artificially
      const baseMark = 45 + (i * 10);
      const variance = Math.floor(Math.random() * 15) - 5;
      const marks = Math.min(Math.max(baseMark + variance, 35), 100);

      const grade = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Weak';
      const monthsAgo = exams.length - i;

      await conn.query(
        `INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type, created_at)
         VALUES (UUID(), ?, ?, ?, 100, ?, ?, DATE_SUB(NOW(), INTERVAL ? MONTH))`,
        [studentId, teacherSubject, marks, grade, exam, monthsAgo]
      );
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

        // Add some realistic dashboard data linking the first teacher to the students
        if (firstTeacherId) {
          await addFakeHomeworkAndMarks(conn, schoolId, firstTeacherId, studentId, item.teachers[0].subject);
        }
      }
    }
    console.log('All seed data inserted successfully!');

    console.log('\n--- HACKATHON DEMO CREDENTIALS ---');
    console.log('1. Govt. Senior Secondary School, Churu');
    console.log('   Teacher Login => ID: T101 | Name: Manish Sain | Sub: Computer Science | Class: 11th');
    console.log('   Student Login => Name: Ankit Kumar | SR No: 1001 | Class: 11th');
    console.log('\n2. City Public School, Jaipur');
    console.log('   Teacher Login => ID: T201 | Name: Ramesh Patel | Sub: Physics | Class: 12th');
    console.log('   Student Login => Name: Amit Singh | SR No: 2001 | Class: 12th');
    console.log('----------------------------------\n');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
