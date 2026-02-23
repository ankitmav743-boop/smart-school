export type School = {
  id: string;
  principal_name: string;
  udise_code: string;
  school_name: string;
  created_at: string;
};

export type Teacher = {
  id: string;
  teacher_id: string;
  name: string;
  subject: string;
  class: string;
  school_id: string;
  password: string;
  created_at: string;
};

export type Student = {
  id: string;
  sr_number: string;
  name: string;
  class: string;
  school_id: string;
  email?: string | null;
  password: string;
  created_at: string;
};

export type Mark = {
  id: string;
  student_id: string;
  subject: string;
  marks: number;
  total_marks: number;
  grade: string;
  exam_type: string;
  created_at: string;
};

export type MarkWithStudentName = Mark & {
  student_name: string;
};

export type Homework = {
  id: string;
  school_id: string;
  subject: string;
  class: string;
  description: string;
  assigned_date: string;
  due_date: string;
  teacher_id: string;
  created_at: string;
};

export type ExamTimetable = {
  id: string;
  school_id: string;
  class: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  exam_type: string;
  created_at: string;
};

export type Result = {
  id: string;
  student_id: string;
  exam_name: string;
  total_marks: number;
  percentage: number;
  result_file_url: string | null;
  created_at: string;
};
