import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, WalletDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(private http: HttpClient) {}

  getByStudent(studentId: number): Observable<WalletDto> {
    return this.http.get<ApiResponse<WalletDto>>(`/api/wallet/student/${studentId}`).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Wallet not found');
        return res.data;
      })
    );
  }

  deposit(data: { studentId: number; amount: number; description?: string }): Observable<WalletDto> {
    return this.http.post<ApiResponse<WalletDto>>('/api/wallet/deposit', data).pipe(
      map(res => {
        if (!res.data) throw new Error(res.message || 'Failed to deposit tuition');
        return res.data;
      })
    );
  }
}
