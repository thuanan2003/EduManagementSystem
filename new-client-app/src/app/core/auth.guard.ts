import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard = (allowedRoles?: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles) {
      const hasRole = user.roles.some(role => allowedRoles.includes(role));
      if (!hasRole) {
        // Redirect to role-appropriate dashboard if unauthorized
        if (user.roles.includes('Admin')) {
          router.navigate(['/admin']);
        } else if (user.roles.includes('Student')) {
          router.navigate(['/student']);
        } else if (user.roles.includes('Teacher')) {
          router.navigate(['/teacher']);
        } else {
          router.navigate(['/login']);
        }
        return false;
      }
    }

    return true;
  };
};
