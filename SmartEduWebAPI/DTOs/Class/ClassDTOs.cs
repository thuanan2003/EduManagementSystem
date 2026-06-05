using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Class
{
    public class ClassDto
    {
        public int Id { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string ScheduleDay { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int StudentCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<StudentClassDto> StudentClasses { get; set; } = new();
    }

    public class StudentClassDto
    {
        public int StudentId { get; set; }
        public SmartEduWebAPI.DTOs.Student.StudentDto Student { get; set; } = null!;
        public int RemainingSessions { get; set; }
    }


    public class ClassCreateDto
    {
        [Required] public string ClassName { get; set; } = string.Empty;
        [Required] public int CourseId { get; set; }
        [Required] public int TeacherId { get; set; }
        [Required] public string ScheduleDay { get; set; } = string.Empty;
        [Required] public string StartTime { get; set; } = string.Empty; // HH:mm
        [Required] public string EndTime { get; set; } = string.Empty;
        [Required] public string Room { get; set; } = string.Empty;
        public int Capacity { get; set; } = 20;
    }

    public class ClassUpdateDto
    {
        public string ClassName { get; set; } = string.Empty;
        public int TeacherId { get; set; }
        public string ScheduleDay { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class AssignStudentDto
    {
        [Required] public int ClassId { get; set; }
        [Required] public int StudentId { get; set; }
    }
}
