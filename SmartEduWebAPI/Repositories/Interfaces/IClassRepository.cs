using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface IClassRepository : IGenericRepository<Class>
    {
        Task<Class?> GetWithDetailsAsync(int id);
        Task<IEnumerable<Class>> GetByTeacherAsync(int teacherId);
        Task<IEnumerable<Class>> GetByStudentAsync(int studentId);
    }
}
