import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { ClassDto } from '../../../core/models';

@Component({
  selector: 'app-student-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  classes = signal<ClassDto[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private classService: ClassService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.loading.set(true);
    const u = this.user();
    if (!u || !u.studentId) {
      this.loading.set(false);
      return;
    }

    this.classService.getByStudent(u.studentId).subscribe({
      next: (list) => {
        this.classes.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      }
    });
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
