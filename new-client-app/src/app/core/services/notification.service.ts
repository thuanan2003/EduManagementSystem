import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, NotificationDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getByStudent(studentId: number): Observable<NotificationDto[]> {
    return this.http.get<ApiResponse<NotificationDto[]>>(`/api/notifications/student/${studentId}`).pipe(
      map(res => res.data || [])
    );
  }

  getByTeacher(teacherId: number): Observable<NotificationDto[]> {
    return this.http.get<ApiResponse<NotificationDto[]>>(`/api/notifications/teacher/${teacherId}`).pipe(
      map(res => res.data || [])
    );
  }

  markAsRead(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`/api/notifications/${id}/read`, {});
  }
}
