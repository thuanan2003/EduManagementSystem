import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ClassService } from '../../../core/services/class.service';
import { WalletDto, ClassDto } from '../../../core/models';

@Component({
  selector: 'app-student-tuition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tuition.component.html',
  styleUrl: './tuition.component.css'
})
export class TuitionComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  wallet = signal<WalletDto | null>(null);
  classes = signal<ClassDto[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private classService: ClassService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    const u = this.user();
    if (!u || !u.studentId) {
      this.loading.set(false);
      return;
    }

    this.walletService.getByStudent(u.studentId).subscribe({
      next: (w) => {
        this.wallet.set(w);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.classService.getByStudent(u.studentId).subscribe({
      next: (list) => {
        this.classes.set(list);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  checkLoading() {
    if (this.wallet() !== null) {
      this.loading.set(false);
    }
  }

  transactions() {
    return this.wallet()?.transactions || [];
  }

  depletionInfo = computed(() => {
    const w = this.wallet();
    const enrolled = this.classes();
    if (!w) return null;

    const sessionsPerWeek = enrolled.length;
    const remaining = w.remainingSessions || 0;

    if (sessionsPerWeek > 0) {
      const weeksRemaining = Math.floor(remaining / sessionsPerWeek);
      const daysRemaining = Math.floor((remaining % sessionsPerWeek) * (7 / sessionsPerWeek));
      const totalDays = weeksRemaining * 7 + daysRemaining;

      const depletionDate = new Date();
      depletionDate.setDate(depletionDate.getDate() + totalDays);
      const depletionDateStr = `${depletionDate.getDate().toString().padStart(2, '0')}/${(depletionDate.getMonth() + 1).toString().padStart(2, '0')}/${depletionDate.getFullYear()}`;

      if (remaining < 3) {
        return {
          bg: 'var(--status-danger-bg)',
          color: 'var(--status-danger)',
          icon: 'bi-exclamation-octagon-fill',
          title: 'Cảnh báo hết học phí: Yêu cầu nạp ví!',
          message: `Tài khoản ví học phí của bạn chỉ còn lại ${remaining} buổi học. Với lịch học hiện tại là ${sessionsPerWeek} buổi/tuần, số học phí này dự kiến sẽ hết vào ngày ${depletionDateStr} (khoảng ${totalDays} ngày nữa). Vui lòng liên hệ trung tâm để nạp ví học phí.`
        };
      } else if (remaining < 6) {
        return {
          bg: 'var(--status-warning-bg)',
          color: 'var(--status-warning)',
          icon: 'bi-exclamation-triangle-fill',
          title: 'Cảnh báo sắp hết học phí',
          message: `Tài khoản ví học phí còn lại ${remaining} buổi học. Dự kiến học phí sẽ hết vào khoảng ngày ${depletionDateStr} (khoảng ${weeksRemaining} tuần nữa). Vui lòng cân nhắc nạp ví học phí sớm.`
        };
      } else {
        return {
          bg: 'var(--status-success-bg)',
          color: 'var(--status-success)',
          icon: 'bi-check-circle-fill',
          title: 'Tài khoản ví học phí ổn định',
          message: `Với lịch học hiện tại là ${sessionsPerWeek} buổi/tuần, ${remaining} buổi còn lại của bạn đủ dùng đến ngày ${depletionDateStr} (khoảng ${weeksRemaining} tuần nữa).`
        };
      }
    } else {
      return {
        bg: 'var(--status-info-bg)',
        color: 'var(--status-info)',
        icon: 'bi-info-circle-fill',
        title: 'Chưa tham gia lớp học nào',
        message: `Bạn hiện không tham gia lớp học hoạt động nào, số buổi học phí trong ví của bạn sẽ không bị khấu trừ.`
      };
    }
  });

  getTxTypeName(type: string): string {
    switch (type) {
      case 'Deposit': return 'Nạp tiền';
      case 'Deduction': return 'Khấu trừ học phí';
      case 'Refund': return 'Hoàn trả';
      default: return type;
    }
  }

  formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '0 VND';
    return value.toLocaleString('vi-VN') + ' VND';
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
}
