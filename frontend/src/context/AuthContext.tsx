import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { School, Teacher, Student } from '../lib/types';
import { getSchools } from '../lib/api';

type UserType = 'principal' | 'school' | 'teacher' | 'parent';

type AuthContextType = {
  userType: UserType | null;
  school: School;
  availableSchools: School[];
  principal: School | null;
  teacher: Teacher | null;
  student: Student | null;
  setSchool: (school: School | null) => void;
  loginAsPrincipal: (principalData: School, school: School) => void;
  loginAsTeacher: (teacher: Teacher, school: School) => void;
  loginAsParent: (student: Student, school: School) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseStoredValue<T>(key: string): T | null {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.warn(`Invalid localStorage JSON for key: ${key}`, error);
    localStorage.removeItem(key);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [principal, setPrincipal] = useState<School | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Fetch schools from database
    getSchools()
      .then((schools) => {
        setAvailableSchools(schools);
        // Auto-select the first school (Kadiya Churu)
        if (schools.length > 0 && !school) {
          setSchool(schools[0]);
        }
      })
      .catch((error) => console.error('Failed to load schools', error));

    const savedUserType = localStorage.getItem('userType') as UserType | null;
    const savedSchool = parseStoredValue<School>('school');
    const savedTeacher = parseStoredValue<Teacher>('teacher');
    const savedStudent = parseStoredValue<Student>('student');
    const savedPrincipal = parseStoredValue<School>('principal');

    const hasValidTeacherSession = savedUserType !== 'teacher' || Boolean(savedTeacher);
    const hasValidParentSession = savedUserType !== 'parent' || Boolean(savedStudent);
    const hasValidSchoolSession = savedUserType !== 'school' || Boolean(savedSchool);
    const hasValidPrincipalSession = savedUserType !== 'principal' || Boolean(savedPrincipal);

    if (savedUserType && hasValidTeacherSession && hasValidParentSession && hasValidSchoolSession && hasValidPrincipalSession) {
      setUserType(savedUserType);
    } else {
      localStorage.removeItem('userType');
    }

    if (savedSchool) {
      setSchool(savedSchool);
    }

    if (savedTeacher) setTeacher(savedTeacher);
    if (savedStudent) setStudent(savedStudent);
    if (savedPrincipal) setPrincipal(savedPrincipal);
  }, []);

  const handleSetSchool = (selectedSchool: School | null) => {
    setSchool(selectedSchool);
    if (selectedSchool) {
      localStorage.setItem('school', JSON.stringify(selectedSchool));
    } else {
      localStorage.removeItem('school');
    }
  };

  const loginAsPrincipal = (principalData: School & { token?: string }, _school: School) => {
    setUserType('principal');
    setPrincipal(principalData);
    setTeacher(null);
    setStudent(null);
    localStorage.setItem('userType', 'principal');
    localStorage.setItem('principal', JSON.stringify(principalData));
    if (principalData.token) localStorage.setItem('token', principalData.token);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
  };

  const loginAsTeacher = (teacher: Teacher & { token?: string }, _school: School) => {
    setUserType('teacher');
    setTeacher(teacher);
    setStudent(null);
    setPrincipal(null);
    localStorage.setItem('userType', 'teacher');
    localStorage.setItem('teacher', JSON.stringify(teacher));
    if (teacher.token) localStorage.setItem('token', teacher.token);
    localStorage.removeItem('student');
    localStorage.removeItem('principal');
  };

  const loginAsParent = (student: Student & { token?: string }, _school: School) => {
    setUserType('parent');
    setStudent(student);
    setTeacher(null);
    setPrincipal(null);
    localStorage.setItem('userType', 'parent');
    localStorage.setItem('student', JSON.stringify(student));
    if (student.token) localStorage.setItem('token', student.token);
    localStorage.removeItem('teacher');
    localStorage.removeItem('principal');
  };

  const logout = () => {
    setUserType(null);
    setTeacher(null);
    setStudent(null);
    setPrincipal(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
    localStorage.removeItem('principal');
    localStorage.removeItem('token');
  };

  // While school is loading, show nothing
  if (!school && availableSchools.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        userType,
        school: school!,
        availableSchools,
        principal,
        teacher,
        student,
        setSchool: handleSetSchool,
        loginAsPrincipal,
        loginAsTeacher,
        loginAsParent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
