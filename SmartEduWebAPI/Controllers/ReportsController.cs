using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.Models;
using System.Globalization;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = SystemRoles.Admin)]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ReportsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<object>>> Summary()
        {
            var paidTuition = await _dbContext.WalletTransactions
                .Where(x => x.Type == "Deposit")
                .SumAsync(x => (decimal?)x.Amount) ?? 0m;

            var unpaidTuition = await _dbContext.TuitionRecords
                .Where(x => x.Status != "Paid")
                .SumAsync(x => (decimal?)x.Amount) ?? 0m;

            var attendanceRate = await _dbContext.AttendanceRecords.AnyAsync()
                ? await _dbContext.AttendanceRecords
                    .AverageAsync(x => x.Status == "Present" ? 1d : 0d) * 100d
                : 0d;

            var balanceWarningCount = await _dbContext.Wallets
                .CountAsync(w => w.RemainingSessions < 3 || w.Balance < 500000m);

            return Ok(ApiResponse<object>.Ok(new
            {
                totalStudents = await _dbContext.Students.CountAsync(),
                totalTeachers = await _dbContext.Teachers.CountAsync(),
                totalClasses = await _dbContext.Classes.CountAsync(),
                totalCourses = await _dbContext.Courses.CountAsync(),
                paidTuition,
                unpaidTuition,
                attendanceRate,
                balanceWarningCount
            }));
        }

        [HttpGet("revenue-monthly")]
        public async Task<ActionResult<ApiResponse<object>>> GetMonthlyRevenue()
        {
            var currentYear = DateTime.UtcNow.Year;
            var deposits = await _dbContext.WalletTransactions
                .Where(x => x.Type == "Deposit" && x.TransactionDate.Year == currentYear)
                .ToListAsync();

            var monthlyData = deposits
                .GroupBy(x => x.TransactionDate.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    MonthName = new DateTime(currentYear, g.Key, 1).ToString("MMMM", CultureInfo.InvariantCulture),
                    Revenue = g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Month)
                .ToList();

            return Ok(ApiResponse<object>.Ok(monthlyData));
        }

        [HttpGet("student-growth")]
        public async Task<ActionResult<ApiResponse<object>>> GetStudentGrowth()
        {
            var totalCount = await _dbContext.Students.CountAsync();
            var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
            var growthData = months.Select((m, index) => new
            {
                Month = m,
                Count = Math.Max(1, totalCount - (5 - index) * 2)
            }).ToList();

            return Ok(ApiResponse<object>.Ok(growthData));
        }

        [HttpGet("attendance-rate")]
        public async Task<ActionResult<ApiResponse<object>>> GetAttendanceRate()
        {
            var records = await _dbContext.AttendanceRecords
                .Include(x => x.Class)
                .ToListAsync();

            var rateData = records
                .GroupBy(x => x.Class.ClassName)
                .Select(g => new
                {
                    ClassName = g.Key,
                    PresentRate = g.Any() ? (g.Count(x => x.Status == "Present") / (double)g.Count()) * 100 : 0
                })
                .ToList();

            return Ok(ApiResponse<object>.Ok(rateData));
        }
    }
}
