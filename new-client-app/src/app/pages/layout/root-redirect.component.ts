import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  template: '',
  standalone: true
})
export class RootRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (user.roles.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else if (user.roles.includes('Student')) {
      this.router.navigate(['/student']);
    } else if (user.roles.includes('Teacher')) {
      this.router.navigate(['/teacher']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
