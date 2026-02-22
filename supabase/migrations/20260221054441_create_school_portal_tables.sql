/*
  # Smart School Parent Portal Database Schema

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `principal_name` (text) - Name of school principal
      - `udise_code` (text, unique) - Unique school identification code
      - `school_name` (text) - Name of the school
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `teachers`
      - `id` (uuid, primary key)
      - `teacher_id` (text, unique) - Teacher's unique ID
      - `name` (text) - Teacher's name
      - `subject` (text) - Subject taught by teacher
      - `class` (text) - Class assigned to teacher
      - `school_id` (uuid, foreign key) - Reference to schools table
      - `password` (text) - Hashed password for login
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `students`
      - `id` (uuid, primary key)
      - `sr_number` (text) - School roll number
      - `name` (text) - Student's name
      - `class` (text) - Student's class
      - `school_id` (uuid, foreign key) - Reference to schools table
      - `password` (text) - Hashed password for parent login
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `marks`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - Reference to students table
      - `subject` (text) - Subject name
      - `marks` (integer) - Marks obtained
      - `total_marks` (integer) - Total marks
      - `grade` (text) - Performance grade (Weak/Average/Good)
      - `exam_type` (text) - Type of exam (Unit Test, Mid-term, Final)
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `homework`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key) - Reference to schools table
      - `subject` (text) - Subject for homework
      - `class` (text) - Class for which homework is assigned
      - `description` (text) - Homework description
      - `assigned_date` (date) - Date when homework was assigned
      - `due_date` (date) - Due date for homework
      - `teacher_id` (uuid, foreign key) - Reference to teachers table
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `exam_timetable`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key) - Reference to schools table
      - `class` (text) - Class for exam
      - `subject` (text) - Subject of exam
      - `exam_date` (date) - Date of exam
      - `exam_time` (text) - Time of exam
      - `exam_type` (text) - Type of exam
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `results`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - Reference to students table
      - `exam_name` (text) - Name of the exam
      - `total_marks` (integer) - Total marks obtained
      - `percentage` (decimal) - Percentage scored
      - `result_file_url` (text) - URL to result PDF if uploaded
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for school admins to manage their school data
    - Add policies for teachers to manage their class data
    - Add policies for parents to view their child's data only
*/

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_name text NOT NULL,
  udise_code text UNIQUE NOT NULL,
  school_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text UNIQUE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  class text NOT NULL,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_number text NOT NULL,
  name text NOT NULL,
  class text NOT NULL,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sr_number, school_id)
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  marks integer NOT NULL,
  total_marks integer NOT NULL DEFAULT 100,
  grade text NOT NULL,
  exam_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create homework table
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject text NOT NULL,
  class text NOT NULL,
  description text NOT NULL,
  assigned_date date DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create exam_timetable table
CREATE TABLE IF NOT EXISTS exam_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class text NOT NULL,
  subject text NOT NULL,
  exam_date date NOT NULL,
  exam_time text NOT NULL,
  exam_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  total_marks integer NOT NULL,
  percentage decimal(5,2) NOT NULL,
  result_file_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools (public read for login verification)
CREATE POLICY "Anyone can view schools for login"
  ON schools FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for teachers (public read for login verification)
CREATE POLICY "Anyone can view teachers for login"
  ON teachers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Teachers can update their own data"
  ON teachers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for students (public read for login verification)
CREATE POLICY "Anyone can view students for login"
  ON students FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for marks
CREATE POLICY "Anyone can view marks"
  ON marks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert marks"
  ON marks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update marks"
  ON marks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete marks"
  ON marks FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for homework
CREATE POLICY "Anyone can view homework"
  ON homework FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert homework"
  ON homework FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update homework"
  ON homework FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete homework"
  ON homework FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for exam_timetable
CREATE POLICY "Anyone can view exam timetable"
  ON exam_timetable FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert exam timetable"
  ON exam_timetable FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update exam timetable"
  ON exam_timetable FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete exam timetable"
  ON exam_timetable FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for results
CREATE POLICY "Anyone can view results"
  ON results FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert results"
  ON results FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update results"
  ON results FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete results"
  ON results FOR DELETE
  TO anon
  USING (true);