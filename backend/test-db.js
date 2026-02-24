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

    const [rows] = await conn.query("SELECT id, teacher_id, subject, password FROM teachers WHERE teacher_id = 'T101'");
    console.log("Teacher Data:", rows);

    await conn.end();
}
run();
