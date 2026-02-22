import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: Number(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'school_portal'
        });

        console.log('Connected to MySQL, running ALTER TABLE...');
        await conn.query(`ALTER TABLE schools ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'password123'`);
        console.log('Successfully added password column to schools table!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Password column already exists. Updating existing defaults just in case.');
            const conn = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: Number(process.env.MYSQL_PORT) || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'school_portal'
            });
            await conn.query(`UPDATE schools SET password = 'password123' WHERE password IS NULL OR password = ''`);
            console.log('Updated existing school passwords to password123.');
            process.exit(0);
        } else {
            console.error('Failed to alter table:', error);
            process.exit(1);
        }
    }
}

run();
