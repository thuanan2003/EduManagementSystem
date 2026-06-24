import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WalletDto, NotificationDto, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  wallet = signal<WalletDto | null>(null);
  notifications = signal<NotificationDto[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient
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
      error: (err) => {
        console.error(err);
        this.checkLoading();
      }
    });

    this.notificationService.getByStudent(u.studentId).subscribe({
      next: (list) => {
        this.notifications.set(list);
        this.checkLoading();
      },
      error: (err) => {
        console.error(err);
        this.checkLoading();
      }
    });
  }

  checkLoading() {
    if (this.wallet() !== null) {
      this.loading.set(false);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    });
  }

  deleteNotification(id: number) {
    if (confirm('Bạn có muốn xóa thông báo này không?')) {
      this.http.delete<ApiResponse<boolean>>(`/api/notifications/${id}`).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifications.update(list => list.filter(n => n.id !== id));
          }
        }
      });
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
