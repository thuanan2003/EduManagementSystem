using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Course
{
    public class CourseDto
    {
        public int Id { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public decimal TuitionFee { get; set; }
        public decimal PricePerSession { get; set; }
        public int TotalSessions { get; set; }
        public int DurationWeeks { get; set; }
        public int MaxStudents { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ClassCount { get; set; }
    }

    public class CourseCreateDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Subject { get; set; } = string.Empty;
        [Required] public string Grade { get; set; } = string.Empty;
        [Range(0, double.MaxValue)] public decimal TuitionFee { get; set; }
        [Range(0, double.MaxValue)] public decimal PricePerSession { get; set; }
        [Range(1, 200)] public int TotalSessions { get; set; }
        public int DurationWeeks { get; set; }
        public int MaxStudents { get; set; } = 20;
        public string Description { get; set; } = string.Empty;
    }

    public class CourseUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public decimal TuitionFee { get; set; }
        public decimal PricePerSession { get; set; }
        public int TotalSessions { get; set; }
        public int MaxStudents { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
