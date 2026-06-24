import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StudentService } from '../../../core/services/student.service';
import { StudentDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students = signal<StudentDto[]>([]);
  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  editingId = signal<number | null>(null);
  uploading = signal<boolean>(false);
  submitError = signal<string | null>(null);

  // Filters
  keyword: string = '';
  status: string = '';

  studentForm!: FormGroup;
  avatarPreview = signal<string>('');

  constructor(
    private studentService: StudentService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchStudents();
    this.initForm();
  }

  initForm() {
    this.studentForm = this.fb.group({
      studentCode: [''],
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      gradeLevel: [''],
      schoolName: [''],
      studentStatus: ['Active'],
      parentName: [''],
      parentPhone: [''],
      parentEmail: [''],
      avatarUrl: [''],
      healthNote: [''],
      password: ['', Validators.required]
    });
  }

  fetchStudents() {
    this.loading.set(true);
    const params: any = {};
    if (this.keyword.trim()) params.search = this.keyword;
    if (this.status) params.status = this.status;

    this.studentService.getAll(params).subscribe({
      next: (list) => {
        this.students.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onFilterChange() {
    this.fetchStudents();
  }

  openCreateModal() {
    this.editingId.set(null);
    this.avatarPreview.set('');
    this.initForm();
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(student: any) {
    this.editingId.set(student.id);
    this.avatarPreview.set(student.avatarUrl || '');
    this.initForm();
    this.studentForm.removeControl('password'); // Remove password field when editing

    // Format DOB to YYYY-MM-DD
    let dob = '';
    if (student.dateOfBirth) {
      dob = student.dateOfBirth.split('T')[0];
    }

    this.studentForm.patchValue({
      ...student,
      dateOfBirth: dob
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
          this.studentForm.patchValue({ avatarUrl: res.data });
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
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    const dataSubmit = this.studentForm.value;

    if (this.editingId()) {
      this.studentService.update(this.editingId()!, dataSubmit).subscribe({
        next: () => {
          alert('Hồ sơ học sinh đã được cập nhật thành công');
          this.closeModal();
          this.fetchStudents();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại.');
        }
      });
    } else {
      this.studentService.create(dataSubmit).subscribe({
        next: () => {
          alert('Học sinh mới đã được thêm thành công');
          this.closeModal();
          this.fetchStudents();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Thêm học sinh thất bại. Vui lòng kiểm tra lại.');
        }
      });
    }
  }

  deleteStudent(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ học sinh này không?')) {
      this.studentService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Học sinh đã được xóa thành công');
            this.fetchStudents();
          } else {
            alert(res.message || 'Xóa thất bại');
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa học sinh này.');
        }
      });
    }
  }

  viewDetails(id: number) {
    this.router.navigate([`/admin/students/${id}`]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'success';
      case 'Suspended': return 'warning';
      case 'Reserved': return 'info';
      case 'Dropped': return 'danger';
      default: return '';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  }

  hasControlError(controlName: string, errorName: string): boolean {
    const control = this.studentForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  onAvatarError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
}
