using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Repositories.Interfaces
{
    public interface IWalletRepository : IGenericRepository<Wallet>
    {
        Task<Wallet?> GetByStudentIdAsync(int studentId);
        Task<Wallet?> GetWithTransactionsAsync(int studentId);
    }
}
