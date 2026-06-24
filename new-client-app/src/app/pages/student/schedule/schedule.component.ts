import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { ClassDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  classes = signal<ClassDto[]>([]);
  requests = signal<any[]>([]);
  
  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  submitting = signal<boolean>(false);
  selectedClass = signal<ClassDto | null>(null);

  requestForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.initForm();
  }

  initForm() {
    this.requestForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  loadData() {
    this.loading.set(true);
    const u = this.user();
    if (!u || !u.studentId) {
      this.loading.set(false);
      return;
    }

    // Load classes
    this.classService.getByStudent(u.studentId).subscribe({
      next: (list) => {
        this.classes.set(list);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    // Load absence requests
    this.http.get<ApiResponse<any[]>>(`/api/absence-requests/student/${u.studentId}`).subscribe({
      next: (res) => {
        this.requests.set(res.data || []);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  checkLoading() {
    if (this.classes() !== null && this.requests() !== null) {
      this.loading.set(false);
    }
  }

  canRequestAbsence(classItem: any): { allowed: boolean; message: string } {
    if (!classItem) return { allowed: false, message: '' };

    const daysMap: Record<string, string> = {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    };

    const todayDate = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const todayEnglish = todayDate.toLocaleDateString('en-US', options); // e.g. "Monday"

    if (todayEnglish.toLowerCase() === classItem.scheduleDay.toLowerCase()) {
      const now = new Date();
      const [hours, minutes] = classItem.startTime.split(':').map(Number);
      const classStart = new Date();
      classStart.setHours(hours, minutes, 0, 0);

      if (now.getTime() > classStart.getTime()) {
        return {
          allowed: false,
          message: `Không thể xin nghỉ phép cho buổi học hôm nay. Lớp đã bắt đầu lúc ${classItem.startTime} (Giờ hiện tại: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}).`
        };
      }
    }

    return { allowed: true, message: '' };
  }

  openRequestModal(classItem: ClassDto) {
    this.selectedClass.set(classItem);
    this.requestForm.patchValue({ reason: '' });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedClass.set(null);
  }

  onSubmit() {
    if (this.requestForm.invalid) return;

    const u = this.user();
    if (!u || !u.studentId || !this.selectedClass()) return;

    this.submitting.set(true);
    const payload = {
      studentId: u.studentId,
      classId: this.selectedClass()!.id,
      reason: this.requestForm.value.reason,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    };

    this.http.post<ApiResponse<any>>('/api/absence-requests', payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          alert('Gửi yêu cầu xin nghỉ phép thành công!');
          this.closeModal();
          this.loadData();
        } else {
          alert(res.message || 'Lỗi gửi yêu cầu.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        alert(err.error?.message || 'Không thể gửi yêu cầu xin nghỉ phép.');
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

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  }

  hasControlError(controlName: string, errorName: string): boolean {
    const control = this.requestForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
