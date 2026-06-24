import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, StudentDto, StudentCreateDto, StudentUpdateDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private http: HttpClient) {}

  getAll(params?: { search?: string; grade?: string; status?: string }): Observable<StudentDto[]> {
    return this.http.get<ApiResponse<StudentDto[]>>('/api/students', { params }).pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<StudentDto> {
    return this.http.get<ApiResponse<StudentDto>>(`/api/students/${id}`).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Student not found');
        return res.data;
      })
    );
  }

  create(data: StudentCreateDto): Observable<StudentDto> {
    return this.http.post<ApiResponse<StudentDto>>('/api/students', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to create student');
        return res.data;
      })
    );
  }

  update(id: number, data: StudentUpdateDto): Observable<StudentDto> {
    return this.http.put<ApiResponse<StudentDto>>(`/api/students/${id}`, data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to update student');
        return res.data;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`/api/students/${id}`);
  }
}
