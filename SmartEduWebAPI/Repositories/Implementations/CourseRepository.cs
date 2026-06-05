using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class CourseRepository : GenericRepository<Course>, ICourseRepository
    {
        public CourseRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Course?> GetByCourseCodeAsync(string code)
            => await _dbSet.FirstOrDefaultAsync(c => c.CourseCode == code);
    }
}
