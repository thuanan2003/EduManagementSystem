namespace SmartEduWebAPI.Models
{
    public class StudentClass
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int ClassId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public int RemainingSessions { get; set; }

        public Student Student { get; set; } = null!;
        public Class Class { get; set; } = null!;
    }
}
