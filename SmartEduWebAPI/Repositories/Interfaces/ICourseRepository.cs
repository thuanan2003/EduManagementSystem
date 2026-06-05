using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface ICourseRepository : IGenericRepository<Course>
    {
        Task<Course?> GetByCourseCodeAsync(string code);
    }
}
