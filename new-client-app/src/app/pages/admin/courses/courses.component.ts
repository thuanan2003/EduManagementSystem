import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { CourseDto } from '../../../core/models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  courses = signal<CourseDto[]>([]);
  filteredCourses = signal<CourseDto[]>([]);
  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  editingId = signal<number | null>(null);
  submitError = signal<string | null>(null);

  keyword: string = '';
  courseForm!: FormGroup;

  constructor(
    private courseService: CourseService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.fetchCourses();
    this.initForm();
  }

  initForm() {
    this.courseForm = this.fb.group({
      name: ['', Validators.required],
      subject: ['', Validators.required],
      grade: ['', Validators.required],
      tuitionFee: [null, [Validators.required, Validators.min(0)]],
      pricePerSession: [null, [Validators.required, Validators.min(0)]],
      totalSessions: [null, [Validators.required, Validators.min(1)]],
      durationWeeks: [12, Validators.min(1)],
      maxStudents: [20, Validators.min(1)],
      status: ['Active'],
      description: ['']
    });
  }

  fetchCourses() {
    this.loading.set(true);
    this.courseService.getAll().subscribe({
      next: (list) => {
        this.courses.set(list);
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
      this.filteredCourses.set(this.courses());
      return;
    }

    const filtered = this.courses().filter(c => 
      c.name.toLowerCase().includes(key) ||
      c.courseCode.toLowerCase().includes(key) ||
      c.subject.toLowerCase().includes(key) ||
      c.grade.toLowerCase().includes(key)
    );
    this.filteredCourses.set(filtered);
  }

  onSearch() {
    this.applyFilter();
  }

  openCreateModal() {
    this.editingId.set(null);
    this.initForm();
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(course: any) {
    this.editingId.set(course.id);
    this.initForm();
    this.courseForm.patchValue({
      ...course
    });
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    const dataSubmit = this.courseForm.value;

    if (this.editingId()) {
      this.courseService.update(this.editingId()!, dataSubmit).subscribe({
        next: () => {
          alert('Khóa học đã được cập nhật thành công.');
          this.closeModal();
          this.fetchCourses();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Cập nhật thất bại.');
        }
      });
    } else {
      this.courseService.create(dataSubmit).subscribe({
        next: () => {
          alert('Khóa học mới đã được thêm thành công.');
          this.closeModal();
          this.fetchCourses();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Thêm khóa học thất bại.');
        }
      });
    }
  }

  deleteCourse(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này không?')) {
      this.courseService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Khóa học đã được xóa.');
            this.fetchCourses();
          } else {
            alert(res.message || 'Xóa khóa học thất bại.');
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa khóa học này.');
        }
      });
    }
  }

  formatCurrency(val: number): string {
    if (val === undefined || val === null) return '0 VND';
    return val.toLocaleString('vi-VN') + ' VND';
  }

  hasControlError(controlName: string, errorName: string): boolean {
    const control = this.courseForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
