import { Component, OnInit, ViewChild, ElementRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { ApiResponse } from '../../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit, OnDestroy {
  loadingChart = signal<boolean>(true);
  chartError = signal<string | null>(null);
  
  exportingExcel = signal<boolean>(false);
  exportingPdf = signal<boolean>(false);

  @ViewChild('revenueChartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchChartData();
  }

  ngOnDestroy() {
    this.destroyChart();
  }

  fetchChartData() {
    this.loadingChart.set(true);
    this.chartError.set(null);

    this.http.get<ApiResponse<any[]>>('/api/reports/revenue-monthly').subscribe({
      next: (res) => {
        this.loadingChart.set(false);
        const data = res.data || [];
        if (data.length > 0) {
          setTimeout(() => this.renderChart(data), 50);
        } else {
          this.chartError.set('Không có dữ liệu doanh thu.');
        }
      },
      error: (err) => {
        this.loadingChart.set(false);
        this.chartError.set('Không thể tải dữ liệu báo cáo tài chính.');
        console.error(err);
      }
    });
  }

  destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  renderChart(data: any[]) {
    this.destroyChart();

    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      // Create blue gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(47, 84, 235, 0.4)');
      gradient.addColorStop(1, 'rgba(47, 84, 235, 0)');

      this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: data.map(item => item.monthName),
          datasets: [{
            label: 'Doanh Thu Hàng Tháng (VND)',
            data: data.map(item => item.revenue),
            borderColor: '#2f54eb',
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
            legend: { position: 'top' }
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

  exportExcel() {
    this.exportingExcel.set(true);
    this.http.get('/api/report-exports/tuition.xlsx', { responseType: 'blob' }).subscribe({
      next: (data) => {
        this.exportingExcel.set(false);
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuition-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('Tải xuống báo cáo Excel thành công.');
      },
      error: (err) => {
        this.exportingExcel.set(false);
        alert('Tải báo cáo Excel thất bại.');
        console.error(err);
      }
    });
  }

  exportPdf() {
    this.exportingPdf.set(true);
    this.http.get('/api/report-exports/summary.pdf', { responseType: 'blob' }).subscribe({
      next: (data) => {
        this.exportingPdf.set(false);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('Tải xuống báo cáo PDF thành công.');
      },
      error: (err) => {
        this.exportingPdf.set(false);
        alert('Tải báo cáo PDF thất bại.');
        console.error(err);
      }
    });
  }
}
