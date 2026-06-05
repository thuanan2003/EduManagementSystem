namespace SmartEduWebAPI.Models
{
    public class TuitionRecord
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Unpaid"; // Paid, Unpaid, Overdue
        public DateTime DueDate { get; set; }
        public DateTime? PaidAt { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;

        public Student Student { get; set; } = null!;
    }
}
