namespace SmartEduWebAPI.Models
{
    public class Wallet
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public decimal Balance { get; set; }
        public int RemainingSessions { get; set; }

        public Student Student { get; set; } = null!;
        public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
    }
}
