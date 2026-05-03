import { pool } from "./db.js";

async function updateData() {
  // Teachers Update
  const teachers = [
    ['T401','Vinod Kumar Dhobi','Principal'],
    ['T402','Suresh Kumar Dhaka','Vice Principal'],
    ['T403','Amit Singh','History'],
    ['T404','Manphool Singh Mahala','Hindi'],
    ['T405','Anju','Geography'],['T406','Budhram Kumawat','Math'],
    ['T407','Ashok Kumar','English'],['T408','Indira','Hindi'],
    ['T409','Santosh Samota','Hindi'],['T410','Ramesh Kumar Choudhary','Social Science'],
    ['T411','Rakesh Kumar Sisodia','English'],['T412','Monika Meena','Math'],
    ['T413','Reena Kumari','Hindi'],['T414','Chanderkant Swami','Physical Education'],
    ['T415','Manish Sain','Computer'],
  ];
  
  for (const [tid, name, subject] of teachers) {
     await pool.query("UPDATE teachers SET subject = ? WHERE teacher_id = ?", [subject, tid]);
  }
  console.log("Teachers subjects updated.");
  process.exit(0);
}

updateData();
