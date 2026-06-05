using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;

namespace SmartEduWebAPI.Repositories.Implementations
{
    public class WalletRepository : GenericRepository<Wallet>, IWalletRepository
    {
        public WalletRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Wallet?> GetByStudentIdAsync(int studentId)
            => await _dbSet.FirstOrDefaultAsync(w => w.StudentId == studentId);

        public async Task<Wallet?> GetWithTransactionsAsync(int studentId)
            => await _dbSet
                .Include(w => w.Transactions.OrderByDescending(t => t.TransactionDate))
                .FirstOrDefaultAsync(w => w.StudentId == studentId);
    }
}
