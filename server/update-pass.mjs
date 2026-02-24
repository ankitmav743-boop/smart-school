import { pool } from "./db.js";
const [r] = await pool.query("UPDATE students SET password=?", ["331022@aman"]);
console.log("Updated:", r.affectedRows, "students");
process.exit(0);
