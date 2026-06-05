namespace SmartEduWebAPI.Models
{
    public class AbsenceRequest
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int ClassId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public Student? Student { get; set; }
        public Class? Class { get; set; }
    }
}
