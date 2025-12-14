import { Student, Teacher, Group, Subject, AttendanceRecord, Grade, ScheduleSlot, AttendanceStatus } from '@/types';

// Time slots for 6 lessons per day
export const timeSlots = [
  { lesson: 1, time: '08:00 - 08:50' },
  { lesson: 2, time: '09:00 - 09:50' },
  { lesson: 3, time: '10:00 - 10:50' },
  { lesson: 4, time: '11:00 - 11:50' },
  { lesson: 5, time: '13:00 - 13:50' },
  { lesson: 6, time: '14:00 - 14:50' },
];

export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Mock Subjects
export const subjects: Subject[] = [
  { id: '1', name: 'Data Structures', creditHours: 4, teacherId: '1', teacherName: 'Dr. Farrukh Karimov', groupId: 'CS-301', classroom: 'A-101' },
  { id: '2', name: 'Algorithms', creditHours: 4, teacherId: '1', teacherName: 'Dr. Farrukh Karimov', groupId: 'CS-301', classroom: 'A-102' },
  { id: '3', name: 'Database Systems', creditHours: 3, teacherId: '2', teacherName: 'Dr. Nilufar Rahimova', groupId: 'CS-301', classroom: 'B-201' },
  { id: '4', name: 'Operating Systems', creditHours: 4, teacherId: '3', teacherName: 'Prof. Sardor Qosimov', groupId: 'CS-301', classroom: 'B-202' },
  { id: '5', name: 'Computer Networks', creditHours: 3, teacherId: '4', teacherName: 'Dr. Malika Yusupova', groupId: 'CS-301', classroom: 'C-101' },
  { id: '6', name: 'Software Engineering', creditHours: 3, teacherId: '5', teacherName: 'Prof. Bobur Toshev', groupId: 'CS-301', classroom: 'C-102' },
  { id: '7', name: 'Web Development', creditHours: 3, teacherId: '6', teacherName: 'Dr. Shohruh Nazarov', groupId: 'CS-301', classroom: 'D-101' },
  { id: '8', name: 'Machine Learning', creditHours: 4, teacherId: '7', teacherName: 'Prof. Aziza Karimova', groupId: 'CS-301', classroom: 'D-102' },
];

// Mock Groups
export const groups: Group[] = [
  { id: 'CS-301', name: 'CS-301', course: 3, faculty: 'Computer Science', studentCount: 28, subjectCount: 8 },
  { id: 'CS-302', name: 'CS-302', course: 3, faculty: 'Computer Science', studentCount: 25, subjectCount: 8 },
  { id: 'CS-201', name: 'CS-201', course: 2, faculty: 'Computer Science', studentCount: 30, subjectCount: 8 },
  { id: 'CS-202', name: 'CS-202', course: 2, faculty: 'Computer Science', studentCount: 27, subjectCount: 8 },
  { id: 'CS-101', name: 'CS-101', course: 1, faculty: 'Computer Science', studentCount: 35, subjectCount: 8 },
  { id: 'EE-301', name: 'EE-301', course: 3, faculty: 'Electrical Engineering', studentCount: 22, subjectCount: 8 },
  { id: 'ME-301', name: 'ME-301', course: 3, faculty: 'Mechanical Engineering', studentCount: 26, subjectCount: 8 },
  { id: 'CE-301', name: 'CE-301', course: 3, faculty: 'Civil Engineering', studentCount: 24, subjectCount: 8 },
];

