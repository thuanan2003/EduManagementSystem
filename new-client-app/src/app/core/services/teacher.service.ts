import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, TeacherDto, TeacherCreateDto, TeacherUpdateDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<TeacherDto[]> {
    return this.http.get<ApiResponse<TeacherDto[]>>('/api/teachers').pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<TeacherDto> {
    return this.http.get<ApiResponse<TeacherDto>>(`/api/teachers/${id}`).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Teacher not found');
        return res.data;
      })
    );
  }

  create(data: TeacherCreateDto): Observable<TeacherDto> {
    return this.http.post<ApiResponse<TeacherDto>>('/api/teachers', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to create teacher');
        return res.data;
      })
    );
  }

  update(id: number, data: TeacherUpdateDto): Observable<TeacherDto> {
    return this.http.put<ApiResponse<TeacherDto>>(`/api/teachers/${id}`, data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to update teacher');
        return res.data;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`/api/teachers/${id}`);
  }
}
