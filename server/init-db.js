/**
 * Initialize MySQL database: create DB, tables, and seed real school data.
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

// ==================== REAL STUDENT DATA ====================
const realStudents = {
  "1st": [
    "Devendra Ruhela", "Arvind", "Komal Mev", "Minakshi", "Monika",
    "Nipeksha Nayak", "Pramod Kumar", "Pratik Sain", "Rajshree", "Riya Kumari",
    "Ronit", "Ruchika", "Sandhya", "Yash Sain"
  ],
  "2nd": [
    "Aaditya Prajapat", "Aarya Prajapat", "Anushka", "Babita", "Devraj",
    "Divyanshi", "Gajannad Poonia", "Harshit", "Harshit", "Narendra Kumar",
    "Naresh", "Natisha Sain", "Nikita Prajapat", "Pooja Nayak", "Rajesh",
    "Smart", "Sarita", "Shivangi", "Shivraj", "Tanavi", "Varsha", "Vikram", "Sahil"
  ],
  "3rd": [
    "Aaina", "Aayana", "Anu", "Arvind", "Bhumika", "Jayvardhan", "Manjeet",
    "Mukesh", "Parsa", "Pooja", "Priyanshu", "Ramswaroop", "Roshani", "Sarika",
    "Shrmila", "Yogesh", "Yogesh Kumar", "Yogita"
  ],
  "4th": [
    "Shakina", "Suman", "Virat Singh", "Aaditya", "Anshu Kanwar", "Aryan",
    "Avani", "Bhawana", "Dropadi", "Kamlesh Nayak", "Lalita", "Mamta", "Pinki",
    "Piyush", "Pooja Sain", "Sandhya"
  ],
  "5th": [
    "Aaditya", "Bhagyashree", "Chayna", "Himanti", "Kris", "Lakshy",
    "Lalita Nayak", "Manish", "Mohit Kumar", "Monika", "Monika", "Norang",
    "Pooja", "Priyatam", "Raj", "Ravina", "Renu", "Seema", "Sonakshi",
    "Sonakshi", "Sultan"
  ],
  "6th": [
    "Aarti", "Anju", "Anushka", "Babita", "Hemant Prajapat", "Lalita",
    "Lucky", "Naksha", "Pankaj Sain", "Prince", "Rajani", "Ravina", "Riya",
    "Tanushree", "Vikram"
  ],
  "7th": [
    "Anil", "Arjun", "Bhawna", "Ekta", "Kanchan", "Kavita", "Kiran",
    "Kumari Kailash", "Mahipal", "Maya", "Muna", "Piyush", "Pooja",
    "Sandeep", "Sangita", "Santra", "Vijaypal", "Vijendra Singh", "Mohit Sharma"
  ],
  "8th": [
    "Aaina", "Ashish", "Daksh", "Dropadi Ruliya", "Kanhaiya Lal", "Kapil",
    "Manisha Kanwar", "Pankaj", "Pankaj", "Payal", "Pooja", "Pratigya",
    "Rahul", "Rakesh", "Rinku", "Rohit", "Rohitash Nayak", "Ronak Nai", "Rughaveer"
  ],
  "9th": [
    "Aaina Prajapat", "Anand Kumar", "Bhavesh Prajapat", "Daleep Kumar Nayak",
    "Gajanand", "Harish Prajapat", "Jayprakash", "Komal", "Komal", "Kumkum",
    "Mahesh", "Manisha", "Mohit", "Nisha", "Nitika", "Nitu Kumari", "Poonam",
    "Pradeep Kumar Nayak", "Priyanka", "Ranveer Singh", "Sangita", "Sunil Kumar",
    "Sunita", "Surya Prakash"
  ],
  "10th": [
    "Amit Kumar", "Anita", "Babita Kumari", "Kailash Kumar", "Khushi",
    "Monika", "Nitu Kumari", "Pankaj Meghwal", "Poonam Kumari", "Preetam Kumar",
    "Rohitash"
  ],
  "11th": [
    "Aman Kumar", "Ankit", "Ayana Kanwar", "Kalpna Nayak", "Kavita",
    "Khushbu", "Monika Prajapat", "Narendra", "Nikita", "Pankaj Kanwar",
    "Poonam", "Pradeep", "Punam", "Pushpa Prajapat", "Rajendra Kumar",
    "Rohit", "Rohit Mahla", "Rohitash Nayak", "Sandeep", "Sandeep Nayak",
    "Suman Kumari", "Supyar", "Tamanna"
  ],
  "12th": [
    "Anand", "Ankit", "Ankita", "Babita", "Deepika", "Jashoda", "Kavita",
    "Komal Prajapat", "Lalchand", "Manisha", "Narendra Kumar", "Nirabhay Nyol",
    "Rotash", "Sajni", "Samiksha", "Sharwan Kumar", "Sonu", "Sonu Kumari",
    "Sunil Kumar", "Sunita", "Swati"
  ]
};

// ==================== REAL TEACHERS ====================
const realTeachers = [
  { teacherId: 'T102', name: 'AMIT SINGH', subject: 'History', classValue: '12th', password: 'password123' },
  { teacherId: 'T115', name: 'AMIT SINGH', subject: 'English', classValue: '12th', password: 'password123' },
  { teacherId: 'T103', name: 'MANPHOOL SINGH MAHALA', subject: 'Hindi', classValue: '12th', password: 'password123' },
  { teacherId: 'T104', name: 'ANJU', subject: 'Geography', classValue: '11th', password: 'password123' },
  { teacherId: 'T105', name: 'BUDHRAM KUMAWAT', subject: 'Mathematics', classValue: '10th', password: 'password123' },
  { teacherId: 'T106', name: 'ASHOK KUMAR', subject: 'English', classValue: '11th', password: 'password123' },
  { teacherId: 'T107', name: 'INDIRA', subject: 'Hindi', classValue: '10th', password: 'password123' },
  { teacherId: 'T108', name: 'SANTOSH SAMOTA', subject: 'Hindi', classValue: '5th', password: 'password123' },
  { teacherId: 'T109', name: 'RAMESH KUMAR CHOUDHARY', subject: 'Environment', classValue: '5th', password: 'password123' },
  { teacherId: 'T110', name: 'RAKESH KUMAR SISODIA', subject: 'English', classValue: '5th', password: 'password123' },
  { teacherId: 'T111', name: 'MONIKA MEENA', subject: 'Hindi', classValue: '5th', password: 'password123' },
  { teacherId: 'T112', name: 'REENA KUMARI', subject: 'Mathematics', classValue: '5th', password: 'password123' },
  { teacherId: 'T113', name: 'CHANDERKANT SWAMI', subject: 'Physical Education', classValue: 'all', password: 'password123' },
  { teacherId: 'T114', name: 'MANISH SAIN', subject: 'Computer Science', classValue: 'all', password: 'password123' },
];

function generateStudentsFromReal() {
  let students = [];
  let srCounter = 1001;

  classes.forEach(cls => {
    const classKey = cls.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const suffix = cls.replace(/\d+/, '');
    const names = realStudents[classKey + suffix] || realStudents[cls] || [];
    names.forEach(name => {
      students.push({
        srNumber: srCounter.toString(),
        name: name.trim(),
        classValue: cls,
        password: '331022@aman'
      });
      srCounter++;
    });
  });
  return students;
}

const seedSchools = [
  {
    school: {
      principalName: 'VINOD KUMAR DHOBI',
      udiseCode: '08123456789',
      schoolName: 'Adarsh Vidya Mandir, Sikar',
    },
    teachers: realTeachers,
    students: generateStudentsFromReal()
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

    // CLEAR ALL EXISTING DATA FOR FRESH SEED
    console.log('Clearing old data for fresh seed...');
    await conn.query(`DELETE FROM marks`);
    await conn.query(`DELETE FROM students`);
    await conn.query(`DELETE FROM homework`);
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

        // Add some realistic dashboard data linking the first teacher to the students
        if (firstTeacherId) {
          await addFakeHomeworkAndMarks(conn, schoolId, firstTeacherId, studentId, item.teachers[0].subject);
        }
      }
    }
    console.log('All seed data inserted successfully!');

    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log('School: Adarsh Vidya Mandir, Sikar');
    console.log('Principal: VINOD KUMAR DHOBI | Password: 331022');
    console.log('Vice Principal: SURESH KUMAR DHAKA | Teacher ID: T101');
    console.log('Student Password: 331022@aman');
    console.log('----------------------------------\n');

    // Generating the markdown file automatically via script
    const fs = await import('fs/promises');
    let mdContent = `# 🔐 School Portal: Complete Login Credentials\n\nThis document contains all login credentials for Adarsh Vidya Mandir, Sikar.\n\n---\n\n`;

    seedSchools.forEach((schoolObj, sIdx) => {
      mdContent += `## 🏫 ${schoolObj.school.schoolName}\n`;
      mdContent += `**UDISE Code:** \`${schoolObj.school.udiseCode}\`\n`;
      mdContent += `**Principal:** ${schoolObj.school.principalName}\n`;
      mdContent += `**Principal Password:** \`331022\`\n\n`;

      mdContent += `### 👨‍🏫 Teachers\n`;
      mdContent += `> [!IMPORTANT]\n`;
      mdContent += `> **SUBJECT SELECTION REQUIRED:** To log in successfully, you **must** select the exact subject listed below in the login dropdown.\n\n`;
      mdContent += `| Teacher Name | Teacher ID | Subject (Select this in Dropdown) | Class | Password |\n|---|---|---|---|---|\n`;
      schoolObj.teachers.forEach(t => {
        mdContent += `| ${t.name} | \`${t.teacherId}\` | **${t.subject}** | ${t.classValue} | \`${t.password}\` |\n`;
      });
      mdContent += `\n`;

      mdContent += `### 👨‍👩‍👦 Students\n`;
      mdContent += `*All students have the password: \`331022@aman\`*\n\n`;

      classes.forEach(c => {
        const classStudents = schoolObj.students.filter(stu => stu.classValue === c);
        if (classStudents.length > 0) {
          mdContent += `#### Class ${c} (${classStudents.length} students)\n`;
          classStudents.forEach((stu, sIndex) => {
            mdContent += `${sIndex + 1}. **Name:** ${stu.name} | **SR No:** ${stu.srNumber}\n`;
          });
          mdContent += `\n`;
        }
      });
      mdContent += `---\n\n`;
    });

    await fs.writeFile(join(__dirname, '../LOGIN_DETAILS.md'), mdContent, 'utf8');
    console.log('Successfully generated LOGIN_DETAILS.md!');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
