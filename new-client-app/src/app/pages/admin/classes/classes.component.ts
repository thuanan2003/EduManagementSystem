import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { CourseService } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassDto, TeacherDto, CourseDto, StudentDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {
  classes = signal<ClassDto[]>([]);
  teachers = signal<TeacherDto[]>([]);
  courses = signal<CourseDto[]>([]);
  allStudents = signal<StudentDto[]>([]);

  // Detailed roster state
  activeClassId = signal<number | null>(null);
  activeClass = signal<any | null>(null);
  rosterStudents = signal<any[]>([]);
  rosterLoading = signal<boolean>(false);

  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  rosterModalOpen = signal<boolean>(false);
  enrollModalOpen = signal<boolean>(false);
  transferModalOpen = signal<boolean>(false);

  editingId = signal<number | null>(null);
  submitError = signal<string | null>(null);
  transferStudentId = signal<number | null>(null);

  classForm!: FormGroup;
  enrollForm!: FormGroup;
  transferForm!: FormGroup;

  constructor(
    private classService: ClassService,
    private teacherService: TeacherService,
    private courseService: CourseService,
    private studentService: StudentService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.fetchClasses();
    this.fetchFormOptions();
    this.initForms();
  }

  initForms() {
    this.classForm = this.fb.group({
      className: ['', Validators.required],
      courseId: ['', Validators.required],
      teacherId: ['', Validators.required],
      room: [''],
      capacity: [20],
      scheduleDay: ['', Validators.required],
      startTime: ['18:00', Validators.required],
      endTime: ['19:30', Validators.required]
    });

    this.enrollForm = this.fb.group({
      studentId: ['', Validators.required]
    });

    this.transferForm = this.fb.group({
      toClassId: ['', Validators.required]
    });
  }

  fetchClasses() {
    this.loading.set(true);
    this.classService.getAll().subscribe({
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

  fetchFormOptions() {
    this.teacherService.getAll().subscribe(data => this.teachers.set(data));
    this.courseService.getAll().subscribe(data => this.courses.set(data));
    this.studentService.getAll().subscribe(data => this.allStudents.set(data));
  }

  openCreateModal() {
    this.editingId.set(null);
    this.initForms();
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(classObj: any) {
    this.editingId.set(classObj.id);
    this.initForms();
    this.classForm.patchValue({
      ...classObj
    });
    this.submitError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  onSubmit() {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    const dataSubmit = this.classForm.value;

    if (this.editingId()) {
      this.classService.update(this.editingId()!, dataSubmit).subscribe({
        next: () => {
          alert('Thông tin lớp học đã được cập nhật.');
          this.closeModal();
          this.fetchClasses();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Cập nhật lớp học thất bại.');
        }
      });
    } else {
      this.classService.create(dataSubmit).subscribe({
        next: () => {
          alert('Lớp học mới đã được mở.');
          this.closeModal();
          this.fetchClasses();
        },
        error: err => {
          this.submitError.set(err.error?.message || 'Mở lớp thất bại.');
        }
      });
    }
  }

  deleteClass(id: number) {
    if (confirm('Bạn có chắc chắn muốn giải tán lớp học này không?')) {
      this.classService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Lớp học đã được xóa.');
            this.fetchClasses();
          } else {
            alert(res.message || 'Xóa lớp học thất bại.');
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa lớp học này.');
        }
      });
    }
  }

  // Roster Management
  openRosterModal(classId: number) {
    this.activeClassId.set(classId);
    const match = this.classes().find(c => c.id === classId);
    this.activeClass.set(match || null);
    
    this.rosterModalOpen.set(true);
    this.fetchRoster();
  }

  closeRosterModal() {
    this.rosterModalOpen.set(false);
    this.activeClassId.set(null);
    this.activeClass.set(null);
  }

  fetchRoster() {
    if (!this.activeClassId()) return;

    this.rosterLoading.set(true);
    this.classService.getById(this.activeClassId()!).subscribe({
      next: (res: any) => {
        this.rosterLoading.set(false);
        // Res returns detailed class with studentClasses
        this.rosterStudents.set(res.studentClasses?.map((sc: any) => sc.student) ?? []);
        
        // Keep activeClass count sync
        if (this.activeClass()) {
          this.activeClass.update(c => ({
            ...c,
            studentCount: this.rosterStudents().length
          }));
        }
      },
      error: () => {
        this.rosterLoading.set(false);
      }
    });
  }

  openEnrollModal() {
    this.enrollForm.patchValue({ studentId: '' });
    this.enrollModalOpen.set(true);
  }

  closeEnrollModal() {
    this.enrollModalOpen.set(false);
  }

  submitEnroll() {
    if (this.enrollForm.invalid) return;

    const studentId = Number(this.enrollForm.value.studentId);
    const classId = this.activeClassId()!;

    this.classService.assignStudent(classId, studentId).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Học sinh đã được đăng ký vào lớp.');
          this.closeEnrollModal();
          this.fetchRoster();
          this.fetchClasses(); // refresh outer list count
        } else {
          alert(res.message || 'Lỗi gán học sinh');
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Không thể đăng ký học sinh này vào lớp.');
      }
    });
  }

  removeStudentFromClass(studentId: number) {
    if (confirm('Bạn có chắc chắn muốn hủy đăng ký học của học sinh này tại lớp này không?')) {
      this.classService.removeStudent(this.activeClassId()!, studentId).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Hủy đăng ký học thành công.');
            this.fetchRoster();
            this.fetchClasses();
          } else {
            alert(res.message || 'Thao tác thất bại.');
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Thao tác thất bại.');
        }
      });
    }
  }

  openTransferModal(studentId: number) {
    this.transferStudentId.set(studentId);
    this.transferForm.patchValue({ toClassId: '' });
    this.transferModalOpen.set(true);
  }

  closeTransferModal() {
    this.transferModalOpen.set(false);
    this.transferStudentId.set(null);
  }

  submitTransfer() {
    if (this.transferForm.invalid) return;

    const toClassId = Number(this.transferForm.value.toClassId);
    const fromClassId = this.activeClassId()!;
    const studentId = this.transferStudentId()!;

    // Perform transfer
    this.classService.removeStudent(fromClassId, studentId).subscribe({
      next: () => {
        this.classService.assignStudent(toClassId, studentId).subscribe({
          next: (res) => {
            if (res.success) {
              alert('Điều chuyển lớp thành công. Số buổi và tiền ví được bảo toàn.');
              this.closeTransferModal();
              this.fetchRoster();
              this.fetchClasses();
            } else {
              alert(res.message || 'Điều chuyển thất bại ở bước gán lớp mới.');
            }
          },
          error: (err) => {
            alert('Lỗi khi gán lớp mới: ' + (err.error?.message || ''));
          }
        });
      },
      error: (err) => {
        alert('Lỗi khi hủy đăng ký lớp cũ: ' + (err.error?.message || ''));
      }
    });
  }

  hasControlError(form: FormGroup, controlName: string, errorName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
