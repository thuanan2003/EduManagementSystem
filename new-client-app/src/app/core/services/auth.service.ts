import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, ApiResponse, UserInfo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  // Modern Angular Signals wrapper
  public currentUser = signal<UserInfo | null>(null);
  public isAuthenticated = computed(() => !!this.currentUser());

  constructor(private http: HttpClient) {
    this.loadInitialAuth();
  }

  private loadInitialAuth() {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (userJson && token) {
      try {
        const userObj = JSON.parse(userJson);
        this.userSubject.next(userObj);
        this.currentUser.set(userObj);
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  public login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>('/api/auth/login', credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data);
        }
      })
    );
  }

  public logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap({
        next: () => this.clearAuth(),
        error: () => this.clearAuth() // ensure we logout locally even if server call fails
      })
    );
  }

  public refresh(refreshToken: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>('/api/auth/refresh', { refreshToken }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data);
        }
      })
    );
  }

  public updateProfile(values: { fullName: string; phone?: string; avatarUrl?: string; password?: string }): Observable<ApiResponse<UserInfo>> {
    return this.http.put<ApiResponse<UserInfo>>('/api/auth/profile', values).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.updateUserInfo(res.data);
        }
      })
    );
  }

  public updateUserInfo(partialUser: Partial<UserInfo>) {
    const current = this.userSubject.value;
    if (current) {
      const updated = { ...current, ...partialUser };
      this.userSubject.next(updated);
      this.currentUser.set(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }

  public setAuth(data: LoginResponse) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.userSubject.next(data.user);
    this.currentUser.set(data.user);
  }

  public clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.currentUser.set(null);
  }
}
