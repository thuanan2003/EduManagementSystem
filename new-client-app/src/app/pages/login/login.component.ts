import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const roles = res.data.user.roles || [];
          if (roles.includes('Admin')) {
            this.router.navigate(['/admin']);
          } else if (roles.includes('Student')) {
            this.router.navigate(['/student']);
          } else if (roles.includes('Teacher')) {
            this.router.navigate(['/teacher']);
          } else {
            this.errorMessage.set('Tài khoản của bạn không có quyền truy cập.');
            this.authService.clearAuth();
          }
        } else {
          this.errorMessage.set(res.message || 'Đăng nhập thất bại.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.message || 'Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại.';
        this.errorMessage.set(errMsg);
      }
    });
  }
}
