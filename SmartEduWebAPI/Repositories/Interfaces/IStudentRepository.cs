using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface IStudentRepository : IGenericRepository<Student>
    {
        Task<Student?> GetByStudentCodeAsync(string code);
        Task<Student?> GetByUserIdAsync(string userId);
        Task<IEnumerable<Student>> GetWithFiltersAsync(string? search, string? grade, string? status);
        Task<Student?> GetWithDetailsAsync(int id);
    }
}
