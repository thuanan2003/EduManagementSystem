using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Student
{
    public class StudentDto
    {
        public int Id { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SchoolName { get; set; } = string.Empty;
        public string GradeLevel { get; set; } = string.Empty;
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string StudentStatus { get; set; } = string.Empty;
        public decimal? WalletBalance { get; set; }
        public int? RemainingSessions { get; set; }
    }

    public class StudentCreateDto
    {
        [Required] public string FullName { get; set; } = string.Empty;
        [Required] public DateTime DateOfBirth { get; set; }
        [Required] public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] public string SchoolName { get; set; } = string.Empty;
        [Required] public string GradeLevel { get; set; } = string.Empty;
        [Required] public string ParentName { get; set; } = string.Empty;
        [Required] public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        public string HealthNote { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        [Required] public string Password { get; set; } = string.Empty;
    }

    public class StudentUpdateDto
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string SchoolName { get; set; } = string.Empty;
        public string GradeLevel { get; set; } = string.Empty;
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string StudentStatus { get; set; } = string.Empty;
    }
}
