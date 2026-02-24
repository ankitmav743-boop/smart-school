import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
const schoolId = 'e38f41f5-10c2-11f1-a1d7-64bc589ebeb5';

function getRandomDate() {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30); // Due within the next 30 days
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedHomework() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'school_portal_demo',
        });

        // Check if homework exists
        const [existing] = await pool.query('SELECT COUNT(*) as count FROM homework');
        if (existing[0].count > 0) {
            console.log('Homework already seeded. Count:', existing[0].count);
        }

        const descriptions = [
            "Complete chapters 4 and 5 exercises",
            "Write a 500-word essay on the discussed topic",
            "Solve the printable worksheet attached in the portal",
            "Read pages 30-50 and be prepared to discuss",
            "Prepare a presentation on the given subject"
        ];

        let count = 0;
        for (const className of classes) {
            for (let i = 0; i < 2; i++) {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const desc = descriptions[Math.floor(Math.random() * descriptions.length)];

                let due = getRandomDate();
                let assigned = new Date(due);
                assigned.setDate(assigned.getDate() - 3);

                const dueDateStr = due.toISOString().split('T')[0];
                const assignedDateStr = assigned.toISOString().split('T')[0];

                await pool.query(
                    `INSERT INTO homework (id, school_id, subject, \`class\`, description, assigned_date, due_date, teacher_id, created_at)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [schoolId, subject, className, desc, assignedDateStr, dueDateStr, 'T101']
                );
                count++;
            }
        }

        console.log(`Successfully seeded ${count} dummy homework assignments!`);
        await pool.end();
    } catch (err) {
        console.error('Error seeding homework:', err);
    }
}

seedHomework();
