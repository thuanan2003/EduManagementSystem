using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface IAttendanceRepository : IGenericRepository<AttendanceRecord>
    {
        Task<IEnumerable<AttendanceRecord>> GetByStudentAsync(int studentId);
        Task<IEnumerable<AttendanceRecord>> GetByClassAsync(int classId, DateTime date);
        Task<AttendanceRecord?> GetExistingAsync(int studentId, int classId, DateTime date);
    }
}
