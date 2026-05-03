import mysql from 'mysql2/promise';
import fs from 'fs';

async function migrate() {
    console.log("Starting Migration...");
    
    // 1. Connect to Local DB
    const localPool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Admin@123',
        database: 'school_portal',
    });

    // 2. Connect to Remote DB (TiDB)
    console.log("Connecting to TiDB...");
    const remotePool = mysql.createPool({
        host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
        port: 4000,
        user: '42AFRjS2jVGuQTd.root',
        password: '4SHQurJeUJUA7WVM',
        database: 'school_portal',
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    try {
        // Only migrate remaining tables (schools, teachers, students already done)
        const tables = ['marks', 'homework', 'exam_timetable', 'results'];
        
        for (const table of tables) {
            console.log(`Migrating table: ${table}...`);
            const [rows] = await localPool.query(`SELECT * FROM ${table}`);
            if (rows.length === 0) {
                console.log(`Table ${table} is empty, skipping.`);
                continue;
            }
            
            console.log(`Found ${rows.length} rows, inserting in batches...`);
            
            const columns = Object.keys(rows[0]);
            const colNames = columns.map(c => '`'+c+'`').join(', ');
            
            // Insert in batches of 50
            const batchSize = 50;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const allValues = [];
                const placeholderSets = [];
                
                for (const row of batch) {
                    const rowPlaceholders = columns.map(() => '?').join(', ');
                    placeholderSets.push(`(${rowPlaceholders})`);
                    for (const c of columns) {
                        if (row[c] instanceof Date) {
                            allValues.push(row[c].toISOString().slice(0, 19).replace('T', ' '));
                        } else {
                            allValues.push(row[c]);
                        }
                    }
                }
                
                const query = `INSERT IGNORE INTO ${table} (${colNames}) VALUES ${placeholderSets.join(', ')}`;
                try {
                    await remotePool.query(query, allValues);
                } catch (e) {
                    console.error(`Batch error in ${table}:`, e.message);
                }
                process.stdout.write(`  Batch ${Math.floor(i/batchSize)+1}/${Math.ceil(rows.length/batchSize)} done\r`);
            }
            console.log(`\nMigrated ${rows.length} rows for ${table}.`);
        }
        
        console.log("\n=== MIGRATION COMPLETE SUCCESSFULLY! ===");
        
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await localPool.end();
        await remotePool.end();
    }
}

migrate();
