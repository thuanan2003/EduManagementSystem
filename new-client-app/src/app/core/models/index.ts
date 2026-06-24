export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  roles: string[];
  studentId?: number;
  teacherId?: number;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface StudentDto {
  id: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  schoolName: string;
  gradeLevel: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarUrl: string;
  studentStatus: string;
  walletBalance?: number;
  remainingSessions?: number;
  healthNote?: string;
}

export interface StudentCreateDto {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  schoolName: string;
  gradeLevel: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  healthNote: string;
  avatarUrl?: string;
  password: string;
}

export interface StudentUpdateDto {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  schoolName: string;
  gradeLevel: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentStatus: string;
  avatarUrl?: string;
}

export interface TeacherDto {
  id: number;
  teacherCode: string;
  fullName: string;
  specialization: string;
  phone: string;
  email: string;
  avatarUrl: string;
  status: string;
  monthlySalary: number;
  bonus: number;
  classCount: number;
  classes?: ClassDto[];
}

export interface TeacherCreateDto {
  fullName: string;
  specialization: string;
  phone: string;
  email: string;
  monthlySalary: number;
  bonus: number;
  avatarUrl?: string;
  password: string;
}

export interface TeacherUpdateDto {
  fullName: string;
  specialization: string;
  phone: string;
  status: string;
  monthlySalary: number;
  bonus: number;
  avatarUrl?: string;
}

export interface CourseDto {
  id: number;
  courseCode: string;
  name: string;
  subject: string;
  grade: string;
  tuitionFee: number;
  pricePerSession: number;
  totalSessions: number;
  durationWeeks: number;
  maxStudents: number;
  status: string;
  description: string;
  classCount: number;
}

export interface CourseCreateDto {
  name: string;
  subject: string;
  grade: string;
  tuitionFee: number;
  pricePerSession: number;
  totalSessions: number;
  durationWeeks: number;
  maxStudents: number;
  description: string;
}

export interface ClassDto {
  id: number;
  classCode: string;
  className: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  grade: string;
  scheduleDay: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  studentCount: number;
  status: string;
}

export interface ClassCreateDto {
  className: string;
  courseId: number;
  teacherId: number;
  scheduleDay: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
}

export interface AttendanceDto {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  attendanceDate: string;
  status: string;
  note: string;
  isDeducted: boolean;
}

export interface WalletDto {
  id: number;
  studentId: number;
  studentName: string;
  balance: number;
  remainingSessions: number;
  transactions: WalletTransactionDto[];
}

export interface WalletTransactionDto {
  id: number;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
}

export interface DashboardStatsDto {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  monthlyRevenue: number;
  todayAttendance: number;
  activeStudents: number;
  pendingAbsenceRequests: number;
  revenueChart: { month: string; revenue: number }[];
  attendanceChart: { date: string; present: number; absent: number; late: number }[];
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  recipientRole: string;
  studentId?: number;
  teacherId?: number;
}
