using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class TeacherRepository : GenericRepository<Teacher>, ITeacherRepository
    {
        public TeacherRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Teacher?> GetByUserIdAsync(string userId)
            => await _dbSet.FirstOrDefaultAsync(t => t.UserId == userId);

        public async Task<Teacher?> GetWithClassesAsync(int id)
            => await _dbSet
                .Include(t => t.Classes).ThenInclude(c => c.Course)
                .FirstOrDefaultAsync(t => t.Id == id);
    }
}
