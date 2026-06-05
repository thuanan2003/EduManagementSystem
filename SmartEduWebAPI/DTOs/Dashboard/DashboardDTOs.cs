namespace SmartEduWebAPI.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalClasses { get; set; }
        public int TotalCourses { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int TodayAttendance { get; set; }
        public int ActiveStudents { get; set; }
        public int PendingAbsenceRequests { get; set; }
        public List<MonthlyRevenueDto> RevenueChart { get; set; } = new();
        public List<AttendanceRateDto> AttendanceChart { get; set; } = new();
    }

    public class MonthlyRevenueDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
    }

    public class AttendanceRateDto
    {
        public string Date { get; set; } = string.Empty;
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Late { get; set; }
    }
}
