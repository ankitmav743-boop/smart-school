import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.MYSQL_PORT ?? '3306');

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: Number.isFinite(port) ? port : 3306,
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'school_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function assertDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}
