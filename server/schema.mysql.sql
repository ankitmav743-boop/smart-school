CREATE TABLE IF NOT EXISTS schools (
  id CHAR(36) PRIMARY KEY,
  principal_name VARCHAR(100) NOT NULL,
  udise_code VARCHAR(50) UNIQUE NOT NULL,
  school_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT 'password123',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id CHAR(36) PRIMARY KEY,
  teacher_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  `class` VARCHAR(100) NOT NULL,
  school_id CHAR(36) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teachers_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id CHAR(36) PRIMARY KEY,
  sr_number VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  `class` VARCHAR(100) NOT NULL,
  school_id CHAR(36) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_sr_school (sr_number, school_id),
  CONSTRAINT fk_students_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marks (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  marks INT NOT NULL,
  total_marks INT NOT NULL DEFAULT 100,
  grade VARCHAR(50) NOT NULL,
  exam_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework (
  id CHAR(36) PRIMARY KEY,
  school_id CHAR(36) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  `class` VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  assigned_date DATE DEFAULT (CURRENT_DATE),
  due_date DATE NOT NULL,
  teacher_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_homework_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_homework_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_timetable (
  id CHAR(36) PRIMARY KEY,
  school_id CHAR(36) NOT NULL,
  `class` VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  exam_time VARCHAR(50) NOT NULL,
  exam_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exam_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  exam_name VARCHAR(255) NOT NULL,
  total_marks INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  result_file_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
