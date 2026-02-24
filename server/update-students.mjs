import { pool } from "./db.js";

const school1Id = (await pool.query("SELECT id FROM schools WHERE udise_code=?", ["08123456789"]))[0][0].id;
const school2Id = (await pool.query("SELECT id FROM schools WHERE udise_code=?", ["08987654321"]))[0][0].id;

const students = [
  // School 1 - Churu
  ["1001","Siddharth Nair","1st",school1Id],["1002","Rohan Kulkarni","1st",school1Id],["1003","Rahul Pawar","1st",school1Id],["1004","Anita Joshi","1st",school1Id],["1005","Meena Roy","1st",school1Id],
  ["1006","Neha Kulkarni","2nd",school1Id],["1007","Dhruv Rao","2nd",school1Id],["1008","Shaurya Kale","2nd",school1Id],["1009","Aadhya Das","2nd",school1Id],["1010","Neha Gaikwad","2nd",school1Id],
  ["1011","Dhruv Joshi","3rd",school1Id],["1012","Krishna Menon","3rd",school1Id],["1013","Aarav Reddy","3rd",school1Id],["1014","Rishi Jadhav","3rd",school1Id],["1015","Vikram Reddy","3rd",school1Id],
  ["1016","Avni Sharma","4th",school1Id],["1017","Aarti Das","4th",school1Id],["1018","Renu Choudhary","4th",school1Id],["1019","Ayaan Jain","4th",school1Id],["1020","Geeta Wagh","4th",school1Id],
  ["1021","Nisha Rathore","5th",school1Id],["1022","Kabir Singh","5th",school1Id],["1023","Rahul Kapoor","5th",school1Id],["1024","Riya Gowda","5th",school1Id],["1025","Arjun Kapoor","5th",school1Id],
  ["1026","Shaurya Mishra","6th",school1Id],["1027","Aadhya Desai","6th",school1Id],["1028","Sai Pawar","6th",school1Id],["1029","Pari Desai","6th",school1Id],["1030","Anita Wagh","6th",school1Id],
  ["1031","Neha Bhatt","7th",school1Id],["1032","Neha Tiwari","7th",school1Id],["1033","Renu Sharma","7th",school1Id],["1034","Rohan Choudhary","7th",school1Id],["1035","Vikram Jadhav","7th",school1Id],
  ["1036","Preeti Kadam","8th",school1Id],["1037","Kabir Shinde","8th",school1Id],["1038","Seema Patil","8th",school1Id],["1039","Siddharth Iyer","8th",school1Id],["1040","Rajesh Kadam","8th",school1Id],
  ["1041","Sai Pillai","9th",school1Id],["1042","Dhruv Srivastava","9th",school1Id],["1043","Aarav Gupta","9th",school1Id],["1044","Ishaan Sen","9th",school1Id],["1045","Preeti Menon","9th",school1Id],
  ["1046","Simran Singh","10th",school1Id],["1047","Ayaan Kulkarni","10th",school1Id],["1048","Mukesh Mehta","10th",school1Id],["1049","Sai Joshi","10th",school1Id],["1050","Aadhya Patil","10th",school1Id],
  ["1051","Pari Dubey","11th",school1Id],["1052","Siddharth Desai","11th",school1Id],["1053","Meena Agarwal","11th",school1Id],["1054","Dhruv Chauhan","11th",school1Id],["1055","Simran Iyer","11th",school1Id],
  ["1056","Nisha Mehta","12th",school1Id],["1057","Sunil Gupta","12th",school1Id],["1058","Vivaan Desai","12th",school1Id],["1059","Reyansh Yadav","12th",school1Id],["1060","Ayaan Tiwari","12th",school1Id],
  // School 2 - Jaipur
  ["2001","Simran Kale","1st",school2Id],["2002","Rohan Shukla","1st",school2Id],["2003","Simran Naidu","1st",school2Id],["2004","Arjun Wagh","1st",school2Id],["2005","Reyansh Tiwari","1st",school2Id],
  ["2006","Pari Kadam","2nd",school2Id],["2007","Rishi Naidu","2nd",school2Id],["2008","Shaurya Pawar","2nd",school2Id],["2009","Rahul Bansal","2nd",school2Id],["2010","Avni Patel","2nd",school2Id],
  ["2011","Atharv Shinde","3rd",school2Id],["2012","Rohan Singh","3rd",school2Id],["2013","Rakesh Kapoor","3rd",school2Id],["2014","Meena Sharma","3rd",school2Id],["2015","Meena Verma","3rd",school2Id],
  ["2016","Vikram Jadhav","4th",school2Id],["2017","Rishi Bhosale","4th",school2Id],["2018","Kabir Gowda","4th",school2Id],["2019","Pooja Trivedi","4th",school2Id],["2020","Suhana Pandey","4th",school2Id],
  ["2021","Renu Kapoor","5th",school2Id],["2022","Preeti Dubey","5th",school2Id],["2023","Khushi Pandey","5th",school2Id],["2024","Vikram Joshi","5th",school2Id],["2025","Khushi Iyer","5th",school2Id],
  ["2026","Vivaan Srivastava","6th",school2Id],["2027","Sneha Verma","6th",school2Id],["2028","Aditya Kale","6th",school2Id],["2029","Rahul Reddy","6th",school2Id],["2030","Anjali Bansal","6th",school2Id],
  ["2031","Ayaan More","7th",school2Id],["2032","Sanjay Dubey","7th",school2Id],["2033","Ananya Singh","7th",school2Id],["2034","Arjun Patil","7th",school2Id],["2035","Aarav Rajput","7th",school2Id],
  ["2036","Khushi Kale","8th",school2Id],["2037","Neha Gaikwad","8th",school2Id],["2038","Geeta Pawar","8th",school2Id],["2039","Renu Das","8th",school2Id],["2040","Rakesh Iyer","8th",school2Id],
  ["2041","Vihaan Bhosale","9th",school2Id],["2042","Nisha Jadhav","9th",school2Id],["2043","Kunal Pillai","9th",school2Id],["2044","Rishi Kadam","9th",school2Id],["2045","Nisha Roy","9th",school2Id],
  ["2046","Aarav Kulkarni","10th",school2Id],["2047","Renu Rathore","10th",school2Id],["2048","Vivaan Dubey","10th",school2Id],["2049","Krishna Patil","10th",school2Id],["2050","Kiran Kadam","10th",school2Id],
  ["2051","Aadhya Shinde","11th",school2Id],["2052","Siddharth Wagh","11th",school2Id],["2053","Aditya Choudhary","11th",school2Id],["2054","Ishaan Menon","11th",school2Id],["2055","Preeti Jadhav","11th",school2Id],
  ["2056","Diya Tiwari","12th",school2Id],["2057","Pari Das","12th",school2Id],["2058","Pari Kapoor","12th",school2Id],["2059","Vikram Mishra","12th",school2Id],["2060","Geeta Tiwari","12th",school2Id],
];

await pool.query("DELETE FROM students");
for (const [sr, name, cls, schoolId] of students) {
  await pool.query("INSERT INTO students (id, sr_number, name, class, school_id, password) VALUES (UUID(), ?, ?, ?, ?, ?)", [sr, name, cls, schoolId, "331022@aman"]);
}
console.log("Done! All students updated.");
process.exit(0);
