import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, AttendanceDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getByStudent(studentId: number): Observable<AttendanceDto[]> {
    return this.http.get<ApiResponse<AttendanceDto[]>>(`/api/attendance/student/${studentId}`).pipe(
      map(res => res.data || [])
    );
  }

  getByClass(classId: number, date?: string): Observable<AttendanceDto[]> {
    const params: any = {};
    if (date) {
      params.date = date;
    }
    return this.http.get<ApiResponse<AttendanceDto[]>>(`/api/attendance/class/${classId}`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  mark(data: { studentId: number; classId: number; attendanceDate: string; status: string; note?: string }): Observable<AttendanceDto> {
    return this.http.post<ApiResponse<AttendanceDto>>('/api/attendance/mark', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to mark attendance');
        return res.data;
      })
    );
  }
}
