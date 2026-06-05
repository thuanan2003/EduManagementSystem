using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/absence-requests")]
    [Authorize]
    public class AbsenceRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public AbsenceRequestsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Student creates request
        [HttpPost]
        [Authorize(Roles = SystemRoles.Student)]
        public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] AbsenceRequest request)
        {
            _dbContext.AbsenceRequests.Add(request);
            await _dbContext.SaveChangesAsync();

            // Create notification for the teacher
            var student = await _dbContext.Students.FindAsync(request.StudentId);
            var classItem = await _dbContext.Classes.FindAsync(request.ClassId);
            if (student != null && classItem != null)
            {
                var notification = new Notification
                {
                    TeacherId = classItem.TeacherId,
                    Title = "Yêu cầu báo vắng học mới",
                    Message = $"Học sinh {student.FullName} đã gửi yêu cầu báo vắng cho lớp {classItem.ClassName}.",
                    Type = "AbsenceNotice",
                    IsRead = false,
                    SentAt = DateTime.UtcNow
                };
                _dbContext.Notifications.Add(notification);
                await _dbContext.SaveChangesAsync();
            }

            return Ok(ApiResponse<object>.Ok(new { request.Id }, "Request created"));
        }

        // Student views their own requests
        [HttpGet("student/{studentId:int}")]
        [Authorize(Roles = "Admin,Student")]
        public async Task<ActionResult<ApiResponse<object>>> GetByStudent(int studentId)
        {
            var items = await _dbContext.AbsenceRequests
                .Include(x => x.Class)
                .Where(x => x.StudentId == studentId)
                .OrderByDescending(x => x.RequestedAt)
                .Select(x => new
                {
                    x.Id,
                    x.ClassId,
                    ClassName = x.Class.ClassName,
                    x.Reason,
                    x.Status,
                    x.RequestedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(items, "Student requests retrieved"));
        }

        // Admin views all requests
        [HttpGet]
        [Authorize(Roles = SystemRoles.Admin)]
        public async Task<ActionResult<ApiResponse<object>>> GetAll()
        {
            var items = await _dbContext.AbsenceRequests
                .Include(x => x.Student)
                .Include(x => x.Class)
                .OrderByDescending(x => x.RequestedAt)
                .Select(x => new
                {
                    x.Id,
                    x.StudentId,
                    StudentName = x.Student.FullName,
                    x.ClassId,
                    ClassName = x.Class.ClassName,
                    x.Reason,
                    x.Status,
                    x.RequestedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(items, "Requests retrieved"));
        }

        // Admin approves/rejects
        [HttpPut("{id:int}/status")]
        [Authorize(Roles = SystemRoles.Admin)]
        public async Task<ActionResult<ApiResponse<object>>> UpdateStatus(int id, [FromBody] string status)
        {
            var item = await _dbContext.AbsenceRequests.FindAsync(id);
            if (item == null)
            {
                return NotFound(ApiResponse<object>.Fail("Request not found"));
            }

            item.Status = status;
            await _dbContext.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { id, status }, "Status updated"));
        }
    }
}
