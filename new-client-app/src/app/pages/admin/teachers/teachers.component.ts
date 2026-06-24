import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css'
})
export class TeachersComponent implements OnInit {
  teachers = signal<TeacherDto[]>([]);
  filteredTeachers = signal<TeacherDto[]>([]);
  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  editingId = signal<number | null>(null);
  uploading = signal<boolean>(false);
  submitError = signal<string | null>(null);

  keyword: string = '';
  teacherForm!: FormGroup;
  avatarPreview = signal<string>('');

  constructor(
    private teacherService: TeacherService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchTeachers();
    this.initForm();
  }

  initForm() {
    this.teacherForm = this.fb.group({
      fullName: ['', Validators.required],
      specialization: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      monthlySalary: [0, [Validators.required, Validators.min(0)]],
      bonus: [0, [Validators.min(0)]],
      status: ['Active'],
      avatarUrl: [''],
      password: ['', Validators.required]
    });
  }

  fetchTeachers() {
    this.loading.set(true);
    this.teacherService.getAll().subscribe({
      next: (list) => {
        this.teachers.set(list);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  applyFilter() {
    const key = this.keyword.toLowerCase().trim();
    if (!key) {
      this.filteredTeachers.set(this.teachers());
      return;
    }

    const filtered = this.teachers().filter(t => 
      t.fullName.toLowerCase().includes(key) ||
      t.email.toLowerCase().includes(key) ||
      t.phone.toLowerCase().includes(key) ||
      t.teacherCode.toLowerCase().includes(key) ||
      t.specialization.toLowerCase().includes(key)
    );
    this.filteredTeachers.set(filtered);
  }

  onSearch() {
    this.applyFilter();
  }

  openCreateModal() {
    this.editingId.set(null);
    this.avatarPreview.set('');
    this.initForm();
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(teacher: any) {
    this.editingId.set(teacher.id);
    this.avatarPreview.set(teacher.avatarUrl || '');
    this.initForm();
    this.teacherForm.removeControl('password'); // Remove password when editing

    this.teacherForm.patchValue({
      ...teacher
    });
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  handleAvatarUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.uploading.set(true);
    this.http.post<ApiResponse<string>>('/api/upload', formData).subscribe({
      next: res => {
        this.uploading.set(false);
        if (res.success && res.data) {
          this.avatarPreview.set(res.data);
          this.teacherForm.patchValue({ avatarUrl: res.data });
        } else {
          alert('Tải ảnh lên thất bại: ' + res.message);
        }
      },
      error: () => {
        this.uploading.set(false);
        alert('Có lỗi xảy ra khi tải ảnh lên.');
      }
    });
  }

  onSubmit() {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    const dataSubmit = this.teacherForm.value;

    if (this.editingId()) {
      this.teacherService.update(this.editingId()!, dataSubmit).subscribe({
        next: () => {
          alert('Hồ sơ giảng viên đã được cập nhật.');
          this.closeModal();
          this.fetchTeachers();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Cập nhật thất bại.');
        }
      });
    } else {
      this.teacherService.create(dataSubmit).subscribe({
        next: () => {
          alert('Giảng viên đã được thêm thành công.');
          this.closeModal();
          this.fetchTeachers();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Thêm giảng viên thất bại.');
        }
      });
    }
  }

  deleteTeacher(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa giảng viên này không?')) {
      this.teacherService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Xóa giảng viên thành công.');
            this.fetchTeachers();
          } else {
            alert(res.message || 'Xóa giảng viên thất bại.');
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa giảng viên này.');
        }
      });
    }
  }

  formatCurrency(val: number): string {
    if (val === undefined || val === null) return '0 VND';
    return val.toLocaleString('vi-VN') + ' VND';
  }

  hasControlError(controlName: string, errorName: string): boolean {
    const control = this.teacherForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  onAvatarError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
}