// Mock Students
const studentNames = [
  'Akbar Mahmudov', 'Dilshod Rahimov', 'Gulnora Karimova', 'Jasur Toshev', 'Kamola Yusupova',
  'Laziz Nazarov', 'Malika Azimova', 'Nodir Saidov', 'Ozoda Rahmonova', 'Parviz Umarov',
  'Qobil Ergashev', 'Rano Mirzayeva', 'Sardor Kholiqov', 'Tohir Jurayev', 'Umida Bekova',
  'Valijon Xasanov', 'Xurshid Salomov', 'Yulduz Sharipova', 'Zafar Ochilov', 'Anvar Rahmatov',
];
export const students: Student[] = studentNames.map((name, index) => ({
  id: `student-${index + 1}`,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@student.edu`,
  course: Math.ceil((index % 4) + 1),
  group: groups[index % groups.length].id,
  faculty: 'Computer Science',
  gpa: Number((2.5 + Math.random() * 1.5).toFixed(2)),
  status: index < 18 ? 'active' : 'inactive',
}));

// Mock Teachers
export const teachers: Teacher[] = [
  { id: '1', name: 'Dr. Farrukh Karimov', email: 'f.karimov@university.edu', faculty: 'Computer Science', subjects: ['Data Structures', 'Algorithms'], weeklyHours: 36 },
  { id: '2', name: 'Dr. Nilufar Rahimova', email: 'n.rahimova@university.edu', faculty: 'Computer Science', subjects: ['Database Systems'], weeklyHours: 32 },
  { id: '3', name: 'Prof. Sardor Qosimov', email: 's.qosimov@university.edu', faculty: 'Computer Science', subjects: ['Operating Systems'], weeklyHours: 36 },
  { id: '4', name: 'Dr. Malika Yusupova', email: 'm.yusupova@university.edu', faculty: 'Computer Science', subjects: ['Computer Networks'], weeklyHours: 28 },
  { id: '5', name: 'Prof. Bobur Toshev', email: 'b.toshev@university.edu', faculty: 'Computer Science', subjects: ['Software Engineering'], weeklyHours: 30 },
  { id: '6', name: 'Dr. Shohruh Nazarov', email: 's.nazarov@university.edu', faculty: 'Computer Science', subjects: ['Web Development'], weeklyHours: 34 },
  { id: '7', name: 'Prof. Aziza Karimova', email: 'a.karimova@university.edu', faculty: 'Computer Science', subjects: ['Machine Learning'], weeklyHours: 36 },
];

// Generate mock schedule
export const generateWeekSchedule = (): ScheduleSlot[] => {
  const schedule: ScheduleSlot[] = [];
  let id = 1;
  
  weekDays.forEach((day) => {
    timeSlots.forEach((slot, index) => {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      schedule.push({
        id: `slot-${id++}`,
        day,
        lessonNumber: slot.lesson,
        time: slot.time,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherName: subject.teacherName,
        classroom: subject.classroom,
      });
    });
  });
  
  return schedule;
};

// Generate mock attendance
export const generateAttendance = (studentId: string, studentName: string): AttendanceRecord => {
  const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
  const lessons: AttendanceStatus[] = [];
  
  for (let i = 0; i < 6; i++) {
    const random = Math.random();
    if (random > 0.9) lessons.push('absent');
    else if (random > 0.85) lessons.push('late');
    else if (random > 0.8) lessons.push('excused');
    else lessons.push('present');
  }
  
  return {
    studentId,
    studentName,
    date: new Date().toISOString().split('T')[0],
    lessons,
  };
};

// Generate mock grades
export const generateGrades = (): Grade[] => {
  return students.slice(0, 20).map((student) => {
    const homework = Math.floor(15 + Math.random() * 6);
    const midterm = Math.floor(20 + Math.random() * 11);
    const final = Math.floor(35 + Math.random() * 16);
    return {
      studentId: student.id,
      studentName: student.name,
      subjectId: subjects[0].id,
      homework,
      midterm,
      final,
      total: homework + midterm + final,
    };
  });
};

// Statistics
export const dashboardStats = {
  totalStudents: 2147,
  totalTeachers: 89,
  totalGroups: 72,
  totalSubjects: 156,
  weeklyAttendance: 94.5,
  averageGPA: 3.42,
};

// 16-week semester data
export const semesterWeeks = Array.from({ length: 16 }, (_, i) => ({
  weekNumber: i + 1,
  startDate: new Date(2024, 8, 2 + i * 7).toISOString().split('T')[0],
  endDate: new Date(2024, 8, 8 + i * 7).toISOString().split('T')[0],
}));
