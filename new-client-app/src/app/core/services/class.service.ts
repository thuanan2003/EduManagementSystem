import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, ClassDto, ClassCreateDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ClassDto[]> {
    return this.http.get<ApiResponse<ClassDto[]>>('/api/classes').pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<ClassDto> {
    return this.http.get<ApiResponse<ClassDto>>(`/api/classes/${id}`).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Class not found');
        return res.data;
      })
    );
  }

  getByTeacher(teacherId: number): Observable<ClassDto[]> {
    return this.http.get<ApiResponse<ClassDto[]>>(`/api/classes/by-teacher/${teacherId}`).pipe(
      map(res => res.data || [])
    );
  }

  getByStudent(studentId: number): Observable<ClassDto[]> {
    return this.http.get<ApiResponse<ClassDto[]>>(`/api/classes/by-student/${studentId}`).pipe(
      map(res => res.data || [])
    );
  }

  create(data: ClassCreateDto): Observable<ClassDto> {
    return this.http.post<ApiResponse<ClassDto>>('/api/classes', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to create class');
        return res.data;
      })
    );
  }

  update(id: number, data: Partial<ClassCreateDto> & { status?: string }): Observable<ClassDto> {
    return this.http.put<ApiResponse<ClassDto>>(`/api/classes/${id}`, data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to update class');
        return res.data;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`/api/classes/${id}`);
  }

  assignStudent(classId: number, studentId: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>('/api/classes/assign-student', { classId, studentId });
  }

  removeStudent(classId: number, studentId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`/api/classes/${classId}/students/${studentId}`);
  }
}
