import { pool } from './db.js';

async function clearTestData() {
    try {
        console.log('Connecting to database...');
        // We want to clear marks, homework, exam_timetable, results
        // We should disable foreign key checks temporarily if needed, though DELETE FROM should be fine.

        console.log('Clearing marks...');
        await pool.query('DELETE FROM marks');

        console.log('Clearing homework...');
        await pool.query('DELETE FROM homework');

        console.log('Clearing results...');
        await pool.query('DELETE FROM results');

        console.log('Clearing exam_timetable...');
        await pool.query('DELETE FROM exam_timetable');

        console.log('Test data (marks, homework, results, exam timetable) cleared successfully.');
        console.log('Student names, SR, and passwords remain intact.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing test data:', err);
        process.exit(1);
    }
}

clearTestData();
