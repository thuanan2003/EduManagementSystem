import { Component, OnInit, ViewChild, ElementRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStatsDto } from '../../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, OnDestroy {
  stats = signal<DashboardStatsDto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  kpiRow1 = signal<any[]>([]);

  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceCanvas') attendanceCanvas!: ElementRef<HTMLCanvasElement>;

  revenueChartInstance: Chart | null = null;
  attendanceChartInstance: Chart | null = null;

  rules = [
    'Attendance marked Present → Auto-deduct wallet',
    'Unexcused Absence → Auto-deduct wallet',
    'Excused Absence → No deduction',
    'Duplicate deduction prevented via IsDeducted flag',
    'Daily job: warn wallets < 3 sessions or < 500,000 VND',
    'Student transfer preserves remaining sessions'
  ];

  private pollInterval: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadStats();
    this.pollInterval = setInterval(() => this.loadStats(false), 60000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.destroyCharts();
  }

  loadStats(showSpinner = true) {
    if (showSpinner) this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        this.updateKPIs(data);
        // Delay to let ViewChild bindings resolve after rendering
        setTimeout(() => this.initCharts(data), 50);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Could not load dashboard statistics. Make sure the backend is running.');
        console.error(err);
      }
    });
  }

  updateKPIs(data: DashboardStatsDto) {
    this.kpiRow1.set([
      { title: 'Total Students', value: data.totalStudents, icon: 'bi bi-people', color: '#1890ff' },
      { title: 'Total Teachers', value: data.totalTeachers, icon: 'bi bi-person-badge', color: '#52c41a' },
      { title: 'Total Classes', value: data.totalClasses, icon: 'bi bi-building', color: '#722ed1' },
      { title: 'Total Courses', value: data.totalCourses, icon: 'bi bi-book', color: '#fa8c16' }
    ]);
  }

  destroyCharts() {
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
      this.revenueChartInstance = null;
    }
    if (this.attendanceChartInstance) {
      this.attendanceChartInstance.destroy();
      this.attendanceChartInstance = null;
    }
  }

  initCharts(data: DashboardStatsDto) {
    this.destroyCharts();

    const revenueData = data.revenueChart || [];
    const attendanceData = data.attendanceChart || [];

    // Initialize Revenue Area Chart
    if (this.revenueCanvas && revenueData.length > 0) {
      const ctx = this.revenueCanvas.nativeElement.getContext('2d');
      if (ctx) {
        // Create blue gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(24, 144, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(24, 144, 255, 0)');

        this.revenueChartInstance = new Chart(this.revenueCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: revenueData.map(item => item.month),
            datasets: [{
              label: 'Revenue (VND)',
              data: revenueData.map(item => item.revenue),
              borderColor: '#1890ff',
              borderWidth: 2,
              fill: true,
              backgroundColor: gradient,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => {
                    return (Number(value) / 1000000).toFixed(1) + 'M';
                  }
                }
              }
            }
          }
        });
      }
    }

    // Initialize Attendance Bar Chart
    if (this.attendanceCanvas && attendanceData.length > 0) {
      this.attendanceChartInstance = new Chart(this.attendanceCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: attendanceData.map(item => item.date),
          datasets: [
            {
              label: 'Present',
              data: attendanceData.map(item => item.present),
              backgroundColor: '#52c41a',
              borderRadius: 4
            },
            {
              label: 'Absent',
              data: attendanceData.map(item => item.absent),
              backgroundColor: '#ff4d4f',
              borderRadius: 4
            },
            {
              label: 'Late',
              data: attendanceData.map(item => item.late),
              backgroundColor: '#faad14',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: false },
            y: { stacked: false, beginAtZero: true }
          }
        }
      });
    }
  }

  formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '0 VND';
    return value.toLocaleString('vi-VN') + ' VND';
  }
}
