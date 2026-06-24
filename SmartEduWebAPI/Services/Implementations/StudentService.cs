using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SmartEduWebAPI.DTOs.Student;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;
using SmartEduWebAPI.Services.Interfaces;

namespace SmartEduWebAPI.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _repo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public StudentService(IStudentRepository repo, UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _repo = repo;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<StudentDto>> GetAllAsync(string? search, string? grade, string? status)
        {
            var students = await _repo.GetWithFiltersAsync(search, grade, status);
            return _mapper.Map<IEnumerable<StudentDto>>(students);
        }

        public async Task<StudentDto?> GetByIdAsync(int id)
        {
            var student = await _repo.GetWithDetailsAsync(id);
            return student == null ? null : _mapper.Map<StudentDto>(student);
        }

        public async Task<StudentDto?> GetByUserIdAsync(string userId)
        {
            var student = await _repo.GetByUserIdAsync(userId);
            return student == null ? null : _mapper.Map<StudentDto>(student);
        }

        public async Task<StudentDto> CreateAsync(StudentCreateDto dto)
        {
            // Create identity user
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                EmailConfirmed = true,
                FullName = dto.FullName,
                AvatarUrl = dto.AvatarUrl ?? string.Empty
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            await _userManager.AddToRoleAsync(user, SystemRoles.Student);

            // Generate student code
            var students = await _repo.GetAllAsync();
            var nextNum = 1;
            if (students.Any())
            {
                nextNum = students
                    .Select(s => {
                        var parts = s.StudentCode.Split('-');
                        return parts.Length > 1 && int.TryParse(parts[1], out var val) ? val : 0;
                    })
                    .Max() + 1;
            }
            var student = _mapper.Map<Student>(dto);
            student.StudentCode = $"S-{nextNum:D3}";
            student.UserId = user.Id;
            student.AvatarUrl = dto.AvatarUrl ?? string.Empty;
            student.Wallet = new Wallet { Balance = 0, RemainingSessions = 0 };

            await _repo.AddAsync(student);
            await _repo.SaveChangesAsync();

            return _mapper.Map<StudentDto>(student);
        }

        public async Task<StudentDto?> UpdateAsync(int id, StudentUpdateDto dto)
        {
            var student = await _repo.GetByIdAsync(id);
            if (student == null) return null;
            _mapper.Map(dto, student);
            _repo.Update(student);
            await _repo.SaveChangesAsync();

            // Synchronize with ApplicationUser
            var user = await _userManager.FindByIdAsync(student.UserId);
            if (user != null)
            {
                user.FullName = student.FullName;
                if (!string.IsNullOrEmpty(student.AvatarUrl))
                {
                    user.AvatarUrl = student.AvatarUrl;
                }
                await _userManager.UpdateAsync(user);
            }

            return _mapper.Map<StudentDto>(student);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var student = await _repo.GetByIdAsync(id);
            if (student == null) return false;

            // Also delete identity user
            var user = await _userManager.FindByIdAsync(student.UserId);
            if (user != null) await _userManager.DeleteAsync(user);

            _repo.Remove(student);
            await _repo.SaveChangesAsync();
            return true;
        }
    }
}
