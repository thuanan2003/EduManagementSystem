import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardLayoutComponent } from './pages/layout/dashboard-layout.component';
import { authGuard } from './core/auth.guard';
import { RootRedirectComponent } from './pages/layout/root-redirect.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard()],
    children: [
      { path: '', component: RootRedirectComponent },
      
      // Admin Routes
      { 
        path: 'admin', 
        loadComponent: () => import('./pages/admin/overview/overview.component').then(m => m.OverviewComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/students',
        loadComponent: () => import('./pages/admin/students/students.component').then(m => m.StudentsComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/students/:id',
        loadComponent: () => import('./pages/admin/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/teachers',
        loadComponent: () => import('./pages/admin/teachers/teachers.component').then(m => m.TeachersComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/courses',
        loadComponent: () => import('./pages/admin/courses/courses.component').then(m => m.CoursesComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/classes',
        loadComponent: () => import('./pages/admin/classes/classes.component').then(m => m.ClassesComponent),
        canActivate: [authGuard(['Admin'])]
      },
      {
        path: 'admin/reports',
        loadComponent: () => import('./pages/admin/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [authGuard(['Admin'])]
      },

      // Student Routes
      {
        path: 'student',
        loadComponent: () => import('./pages/student/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard(['Student'])]
      },
      {
        path: 'student/schedule',
        loadComponent: () => import('./pages/student/schedule/schedule.component').then(m => m.ScheduleComponent),
        canActivate: [authGuard(['Student'])]
      },
      {
        path: 'student/classes',
        loadComponent: () => import('./pages/student/classes/classes.component').then(m => m.ClassesComponent),
        canActivate: [authGuard(['Student'])]
      },
      {
        path: 'student/tuition',
        loadComponent: () => import('./pages/student/tuition/tuition.component').then(m => m.TuitionComponent),
        canActivate: [authGuard(['Student'])]
      },

      // Teacher Routes
      {
        path: 'teacher',
        loadComponent: () => import('./pages/teacher/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard(['Teacher'])]
      },
      {
        path: 'teacher/schedule',
        loadComponent: () => import('./pages/teacher/schedule/schedule.component').then(m => m.ScheduleComponent),
        canActivate: [authGuard(['Teacher'])]
      },
      {
        path: 'teacher/attendance',
        loadComponent: () => import('./pages/teacher/attendance/attendance.component').then(m => m.AttendanceComponent),
        canActivate: [authGuard(['Teacher'])]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
