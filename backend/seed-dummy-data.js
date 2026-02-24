import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const host = process.env.MYSQL_HOST ?? 'localhost';
const port = Number(process.env.MYSQL_PORT ?? 3306) || 3306;
const user = process.env.MYSQL_USER ?? 'root';
const password = process.env.MYSQL_PASSWORD ?? '';
const database = process.env.MYSQL_DATABASE ?? 'school_portal';

const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Science',
    'Computer Science',
];

const examTypes = ['First Test', 'Half Yearly Exam', 'Yearly Exam'];

async function run() {
    let conn;
    try {
        conn = await createConnection({ host, port, user, password, database });
        console.log(`Connected to MySQL database: ${database}`);

        // Fetch all students
        const [students] = await conn.query('SELECT id, school_id, `class` FROM students');
        console.log(`Found ${students.length} students. Seeding dummy data...`);

        // Fetch teachers to assign homework
        const [teachers] = await conn.query('SELECT id, school_id, subject, `class` FROM teachers');

        // For each student, let's add some marks & weekly evaluations
        let marksAdded = 0;
        let evalAdded = 0;

        for (const student of students) {
            // Seed Marks (Exam)
            for (const subject of subjects) {
                for (const exam of examTypes) {
                    // Check if exists
                    const [existing] = await conn.query(
                        "SELECT id FROM marks WHERE student_id = ? AND subject = ? AND exam_type = ? LIMIT 1",
                        [student.id, subject, exam]
                    );

                    if (!existing.length) {
                        const marksScored = Math.floor(Math.random() * 40) + 60; // 60 to 99
                        const grade = marksScored >= 85 ? 'Good' : marksScored >= 70 ? 'Average' : 'Weak';

                        await conn.query(
                            "INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type, created_at) VALUES (UUID(), ?, ?, ?, 100, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))",
                            [student.id, subject, marksScored, grade, exam, Math.floor(Math.random() * 30)]
                        );
                        marksAdded++;
                    }
                }

                // Seed Weekly Evaluation
                const [existingEval] = await conn.query(
                    "SELECT id FROM marks WHERE student_id = ? AND subject = ? AND exam_type = 'Weekly Evaluation' LIMIT 1",
                    [student.id, subject]
                );

                if (!existingEval.length) {
                    const evalScore = Math.floor(Math.random() * 4) + 6; // 6 to 9 out of 10
                    const grade = evalScore >= 8 ? 'Good' : 'Average';

                    await conn.query(
                        "INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type, created_at) VALUES (UUID(), ?, ?, ?, 10, ?, 'Weekly Evaluation', DATE_SUB(NOW(), INTERVAL ? DAY))",
                        [student.id, subject, evalScore, grade, Math.floor(Math.random() * 7)]
                    );
                    evalAdded++;
                }
            }
        }
        console.log(`✅ Added ${marksAdded} exam marks and ${evalAdded} weekly evaluations.`);

        // Seed some homework if missing for the classes that exist
        const [classes] = await conn.query('SELECT DISTINCT school_id, `class` as classVal FROM students');
        let hwAdded = 0;

        for (const cls of classes) {
            for (const subject of subjects) {
                // Find a teacher in this school, fallback to any teacher ID if available
                const schoolTeachers = teachers.filter(t => t.school_id === cls.school_id);
                const teacherId = schoolTeachers.length > 0 ? schoolTeachers[0].id : (teachers.length > 0 ? teachers[0].id : null);

                if (teacherId) {
                    const [existingHW] = await conn.query(
                        "SELECT id FROM homework WHERE school_id = ? AND `class` = ? AND subject = ? LIMIT 1",
                        [cls.school_id, cls.classVal, subject]
                    );

                    if (!existingHW.length) {
                        const desc = `Complete chapter exercise and revise notes for ${subject}.`;
                        await conn.query(
                            "INSERT INTO homework (id, school_id, subject, `class`, description, assigned_date, due_date, teacher_id, created_at) VALUES (UUID(), ?, ?, ?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), ?, NOW())",
                            [cls.school_id, subject, cls.classVal, desc, teacherId]
                        );
                        hwAdded++;
                    }
                }
            }
        }
        console.log(`✅ Added ${hwAdded} homework assignments.`);
        console.log('🎉 Dummy data seeded successfully without modifying student details!');

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

run();
