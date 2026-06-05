import api from './api';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return res.data.data!;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken });
    return res.data.data!;
  },
};

// ── Students ──────────────────────────────────────────────────────────────────
import type { StudentDto, StudentCreateDto, StudentUpdateDto } from '../types';
export const studentService = {
  getAll: (params?: { search?: string; grade?: string; status?: string }) =>
    api.get<ApiResponse<StudentDto[]>>('/students', { params }).then(r => r.data.data!),
  getById: (id: number) =>
    api.get<ApiResponse<StudentDto>>(`/students/${id}`).then(r => r.data.data!),
  create: (data: StudentCreateDto) =>
    api.post<ApiResponse<StudentDto>>('/students', data).then(r => r.data.data!),
  update: (id: number, data: StudentUpdateDto) =>
    api.put<ApiResponse<StudentDto>>(`/students/${id}`, data).then(r => r.data.data!),
  delete: (id: number) =>
    api.delete<ApiResponse<boolean>>(`/students/${id}`).then(r => r.data),
};

// ── Teachers ──────────────────────────────────────────────────────────────────
import type { TeacherDto, TeacherCreateDto, TeacherUpdateDto } from '../types';
export const teacherService = {
  getAll: () =>
    api.get<ApiResponse<TeacherDto[]>>('/teachers').then(r => r.data.data!),
  getById: (id: number) =>
    api.get<ApiResponse<TeacherDto>>(`/teachers/${id}`).then(r => r.data.data!),
  create: (data: TeacherCreateDto) =>
    api.post<ApiResponse<TeacherDto>>('/teachers', data).then(r => r.data.data!),
  update: (id: number, data: TeacherUpdateDto) =>
    api.put<ApiResponse<TeacherDto>>(`/teachers/${id}`, data).then(r => r.data.data!),
  delete: (id: number) =>
    api.delete<ApiResponse<boolean>>(`/teachers/${id}`).then(r => r.data),
};

// ── Courses ───────────────────────────────────────────────────────────────────
import type { CourseDto, CourseCreateDto } from '../types';
export const courseService = {
  getAll: () =>
    api.get<ApiResponse<CourseDto[]>>('/courses').then(r => r.data.data!),
  getById: (id: number) =>
    api.get<ApiResponse<CourseDto>>(`/courses/${id}`).then(r => r.data.data!),
  create: (data: CourseCreateDto) =>
    api.post<ApiResponse<CourseDto>>('/courses', data).then(r => r.data.data!),
  update: (id: number, data: Partial<CourseCreateDto> & { status?: string }) =>
    api.put<ApiResponse<CourseDto>>(`/courses/${id}`, data).then(r => r.data.data!),
  delete: (id: number) =>
    api.delete<ApiResponse<boolean>>(`/courses/${id}`).then(r => r.data),
};

// ── Classes ───────────────────────────────────────────────────────────────────
import type { ClassDto, ClassCreateDto } from '../types';
export const classService = {
  getAll: () =>
    api.get<ApiResponse<ClassDto[]>>('/classes').then(r => r.data.data!),
  getById: (id: number) =>
    api.get<ApiResponse<ClassDto>>(`/classes/${id}`).then(r => r.data.data!),
  getByTeacher: (teacherId: number) =>
    api.get<ApiResponse<ClassDto[]>>(`/classes/by-teacher/${teacherId}`).then(r => r.data.data!),
  getByStudent: (studentId: number) =>
    api.get<ApiResponse<ClassDto[]>>(`/classes/by-student/${studentId}`).then(r => r.data.data!),
  create: (data: ClassCreateDto) =>
    api.post<ApiResponse<ClassDto>>('/classes', data).then(r => r.data.data!),
  update: (id: number, data: Partial<ClassCreateDto> & { status?: string }) =>
    api.put<ApiResponse<ClassDto>>(`/classes/${id}`, data).then(r => r.data.data!),
  delete: (id: number) =>
    api.delete<ApiResponse<boolean>>(`/classes/${id}`).then(r => r.data),
  assignStudent: (classId: number, studentId: number) =>
    api.post<ApiResponse<boolean>>('/classes/assign-student', { classId, studentId }).then(r => r.data),
  removeStudent: (classId: number, studentId: number) =>
    api.delete<ApiResponse<boolean>>(`/classes/${classId}/students/${studentId}`).then(r => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
import type { AttendanceDto } from '../types';
export const attendanceService = {
  getByStudent: (studentId: number) =>
    api.get<ApiResponse<AttendanceDto[]>>(`/attendance/student/${studentId}`).then(r => r.data.data!),
  getByClass: (classId: number, date?: string) =>
    api.get<ApiResponse<AttendanceDto[]>>(`/attendance/class/${classId}`, { params: { date } }).then(r => r.data.data!),
  mark: (data: { studentId: number; classId: number; attendanceDate: string; status: string; note?: string }) =>
    api.post<ApiResponse<AttendanceDto>>('/attendance/mark', data).then(r => r.data.data!),
};

// ── Wallet ────────────────────────────────────────────────────────────────────
import type { WalletDto } from '../types';
export const walletService = {
  getByStudent: (studentId: number) =>
    api.get<ApiResponse<WalletDto>>(`/wallet/student/${studentId}`).then(r => r.data.data!),
  deposit: (data: { studentId: number; amount: number; description?: string }) =>
    api.post<ApiResponse<WalletDto>>('/wallet/deposit', data).then(r => r.data.data!),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
import type { DashboardStatsDto } from '../types';
export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStatsDto>>('/dashboard/stats').then(r => r.data.data!),
};
