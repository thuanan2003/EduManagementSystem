using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface ITeacherRepository : IGenericRepository<Teacher>
    {
        Task<Teacher?> GetByUserIdAsync(string userId);
        Task<Teacher?> GetWithClassesAsync(int id);
    }
}
