namespace SmartEduWebAPI.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int? StudentId { get; set; }
        public int? TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // TuitionReminder, ScheduleChange, AbsenceNotice, NewCourse
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public Student? Student { get; set; }
        public Teacher? Teacher { get; set; }
    }
}
