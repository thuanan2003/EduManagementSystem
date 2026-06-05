using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Student> Students { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<StudentClass> StudentClasses { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
        public DbSet<TuitionRecord> TuitionRecords { get; set; }
        public DbSet<AbsenceRequest> AbsenceRequests { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Unique indexes
            builder.Entity<Student>().HasIndex(s => s.StudentCode).IsUnique();
            builder.Entity<Teacher>().HasIndex(t => t.TeacherCode).IsUnique();
            builder.Entity<Course>().HasIndex(c => c.CourseCode).IsUnique();
            builder.Entity<Class>().HasIndex(c => c.ClassCode).IsUnique();
            builder.Entity<StudentClass>()
                .HasIndex(sc => new { sc.StudentId, sc.ClassId })
                .IsUnique();

            // Decimal precision
            builder.Entity<Course>().Property(x => x.TuitionFee).HasPrecision(18, 2);
            builder.Entity<Course>().Property(x => x.PricePerSession).HasPrecision(18, 2);
            builder.Entity<Teacher>().Property(x => x.MonthlySalary).HasPrecision(18, 2);
            builder.Entity<Teacher>().Property(x => x.Bonus).HasPrecision(18, 2);
            builder.Entity<TuitionRecord>().Property(x => x.Amount).HasPrecision(18, 2);
            builder.Entity<Wallet>().Property(x => x.Balance).HasPrecision(18, 2);
            builder.Entity<WalletTransaction>().Property(x => x.Amount).HasPrecision(18, 2);

            // Relationships
            builder.Entity<StudentClass>()
                .HasOne(sc => sc.Student).WithMany(s => s.StudentClasses)
                .HasForeignKey(sc => sc.StudentId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<StudentClass>()
                .HasOne(sc => sc.Class).WithMany(c => c.StudentClasses)
                .HasForeignKey(sc => sc.ClassId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Wallet>()
                .HasOne(w => w.Student).WithOne(s => s.Wallet)
                .HasForeignKey<Wallet>(w => w.StudentId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<WalletTransaction>()
                .HasOne(wt => wt.Wallet).WithMany(w => w.Transactions)
                .HasForeignKey(wt => wt.WalletId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notification>()
                .HasOne(n => n.Student).WithMany(s => s.Notifications)
                .HasForeignKey(n => n.StudentId).OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            builder.Entity<Notification>()
                .HasOne(n => n.Teacher).WithMany()
                .HasForeignKey(n => n.TeacherId).OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            builder.Entity<AttendanceRecord>()
                .HasOne(a => a.Student).WithMany(s => s.AttendanceRecords)
                .HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AttendanceRecord>()
                .HasOne(a => a.Class).WithMany(c => c.AttendanceRecords)
                .HasForeignKey(a => a.ClassId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AbsenceRequest>()
                .HasOne(a => a.Student).WithMany(s => s.AbsenceRequests)
                .HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TuitionRecord>()
                .HasOne(t => t.Student).WithMany(s => s.TuitionRecords)
                .HasForeignKey(t => t.StudentId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User).WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
