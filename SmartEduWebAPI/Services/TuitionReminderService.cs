using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;

namespace SmartEduWebAPI.Services
{
    public class TuitionReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TuitionReminderService> _logger;

        public TuitionReminderService(IServiceProvider serviceProvider, ILogger<TuitionReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CheckTuitionBalancesAsync();
                // Run daily
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task CheckTuitionBalancesAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Find wallets with less than 3 sessions remaining or balance < 500,000
                var lowBalanceWallets = await db.Wallets
                    .Include(w => w.Student)
                    .Where(w => w.RemainingSessions < 3 || w.Balance < 500000)
                    .ToListAsync();

                foreach (var wallet in lowBalanceWallets)
                {
                    var existing = await db.Notifications
                        .AnyAsync(n => n.StudentId == wallet.StudentId &&
                                       n.Type == "TuitionReminder" &&
                                       n.SentAt >= DateTime.UtcNow.Date);

                    if (!existing)
                    {
                        db.Notifications.Add(new Models.Notification
                        {
                            StudentId = wallet.StudentId,
                            Title = "Low Balance Warning",
                            Message = $"Your wallet balance is {wallet.Balance:N0} VND with {wallet.RemainingSessions} sessions remaining. Please top up soon.",
                            Type = "TuitionReminder",
                            SentAt = DateTime.UtcNow
                        });
                    }
                }

                await db.SaveChangesAsync();
                _logger.LogInformation("[TuitionReminder] Checked {Count} low-balance wallets", lowBalanceWallets.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[TuitionReminder] Error checking tuition balances");
            }
        }
    }
}
