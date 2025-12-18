export type UserRole = 'student' | 'teacher' | 'admin';

// src/types/user.ts — НИҲОӢ ВА ДУРУСТ
export interface User {
  _id?: string;
  id: string;
  email: string;
  name?: string;           // агар истифода мекунӣ
  fullName?: string;       // ← ИЛОВА КАРДЕМ! (барои муаллимон ва админҳо)
  role: UserRole;
  avatar?: string;
  faculty?: string;
  course?: number;
  group?: string;
  subjects?: string[];
  gpa?: number;
}
export interface Subject {
  id: string;
  name: string;
  creditHours: number;
  teacherId: string;
  teacherName: string;
  groupId: string;
  classTime?: string;
  classroom?: string;
}

export interface Group {
  id: string;
  name: string;
  course: number;
  faculty: string;
  studentCount: number;
  subjectCount: number;
  assignedTeacherId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course: number;
  group: string;
  faculty: string;
  gpa: number;
  status: 'active' | 'inactive' | 'graduated';
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  faculty: string;
  subjects: string[];
  avatar?: string;
  weeklyHours: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  date: string;
  lessons: AttendanceStatus[];
}

export interface WeeklyAttendance {
  studentId: string;
  studentName: string;
  weekNumber: number;
  days: {
    day: string;
    lessons: AttendanceStatus[];
  }[];
}

export interface Grade {
  studentId: string;
  studentName: string;
  subjectId: string;
  homework: number;
  midterm: number;
  final: number;
  total: number;
}

export interface ScheduleSlot {
  id: string;
  day: string;
  lessonNumber: number;
  time: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  classroom: string;
}

export interface DaySchedule {
  day: string;
  slots: ScheduleSlot[];
}

export interface WeekSchedule {
  weekNumber: number;
  days: DaySchedule[];
}

export interface SemesterOverview {
  weekNumber: number;
  subjects: {
    subjectId: string;
    subjectName: string;
    teacherName: string;
    classroom: string;
    lessonHours: number;
  }[];
}
