using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Attendance
{
    public class AttendanceDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public bool IsDeducted { get; set; }
    }

    public class MarkAttendanceDto
    {
        [Required] public int StudentId { get; set; }
        [Required] public int ClassId { get; set; }
        [Required] public DateTime AttendanceDate { get; set; }
        [Required] public string Status { get; set; } = string.Empty; // Present, ExcusedAbsence, UnexcusedAbsence, Late
        public string Note { get; set; } = string.Empty;
    }

    public class BulkAttendanceDto
    {
        [Required] public int ClassId { get; set; }
        [Required] public DateTime Date { get; set; }
        public List<StudentAttendanceItemDto> Students { get; set; } = new();
    }

    public class StudentAttendanceItemDto
    {
        [Required] public int StudentId { get; set; }
        [Required] public string Status { get; set; } = "Present";
    }
}
