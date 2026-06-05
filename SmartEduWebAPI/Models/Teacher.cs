namespace SmartEduWebAPI.Models
{
    public class Teacher
    {
        public int Id { get; set; }
        public string TeacherCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public decimal MonthlySalary { get; set; }
        public decimal Bonus { get; set; }
        public string UserId { get; set; } = string.Empty;

        public ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}
