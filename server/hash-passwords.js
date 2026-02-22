import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { assertDatabaseConnection, pool } from './db.js';

dotenv.config();

async function start() {
    try {
        await assertDatabaseConnection();
        console.log('Connected to MySQL. Starting password hashing process...');

        const tables = ['schools', 'teachers', 'students'];

        for (const table of tables) {
            console.log(`\nProcessing table: ${table}`);
            const [rows] = await pool.query(`SELECT id, password FROM ${table}`);
            let updatedCount = 0;

            for (const row of rows) {
                // Check if password is already a bcrypt hash (starts with $2a$ or $2b$ and length 60)
                if (row.password && row.password.startsWith('$2') && row.password.length === 60) {
                    continue;
                }

                const hashedPassword = await bcrypt.hash(row.password, 10);
                await pool.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, row.id]);
                updatedCount++;
            }

            console.log(`Updated ${updatedCount} passwords in ${table}.`);
        }

        console.log('\nAll plain-text passwords have been successfully hashed!');
        process.exit(0);
    } catch (error) {
        console.error('Error hashing passwords:', error);
        process.exit(1);
    }
}

start();
