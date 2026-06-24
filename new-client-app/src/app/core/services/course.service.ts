import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, CourseDto, CourseCreateDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<CourseDto[]> {
    return this.http.get<ApiResponse<CourseDto[]>>('/api/courses').pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<CourseDto> {
    return this.http.get<ApiResponse<CourseDto>>(`/api/courses/${id}`).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Course not found');
        return res.data;
      })
    );
  }

  create(data: CourseCreateDto): Observable<CourseDto> {
    return this.http.post<ApiResponse<CourseDto>>('/api/courses', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to create course');
        return res.data;
      })
    );
  }

  update(id: number, data: Partial<CourseCreateDto> & { status?: string }): Observable<CourseDto> {
    return this.http.put<ApiResponse<CourseDto>>(`/api/courses/${id}`, data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to update course');
        return res.data;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`/api/courses/${id}`);
  }
}
