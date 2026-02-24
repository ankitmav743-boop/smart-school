import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST ?? 'localhost',
        port: Number(process.env.MYSQL_PORT ?? 3306) || 3306,
        user: process.env.MYSQL_USER ?? 'root',
        password: process.env.MYSQL_PASSWORD ?? '',
        database: process.env.MYSQL_DATABASE ?? 'school_portal'
    });

    // Find school ID for Gov SS School
    const [schools] = await conn.query("SELECT id FROM schools WHERE udise_code = '08123456789'");
    const schoolId = schools[0].id;

    // Let's test the API with a wrong subject (Hindi instead of Computer Science)
    const payload = {
        teacherId: 'T101',
        schoolId: schoolId,
        password: 'password123',
        subject: 'Hindi' // User's test case
    };

    try {
        const res = await fetch('http://localhost:4000/api/auth/teacher-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        console.log("Status Code:", res.status);
        console.log("API Response:", result);
    } catch (err) {
        console.error("Fetch Error:", err);
    }

    await conn.end();
}
run();
