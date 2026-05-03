import { pool } from "./db.js";

await pool.query(`DELETE FROM schools WHERE udise_code='08040604901'`);
await pool.query(`INSERT INTO schools (id, school_name, udise_code, principal_name, password) VALUES (UUID(), 'Govt Senior Secondary School Kadiya', '08040604901', 'Vinod Kumar Dhobi', '331022')`);
const [[school]] = await pool.query("SELECT id FROM schools WHERE udise_code='08040604901'");
const sid = school.id;
console.log("School added!");

await pool.query("DELETE FROM teachers WHERE school_id=?", [sid]);
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
  await pool.query("INSERT INTO teachers (id, teacher_id, name, subject, class, school_id, password) VALUES (UUID(),?,?,?,?,?,?)", [tid, name, subject, '10th', sid, 'password123']);
}
console.log("Teachers added!");

const students = [
  ['Devendra Ruhela','1st'],['Arvind','1st'],['Komal Mev','1st'],['Minakshi','1st'],['Monika','1st'],['Nipeksha Nayak','1st'],['Pramod Kumar','1st'],['Pratik Sain','1st'],['Rajshree','1st'],['Riya Kumari','1st'],['Ronit','1st'],['Ruchika','1st'],['Sandhya','1st'],['Yash Sain','1st'],
  ['Aaditya Prajapat','2nd'],['Aarya Prajapat','2nd'],['Anushka','2nd'],['Babita','2nd'],['Devraj','2nd'],['Divyanshi','2nd'],['Gajannad Poonia','2nd'],['Harshit','2nd'],['Narendra Kumar','2nd'],['Naresh','2nd'],['Natisha Sain','2nd'],['Nikita Prajapat','2nd'],['Pooja Nayak','2nd'],['Rajesh','2nd'],['Smart','2nd'],['Sarita','2nd'],['Shivangi','2nd'],['Shivraj','2nd'],['Tanavi','2nd'],['Varsha','2nd'],['Vikram','2nd'],['Sahil','2nd'],
  ['Aaina','3rd'],['Aayana','3rd'],['Anu','3rd'],['Arvind','3rd'],['Bhumika','3rd'],['Jayvardhan','3rd'],['Manjeet','3rd'],['Mukesh','3rd'],['Parsa','3rd'],['Pooja','3rd'],['Priyanshu','3rd'],['Ramswaroop','3rd'],['Roshani','3rd'],['Sarika','3rd'],['Shrmila','3rd'],['Yogesh','3rd'],['Yogesh Kumar','3rd'],['Yogita','3rd'],
  ['Shakina','4th'],['Suman','4th'],['Virat Singh','4th'],['Aaditya','4th'],['Anshu Kanwar','4th'],['Aryan','4th'],['Avani','4th'],['Bhawana','4th'],['Dropadi','4th'],['Kamlesh Nayak','4th'],['Lalita','4th'],['Mamta','4th'],['Pinki','4th'],['Piyush','4th'],['Pooja Sain','4th'],['Sandhya','4th'],
  ['Aaditya','5th'],['Bhagyashree','5th'],['Chayna','5th'],['Himanti','5th'],['Kris','5th'],['Lakshy','5th'],['Lalita Nayak','5th'],['Manish','5th'],['Mohit Kumar','5th'],['Monika','5th'],['Norang','5th'],['Pooja','5th'],['Priyatam','5th'],['Raj','5th'],['Ravina','5th'],['Renu','5th'],['Seema','5th'],['Sonakshi','5th'],['Sultan','5th'],
  ['Aarti','6th'],['Anju','6th'],['Anushka','6th'],['Babita','6th'],['Hemant Prajapat','6th'],['Lalita','6th'],['Lucky','6th'],['Naksha','6th'],['Pankaj Sain','6th'],['Prince','6th'],['Rajani','6th'],['Ravina','6th'],['Riya','6th'],['Tanushree','6th'],['Vikram','6th'],
  ['Anil','7th'],['Arjun','7th'],['Bhawna','7th'],['Ekta','7th'],['Kanchan','7th'],['Kavita','7th'],['Kiran','7th'],['Kumari Kailash','7th'],['Mahipal','7th'],['Maya','7th'],['Muna','7th'],['Piyush','7th'],['Pooja','7th'],['Sandeep','7th'],['Sangita','7th'],['Santra','7th'],['Vijaypal','7th'],['Vijendra Singh','7th'],
  ['Aaina','8th'],['Ashish','8th'],['Daksh','8th'],['Dropadi Ruliya','8th'],['Kanhaiya Lal','8th'],['Kapil','8th'],['Manisha Kanwar','8th'],['Pankaj','8th'],['Payal','8th'],['Pooja','8th'],['Pratigya','8th'],['Rahul','8th'],['Rakesh','8th'],['Rinku','8th'],['Rohit','8th'],['Rohitash Nayak','8th'],['Ronak Nai','8th'],['Rughaveer','8th'],
  ['Aaina Prajapat','9th'],['Anand Kumar','9th'],['Bhavesh Prajapat','9th'],['Daleep Kumar Nayak','9th'],['Gajanand','9th'],['Harish Prajapat','9th'],['Jayprakash','9th'],['Komal','9th'],['Kumkum','9th'],['Mahesh','9th'],['Manisha','9th'],['Mohit','9th'],['Nisha','9th'],['Nitika','9th'],['Nitu Kumari','9th'],['Poonam','9th'],['Pradeep Kumar Nayak','9th'],['Priyanka','9th'],['Ranveer Singh','9th'],['Sangita','9th'],['Sunil Kumar','9th'],['Sunita','9th'],['Surya Prakash','9th'],
  ['Amit Kumar','10th'],['Anita','10th'],['Babita Kumari','10th'],['Kailash Kumar','10th'],['Khushi','10th'],['Monika','10th'],['Nitu Kumari','10th'],['Pankaj Meghwal','10th'],['Poonam Kumari','10th'],['Preetam Kumar','10th'],['Rohitash','10th'],
  ['Aman Kumar','11th'],['Ankit','11th'],['Ayana Kanwar','11th'],['Kalpna Nayak','11th'],['Kavita','11th'],['Khushbu','11th'],['Monika Prajapat','11th'],['Narendra','11th'],['Nikita','11th'],['Pankaj Kanwar','11th'],['Poonam','11th'],['Pradeep','11th'],['Punam','11th'],['Pushpa Prajapat','11th'],['Rajendra Kumar','11th'],['Rohit','11th'],['Rohit Mahla','11th'],['Rohitash Nayak','11th'],['Sandeep','11th'],['Sandeep Nayak','11th'],['Suman Kumari','11th'],['Supyar','11th'],['Tamanna','11th'],
  ['Anand','12th'],['Ankit','12th'],['Ankita','12th'],['Babita','12th'],['Deepika','12th'],['Jashoda','12th'],['Kavita','12th'],['Komal Prajapat','12th'],['Lalchand','12th'],['Manisha','12th'],['Narendra Kumar','12th'],['Nirabhay Nyol','12th'],['Rotash','12th'],['Sajni','12th'],['Samiksha','12th'],['Sharwan Kumar','12th'],['Sonu','12th'],['Sonu Kumari','12th'],['Sunil Kumar','12th'],['Sunita','12th'],['Swati','12th'],
];

await pool.query("DELETE FROM students WHERE school_id=?", [sid]);
let sr = 4001;
for (const [name, cls] of students) {
  await pool.query("INSERT INTO students (id, sr_number, name, class, school_id, password) VALUES (UUID(),?,?,?,?,?)", [String(sr++), name, cls, sid, '331022@aman']);
}
console.log("Students added!");
console.log("ALL DONE! Total students:", students.length);
process.exit(0);
