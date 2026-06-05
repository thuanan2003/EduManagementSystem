using SmartEduWebAPI.DTOs.Student;

namespace SmartEduWebAPI.Services.Interfaces
{
    public interface IStudentService
    {
        Task<IEnumerable<StudentDto>> GetAllAsync(string? search, string? grade, string? status);
        Task<StudentDto?> GetByIdAsync(int id);
        Task<StudentDto?> GetByUserIdAsync(string userId);
        Task<StudentDto> CreateAsync(StudentCreateDto dto);
        Task<StudentDto?> UpdateAsync(int id, StudentUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
