namespace SmartEduWebAPI.Models
{
    public class Course
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
        public int MaxStudents { get; set; } = 20;
        public string Status { get; set; } = "Active"; // Upcoming, Active, Completed, Suspended
        public string Description { get; set; } = string.Empty;

        public ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}
