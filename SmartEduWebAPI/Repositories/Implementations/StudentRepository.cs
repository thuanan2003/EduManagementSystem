using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class StudentRepository : GenericRepository<Student>, IStudentRepository
    {
        public StudentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Student?> GetByStudentCodeAsync(string code)
            => await _dbSet.FirstOrDefaultAsync(s => s.StudentCode == code);

        public async Task<Student?> GetByUserIdAsync(string userId)
            => await _dbSet.FirstOrDefaultAsync(s => s.UserId == userId);

        public async Task<IEnumerable<Student>> GetWithFiltersAsync(string? search, string? grade, string? status)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s =>
                    s.FullName.Contains(search) ||
                    s.StudentCode.Contains(search) ||
                    s.ParentPhone.Contains(search));

            if (!string.IsNullOrWhiteSpace(grade))
                query = query.Where(s => s.GradeLevel == grade);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(s => s.StudentStatus == status);

            return await query.OrderBy(s => s.FullName).ToListAsync();
        }

        public async Task<Student?> GetWithDetailsAsync(int id)
            => await _dbSet
                .Include(s => s.Wallet).ThenInclude(w => w.Transactions)
                .Include(s => s.StudentClasses).ThenInclude(sc => sc.Class).ThenInclude(c => c.Course)
                .Include(s => s.StudentClasses).ThenInclude(sc => sc.Class).ThenInclude(c => c.Teacher)
                .Include(s => s.AttendanceRecords)
                .Include(s => s.TuitionRecords)
                .FirstOrDefaultAsync(s => s.Id == id);
    }
}
