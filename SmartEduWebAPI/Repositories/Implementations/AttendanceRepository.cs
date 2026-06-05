using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class AttendanceRepository : GenericRepository<AttendanceRecord>, IAttendanceRepository
    {
        public AttendanceRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<AttendanceRecord>> GetByStudentAsync(int studentId)
            => await _dbSet
                .Include(a => a.Class).ThenInclude(c => c.Course)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();

        public async Task<IEnumerable<AttendanceRecord>> GetByClassAsync(int classId, DateTime date)
            => await _dbSet
                .Include(a => a.Student)
                .Where(a => a.ClassId == classId && a.AttendanceDate.Date == date.Date)
                .ToListAsync();

        public async Task<AttendanceRecord?> GetExistingAsync(int studentId, int classId, DateTime date)
            => await _dbSet.FirstOrDefaultAsync(a =>
                a.StudentId == studentId &&
                a.ClassId == classId &&
                a.AttendanceDate.Date == date.Date);
    }
}
