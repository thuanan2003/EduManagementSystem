using System.ComponentModel.DataAnnotations;

namespace SmartEduWebAPI.DTOs.Wallet
{
    public class WalletDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public int RemainingSessions { get; set; }
        public List<WalletTransactionDto> Transactions { get; set; } = new();
    }

    public class WalletTransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
    }

    public class DepositDto
    {
        [Required] public int StudentId { get; set; }
        [Required] public decimal Amount { get; set; }
        [Required] public int Sessions { get; set; }
        public string Description { get; set; } = "Manual deposit";
    }

    public class RefundDto
    {
        [Required] public int StudentId { get; set; }
        [Required] public decimal Amount { get; set; }
        [Required] public int Sessions { get; set; }
        public string Description { get; set; } = "Manual refund";
    }
}
