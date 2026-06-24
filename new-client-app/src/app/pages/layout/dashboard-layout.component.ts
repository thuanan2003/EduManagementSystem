import { Component, signal, computed, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto, ApiResponse } from '../../core/models';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  collapsed = signal<boolean>(false);
  showNotifications = signal<boolean>(false);
  profileModalOpen = signal<boolean>(false);
  uploading = signal<boolean>(false);
  profileError = signal<string | null>(null);

  notifications = signal<NotificationDto[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  user = computed(() => this.authService.currentUser());
  roleName = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.roles.includes('Admin')) return 'Administrator';
    if (u.roles.includes('Teacher')) return 'Teacher';
    if (u.roles.includes('Student')) return 'Student';
    return '';
  });

  isAdmin = computed(() => this.user()?.roles.includes('Admin') ?? false);
  isTeacher = computed(() => this.user()?.roles.includes('Teacher') ?? false);
  isStudent = computed(() => this.user()?.roles.includes('Student') ?? false);

  avatarPreview = signal<string>('');
  profileValues = {
    fullName: '',
    phone: '',
    password: '',
    avatarUrl: ''
  };

  private pollInterval: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient
  ) {
    // Synchronize profile values when user loads
    effect(() => {
      const u = this.user();
      if (u) {
        this.profileValues.fullName = u.fullName || '';
        this.profileValues.phone = u.phone || '';
        this.profileValues.avatarUrl = u.avatarUrl || '';
      }
    });

    // Start notification polling
    this.fetchNotifications();
    this.pollInterval = setInterval(() => this.fetchNotifications(), 15000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  toggleSidebar() {
    this.collapsed.update(v => !v);
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  fetchNotifications() {
    const u = this.user();
    if (!u) return;

    if (this.isStudent() && u.studentId) {
      this.notificationService.getByStudent(u.studentId).subscribe({
        next: data => this.notifications.set(data),
        error: () => console.log('Error fetching notifications')
      });
    } else if (this.isTeacher() && u.teacherId) {
      this.notificationService.getByTeacher(u.teacherId).subscribe({
        next: data => this.notifications.set(data),
        error: () => console.log('Error fetching notifications')
      });
    }
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
      },
      error: () => alert('Không thể đánh dấu đã đọc')
    });
  }

  markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    if (unread.length === 0) return;

    const requests = unread.map(n => this.notificationService.markAsRead(n.id).toPromise());
    Promise.all(requests)
      .then(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      })
      .catch(() => alert('Thao tác thất bại'));
  }

  onAvatarError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }

  onPreviewAvatarError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }

  formatSentAt(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  }

  openProfileModal() {
    const u = this.user();
    this.avatarPreview.set(u?.avatarUrl || '');
    this.profileValues = {
      fullName: u?.fullName || '',
      phone: u?.phone || '',
      password: '',
      avatarUrl: u?.avatarUrl || ''
    };
    this.profileError.set(null);
    this.profileModalOpen.set(true);
  }

  closeProfileModal() {
    this.profileModalOpen.set(false);
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
          this.profileValues.avatarUrl = res.data;
        } else {
          alert('Upload failed: ' + res.message);
        }
      },
      error: () => {
        this.uploading.set(false);
        alert('Tải ảnh đại diện lên thất bại');
      }
    });
  }

  saveProfileChanges() {
    if (!this.profileValues.fullName.trim()) {
      this.profileError.set('Họ tên không được để trống');
      return;
    }

    this.authService.updateProfile(this.profileValues).subscribe({
      next: res => {
        if (res.success && res.data) {
          alert('Hồ sơ của bạn đã được cập nhật thành công');
          this.closeProfileModal();
        } else {
          this.profileError.set(res.message || 'Lỗi cập nhật');
        }
      },
      error: err => {
        this.profileError.set(err.error?.message || 'Không thể lưu thay đổi');
      }
    });
  }

  onLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login'])
      });
    }
  }
}
