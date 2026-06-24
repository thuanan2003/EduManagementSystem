import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ClassService } from '../../../core/services/class.service';
import { WalletService } from '../../../core/services/wallet.service';
import { TeacherDto, ClassDto, StudentDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  teacher = signal<TeacherDto | null>(null);
  
  classes = signal<ClassDto[]>([]);
  selectedClassId: number | undefined;
  attendanceDate: string = new Date().toISOString().split('T')[0];

  // Roster details
  classDetail = signal<any | null>(null);
  students = signal<StudentDto[]>([]);
  rosterLoading = signal<boolean>(false);

  // Student wallets warnings
  wallets = signal<Record<number, any>>({});
  walletsLoading = signal<boolean>(false);

  // Attendance inputs map
  attendanceMap: Record<number, string> = {};
  submitting = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    const classIdParam = this.route.snapshot.queryParamMap.get('classId');
    if (classIdParam) {
      this.selectedClassId = Number(classIdParam);
    }
  }

  ngOnInit() {
    this.loadTeacherClasses();
  }

  loadTeacherClasses() {
    const u = this.user();
    if (!u || !u.teacherId) return;

    this.teacherService.getById(u.teacherId).subscribe({
      next: (t) => {
        this.teacher.set(t);
        this.classes.set(t.classes || []);
        if (this.selectedClassId) {
          this.loadClassRoster();
        }
      }
    });
  }

  onClassChange(classId: number) {
    this.selectedClassId = classId;
    if (classId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { classId },
        queryParamsHandling: 'merge'
      });
      this.loadClassRoster();
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { classId: null },
        queryParamsHandling: 'merge'
      });
      this.students.set([]);
      this.classDetail.set(null);
      this.attendanceMap = {};
    }
  }

  onDateChange() {
    // Keep date input synced, no special fetch is required immediately unless historical details are loaded
  }

  loadClassRoster() {
    if (!this.selectedClassId) return;

    this.rosterLoading.set(true);
    this.classService.getById(this.selectedClassId).subscribe({
      next: (res: any) => {
        this.rosterLoading.set(false);
        this.classDetail.set(res);
        const sList = res.studentClasses?.map((sc: any) => sc.student) || [];
        this.students.set(sList);

        // Prepopulate attendance map with default Present status
        const newMap: Record<number, string> = {};
        sList.forEach((s: any) => {
          newMap[s.id] = 'Present';
        });
        this.attendanceMap = newMap;

        // Fetch students wallets details
        this.fetchStudentWallets(sList);
      },
      error: () => {
        this.rosterLoading.set(false);
      }
    });
  }

  fetchStudentWallets(studentList: StudentDto[]) {
    if (studentList.length === 0) return;

    this.walletsLoading.set(true);
    const promises = studentList.map(s => 
      this.walletService.getByStudent(s.id).toPromise()
        .then(w => ({ studentId: s.id, wallet: w }))
        .catch(() => ({ studentId: s.id, wallet: { balance: 0, remainingSessions: 0 } }))
    );

    Promise.all(promises).then(results => {
      this.walletsLoading.set(false);
      const newWallets: Record<number, any> = {};
      results.forEach(r => {
        newWallets[r.studentId] = r.wallet;
      });
      this.wallets.set(newWallets);
    });
  }

  getWallet(studentId: number): any | null {
    return this.wallets()[studentId] || null;
  }

  onStatusChange(studentId: number, status: string) {
    this.attendanceMap[studentId] = status;
  }

  setAllStatus(status: string) {
    this.students().forEach(s => {
      this.attendanceMap[s.id] = status;
    });
  }

  submitAttendance() {
    if (!this.selectedClassId) return;

    const payloadStudents = Object.entries(this.attendanceMap).map(([studentId, status]) => ({
      studentId: Number(studentId),
      status
    }));

    if (payloadStudents.length === 0) {
      alert('Không có học sinh nào để điểm danh.');
      return;
    }

    this.submitting.set(true);

    const payload = {
      classId: this.selectedClassId,
      date: new Date(this.attendanceDate).toISOString(),
      students: payloadStudents
    };

    // Post to backend bulk endpoint
    this.http.post<ApiResponse<any>>('/api/attendance/bulk', payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          alert('Điểm danh lớp học thành công! Số buổi ví học phí đã được cập nhật.');
          // Refresh wallets
          this.fetchStudentWallets(this.students());
        } else {
          alert(res.message || 'Gửi điểm danh thất bại.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        alert(err.error?.message || 'Không thể lưu hồ sơ điểm danh.');
      }
    });
  }
}
