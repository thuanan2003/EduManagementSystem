using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public NotificationsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Student/Admin: Get notifications for student
        [HttpGet("student/{studentId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<Notification>>>> GetStudentNotifications(int studentId)
        {
            var notifications = await _dbContext.Notifications
                .Where(n => n.StudentId == studentId)
                .OrderByDescending(n => n.SentAt)
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<Notification>>.Ok(notifications, "Notifications retrieved successfully"));
        }

        // Teacher: Get notifications for teacher
        [HttpGet("teacher/{teacherId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<Notification>>>> GetTeacherNotifications(int teacherId)
        {
            var notifications = await _dbContext.Notifications
                .Where(n => n.TeacherId == teacherId)
                .OrderByDescending(n => n.SentAt)
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<Notification>>.Ok(notifications, "Notifications retrieved successfully"));
        }

        // Student: Mark notification as read
        [HttpPut("{id:int}/read")]
        public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(int id)
        {
            var notification = await _dbContext.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound(ApiResponse<object>.Fail("Notification not found"));
            }

            notification.IsRead = true;
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { id }, "Notification marked as read"));
        }

        // Student/Admin: Delete notification
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
        {
            var notification = await _dbContext.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound(ApiResponse<object>.Fail("Notification not found"));
            }

            _dbContext.Notifications.Remove(notification);
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { id }, "Notification deleted successfully"));
        }
    }
}
