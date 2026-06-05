namespace SmartEduWebAPI.Models
{
    public class Class
    {
        public int Id { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public int TeacherId { get; set; }
        public string Grade { get; set; } = string.Empty;
        public string ScheduleDay { get; set; } = string.Empty; // Monday, Tuesday...
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Room { get; set; } = string.Empty;
        public int Capacity { get; set; } = 20;
        public string Status { get; set; } = "Active";

        public Course Course { get; set; } = null!;
        public Teacher Teacher { get; set; } = null!;
        public ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    }
}
