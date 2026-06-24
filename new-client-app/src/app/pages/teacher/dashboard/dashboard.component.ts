import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherDto } from '../../../core/models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  teacher = signal<TeacherDto | null>(null);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    const u = this.user();
    if (!u || !u.teacherId) {
      this.loading.set(false);
      return;
    }

    this.teacherService.getById(u.teacherId).subscribe({
      next: (t) => {
        this.teacher.set(t);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  classes() {
    return this.teacher()?.classes || [];
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  goToAttendance(classId: number) {
    this.router.navigate(['/teacher/attendance'], { queryParams: { classId } });
  }

  getVnDayName(day: string): string {
    const vnDays: Record<string, string> = {
      Monday: 'Thứ Hai',
      Tuesday: 'Thứ Ba',
      Wednesday: 'Thứ Tư',
      Thursday: 'Thứ Năm',
      Friday: 'Thứ Sáu',
      Saturday: 'Thứ Bảy',
      Sunday: 'Chủ Nhật'
    };
    return vnDays[day] || day;
  }
}
