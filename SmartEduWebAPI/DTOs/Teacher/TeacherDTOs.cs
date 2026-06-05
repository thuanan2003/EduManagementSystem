using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Teacher
{
    public class TeacherDto
    {
        public int Id { get; set; }
        public string TeacherCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public decimal Bonus { get; set; }
        public int ClassCount { get; set; }
        public List<SmartEduWebAPI.DTOs.Class.ClassDto> Classes { get; set; } = new();
    }

    public class TeacherCreateDto
    {
        [Required] public string FullName { get; set; } = string.Empty;
        [Required] public string Specialization { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public decimal Bonus { get; set; }
        public string? AvatarUrl { get; set; }
        [Required] public string Password { get; set; } = string.Empty;
    }

    public class TeacherUpdateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public decimal Bonus { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
