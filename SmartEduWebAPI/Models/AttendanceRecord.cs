namespace SmartEduWebAPI.Models
{
    public class AttendanceRecord
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int ClassId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; } = "Present"; // Present, ExcusedAbsence, UnexcusedAbsence, Late
        public string Note { get; set; } = string.Empty;

        // Business rule: prevent double deduction
        public bool IsDeducted { get; set; } = false;
        public DateTime? DeductedAt { get; set; }

        public Student Student { get; set; } = null!;
        public Class Class { get; set; } = null!;
    }
}
