using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/report-exports")]
    [Authorize(Roles = SystemRoles.Admin)]
    public class ReportExportsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ReportExportsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("tuition.xlsx")]
        public async Task<IActionResult> ExportTuitionExcel()
        {
            var items = await _dbContext.TuitionRecords
                .Include(x => x.Student)
                .OrderByDescending(x => x.DueDate)
                .Select(x => new
                {
                    x.Id,
                    StudentCode = x.Student.StudentCode,
                    StudentName = x.Student.FullName,
                    x.Amount,
                    x.Status,
                    x.DueDate,
                    x.PaidAt,
                    x.PaymentMethod
                })
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Tuition");
            ws.Cell(1, 1).Value = "Id";
            ws.Cell(1, 2).Value = "StudentCode";
            ws.Cell(1, 3).Value = "StudentName";
            ws.Cell(1, 4).Value = "Amount";
            ws.Cell(1, 5).Value = "Status";
            ws.Cell(1, 6).Value = "DueDate";
            ws.Cell(1, 7).Value = "PaidAt";
            ws.Cell(1, 8).Value = "PaymentMethod";

            for (var i = 0; i < items.Count; i++)
            {
                var row = i + 2;
                ws.Cell(row, 1).Value = items[i].Id;
                ws.Cell(row, 2).Value = items[i].StudentCode;
                ws.Cell(row, 3).Value = items[i].StudentName;
                ws.Cell(row, 4).Value = (double)items[i].Amount;
                ws.Cell(row, 5).Value = items[i].Status;
                ws.Cell(row, 6).Value = items[i].DueDate.ToString("yyyy-MM-dd");
                ws.Cell(row, 7).Value = items[i].PaidAt?.ToString("yyyy-MM-dd") ?? "";
                ws.Cell(row, 8).Value = items[i].PaymentMethod;
            }

            ws.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return File(ms.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "tuition-report.xlsx");
        }

        [HttpGet("summary.pdf")]
        public async Task<IActionResult> ExportSummaryPdf()
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var totalStudents = await _dbContext.Students.CountAsync();
            var totalTeachers = await _dbContext.Teachers.CountAsync();
            var totalClasses = await _dbContext.Classes.CountAsync();
            var totalCourses = await _dbContext.Courses.CountAsync();
            var paidTuition = await _dbContext.TuitionRecords.Where(x => x.Status == "Paid").SumAsync(x => (decimal?)x.Amount) ?? 0m;

            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Text("SmartEdu - Summary Report").SemiBold().FontSize(18);
                    page.Content().PaddingTop(10).Column(col =>
                    {
                        col.Spacing(6);
                        col.Item().Text($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().Text($"Total Students: {totalStudents}");
                        col.Item().Text($"Total Teachers: {totalTeachers}");
                        col.Item().Text($"Total Classes: {totalClasses}");
                        col.Item().Text($"Total Courses: {totalCourses}");
                        col.Item().Text($"Paid Tuition: {paidTuition:n0}");
                    });
                });
            });

            var bytes = doc.GeneratePdf();
            return File(bytes, "application/pdf", "summary-report.pdf");
        }
    }
}
