import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, DashboardStatsDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStatsDto> {
    return this.http.get<ApiResponse<DashboardStatsDto>>('/api/dashboard/stats').pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to load dashboard statistics');
        return res.data;
      })
    );
  }
}
