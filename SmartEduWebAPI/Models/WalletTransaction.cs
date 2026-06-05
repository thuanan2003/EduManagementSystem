namespace SmartEduWebAPI.Models
{
    public class WalletTransaction
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // Deposit, Deduction, Refund
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public Wallet Wallet { get; set; } = null!;
    }
}
