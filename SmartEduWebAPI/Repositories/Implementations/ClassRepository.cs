using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class ClassRepository : GenericRepository<Class>, IClassRepository
    {
        public ClassRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Class?> GetWithDetailsAsync(int id)
            => await _dbSet
                .Include(c => c.Course)
                .Include(c => c.Teacher)
                .Include(c => c.StudentClasses).ThenInclude(sc => sc.Student)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<IEnumerable<Class>> GetByTeacherAsync(int teacherId)
            => await _dbSet
                .Include(c => c.Course)
                .Where(c => c.TeacherId == teacherId)
                .ToListAsync();

        public async Task<IEnumerable<Class>> GetByStudentAsync(int studentId)
            => await _dbSet
                .Include(c => c.Course)
                .Include(c => c.Teacher)
                .Where(c => c.StudentClasses.Any(sc => sc.StudentId == studentId))
                .ToListAsync();
    }
}
