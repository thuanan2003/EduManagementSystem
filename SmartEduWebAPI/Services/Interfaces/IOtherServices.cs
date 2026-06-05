using SmartEduWebAPI.DTOs.Teacher;
using SmartEduWebAPI.DTOs.Course;
using SmartEduWebAPI.DTOs.Class;
using SmartEduWebAPI.DTOs.Attendance;
using SmartEduWebAPI.DTOs.Wallet;
using SmartEduWebAPI.DTOs.Dashboard;

namespace SmartEduWebAPI.Services.Interfaces
{
    public interface ITeacherService
    {
        Task<IEnumerable<TeacherDto>> GetAllAsync();
        Task<TeacherDto?> GetByIdAsync(int id);
        Task<TeacherDto?> GetByUserIdAsync(string userId);
        Task<TeacherDto> CreateAsync(TeacherCreateDto dto);
        Task<TeacherDto?> UpdateAsync(int id, TeacherUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public interface ICourseService
    {
        Task<IEnumerable<CourseDto>> GetAllAsync();
        Task<CourseDto?> GetByIdAsync(int id);
        Task<CourseDto> CreateAsync(CourseCreateDto dto);
        Task<CourseDto?> UpdateAsync(int id, CourseUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public interface IClassService
    {
        Task<IEnumerable<ClassDto>> GetAllAsync();
        Task<ClassDto?> GetByIdAsync(int id);
        Task<IEnumerable<ClassDto>> GetByTeacherAsync(int teacherId);
        Task<IEnumerable<ClassDto>> GetByStudentAsync(int studentId);
        Task<ClassDto> CreateAsync(ClassCreateDto dto);
        Task<ClassDto?> UpdateAsync(int id, ClassUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> AssignStudentAsync(AssignStudentDto dto);
        Task<bool> RemoveStudentAsync(int classId, int studentId);
    }

    public interface IAttendanceService
    {
        Task<IEnumerable<AttendanceDto>> GetByStudentAsync(int studentId);
        Task<IEnumerable<AttendanceDto>> GetByClassAndDateAsync(int classId, DateTime date);
        Task<AttendanceDto> MarkAttendanceAsync(MarkAttendanceDto dto);
        Task MarkBulkAttendanceAsync(BulkAttendanceDto dto);
    }

    public interface IWalletService
    {
        Task<WalletDto?> GetByStudentIdAsync(int studentId);
        Task<WalletDto> DepositAsync(DepositDto dto);
        Task<WalletDto> RefundAsync(RefundDto dto);
        Task<bool> DeductAsync(int studentId, decimal amount, string description);
    }

    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStatsAsync();
    }
}
