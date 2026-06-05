namespace SmartEduWebAPI.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string StudentCode { get; set; } = string.Empty;
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
        public string HealthNote { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string StudentStatus { get; set; } = "Active"; // Active, Suspended, Reserved, Dropped
        public string UserId { get; set; } = string.Empty;

        public ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public ICollection<TuitionRecord> TuitionRecords { get; set; } = new List<TuitionRecord>();
        public ICollection<AbsenceRequest> AbsenceRequests { get; set; } = new List<AbsenceRequest>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public Wallet? Wallet { get; set; }
    }
}
