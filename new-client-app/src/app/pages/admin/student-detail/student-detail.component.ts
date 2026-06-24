import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StudentService } from '../../../core/services/student.service';
import { WalletService } from '../../../core/services/wallet.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { StudentDto, WalletDto, AttendanceDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  studentId!: number;
  student = signal<StudentDto | null>(null);
  wallet = signal<WalletDto | null>(null);
  attendance = signal<AttendanceDto[]>([]);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<string>('profile');

  // Modals
  depositModalOpen = signal<boolean>(false);
  refundModalOpen = signal<boolean>(false);
  submitting = signal<boolean>(false);
  modalError = signal<string | null>(null);

  depositForm!: FormGroup;
  refundForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private studentService: StudentService,
    private walletService: WalletService,
    private attendanceService: AttendanceService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.studentId = idParam ? Number(idParam) : 0;
  }

  ngOnInit() {
    if (!this.studentId) {
      this.error.set('Mã học sinh không hợp lệ');
      this.loading.set(false);
      return;
    }

    this.loadData();
    this.initForms();
  }

  initForms() {
    this.depositForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
      sessions: [null, [Validators.required, Validators.min(1)]],
      description: ['Nạp ví học phí', Validators.required]
    });

    this.refundForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      sessions: [null, [Validators.required, Validators.min(0)]],
      description: ['Hoàn tiền học phí', Validators.required]
    });
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    // Call parallel fetches using RxJS or async/await, since HttpClient is used let's subscribe.
    // Fetch profile
    this.studentService.getById(this.studentId).subscribe({
      next: (student) => {
        this.student.set(student);
        this.checkLoadingState();
      },
      error: (err) => {
        this.error.set('Không thể tải hồ sơ học sinh. Vui lòng kiểm tra kết nối.');
        this.loading.set(false);
        console.error(err);
      }
    });

    // Fetch wallet
    this.walletService.getByStudent(this.studentId).subscribe({
      next: (walletObj) => {
        this.wallet.set(walletObj);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Failed to load wallet details', err);
        this.checkLoadingState();
      }
    });

    // Fetch attendance: note: React codebase uses '/attendance/me/' + id.
    // Let's call /api/attendance/student/${id} which matches studentService or getByStudent on backend
    this.attendanceService.getByStudent(this.studentId).subscribe({
      next: (list) => {
        this.attendance.set(list);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Failed to load attendance logs', err);
        this.checkLoadingState();
      }
    });
  }

  checkLoadingState() {
    // If we have student profile loaded, we can consider loaded
    if (this.student()) {
      this.loading.set(false);
    }
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  goBack() {
    this.router.navigate(['/admin/students']);
  }

  openDepositModal() {
    this.modalError.set(null);
    this.depositForm.patchValue({
      amount: null,
      sessions: null,
      description: 'Nạp ví học phí'
    });
    this.depositModalOpen.set(true);
  }

  closeDepositModal() {
    this.depositModalOpen.set(false);
  }

  submitDeposit() {
    if (this.depositForm.invalid) return;

    this.submitting.set(true);
    this.modalError.set(null);

    const payload = {
      studentId: this.studentId,
      ...this.depositForm.value
    };

    // React mutation called /wallet/deposit
    this.http.post<ApiResponse<any>>('/api/wallet/deposit', payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          alert('Nạp tiền vào ví thành công!');
          this.closeDepositModal();
          this.refreshWallet();
        } else {
          this.modalError.set(res.message || 'Lỗi nạp tiền');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.modalError.set(err.error?.message || 'Có lỗi xảy ra khi nạp tiền.');
      }
    });
  }

  openRefundModal() {
    this.modalError.set(null);
    this.refundForm.patchValue({
      amount: null,
      sessions: null,
      description: 'Hoàn tiền học phí'
    });
    this.refundModalOpen.set(true);
  }

  closeRefundModal() {
    this.refundModalOpen.set(false);
  }

  submitRefund() {
    if (this.refundForm.invalid) return;

    this.submitting.set(true);
    this.modalError.set(null);

    const payload = {
      studentId: this.studentId,
      ...this.refundForm.value
    };

    // React mutation called /wallet/refund
    this.http.post<ApiResponse<any>>('/api/wallet/refund', payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          alert('Hoàn trả tiền / khấu trừ thành công!');
          this.closeRefundModal();
          this.refreshWallet();
        } else {
          this.modalError.set(res.message || 'Lỗi hoàn tiền');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.modalError.set(err.error?.message || 'Có lỗi xảy ra khi hoàn tiền.');
      }
    });
  }

  refreshWallet() {
    this.walletService.getByStudent(this.studentId).subscribe({
      next: (walletObj) => {
        this.wallet.set(walletObj);
      }
    });
  }

  transactions() {
    return this.wallet()?.transactions || [];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'success';
      case 'Suspended': return 'warning';
      case 'Reserved': return 'info';
      case 'Dropped': return 'danger';
      default: return 'info';
    }
  }

  getAttendanceStatusClass(status: string): string {
    switch (status) {
      case 'Present': return 'success';
      case 'Excused': return 'warning';
      case 'Unexcused': return 'danger';
      case 'Late': return 'info';
      default: return 'info';
    }
  }

  formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '0 VND';
    return value.toLocaleString('vi-VN') + ' VND';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      const date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      return `${time} ${date}`;
    } catch {
      return dateStr;
    }
  }

  hasFormError(form: FormGroup, controlName: string, errorName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  onAvatarError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
}
