import {
  ExamTimetable,
  Homework,
  Mark,
  MarkWithStudentName,
  School,
  Student,
  Teacher,
} from './types';

export type { Student, MarkWithStudentName };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
        ? payload.message
        : 'Request failed';

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function getHealth() {
  return request<{ ok: boolean; db: boolean }>('/health');
}

export async function getSchools() {
  return request<School[]>('/schools', {
    method: 'GET',
  });
}

export async function loginPrincipal(params: {
  schoolId: string;
  password?: string;
}) {
  return request<School>('/auth/principal-login', {
    method: 'POST',
    body: params,
  });
}

export async function loginTeacher(params: {
  teacherId: string;
  schoolId: string;
  password?: string;
}) {
  return request<Teacher>('/auth/teacher-login', {
    method: 'POST',
    body: params,
  });
}

export async function loginParent(params: {
  studentName: string;
  classValue: string;
  srNumber: string;
  schoolId: string;
  password?: string;
}) {
  return request<Student>('/auth/parent-login', {
    method: 'POST',
    body: params,
  });
}

export async function getStudents(schoolId: string, classValue: string) {
  const query = new URLSearchParams({ schoolId, classValue }).toString();
  return request<Student[]>(`/students?${query}`);
}

export async function getMarksByStudentId(studentId: string) {
  const query = new URLSearchParams({ studentId }).toString();
  return request<Mark[]>(`/marks?${query}`);
}

export async function getMarksByStudentIds(studentIds: string[]) {
  if (!studentIds.length) {
    return [];
  }

  const query = new URLSearchParams({ studentIds: studentIds.join(',') }).toString();
  return request<MarkWithStudentName[]>(`/marks?${query}`);
}

export async function createMark(payload: {
  student_id: string;
  subject: string;
  marks: number;
  total_marks: number;
  grade: string;
  exam_type: string;
}) {
  return request<{ ok: boolean }>('/marks', {
    method: 'POST',
    body: payload,
  });
}

export async function getHomeworkByClass(schoolId: string, classValue: string) {
  const query = new URLSearchParams({ schoolId, classValue }).toString();
  return request<Homework[]>(`/homework?${query}`);
}

export async function createHomework(payload: {
  school_id: string;
  subject: string;
  class: string;
  description: string;
  due_date: string;
  teacher_id: string;
}) {
  return request<{ ok: boolean }>('/homework', {
    method: 'POST',
    body: payload,
  });
}

export async function getExamTimetableByClass(schoolId: string, classValue: string) {
  const query = new URLSearchParams({ schoolId, classValue }).toString();
  return request<ExamTimetable[]>(`/exam-timetable?${query}`);
}

export async function createExamTimetable(payload: {
  school_id: string;
  class: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  exam_type: string;
}) {
  return request<{ ok: boolean }>('/exam-timetable', {
    method: 'POST',
    body: payload,
  });
}

export async function getAiStudyAdvice(payload: { studentId: string; studentName: string }) {
  return request<{ advice: string }>('/ai-assistant', {
    method: 'POST',
    body: payload,
  });
}

export type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications(userId: string) {
  const query = new URLSearchParams({ userId }).toString();
  return request<Notification[]>(`/notifications?${query}`);
}

export async function markNotificationRead(notificationId: string) {
  return request<{ ok: boolean }>(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
}
