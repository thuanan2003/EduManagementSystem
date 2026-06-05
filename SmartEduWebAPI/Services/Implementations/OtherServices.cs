using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SmartEduWebAPI.DTOs.Teacher;
using SmartEduWebAPI.DTOs.Course;
using SmartEduWebAPI.DTOs.Class;
using SmartEduWebAPI.DTOs.Attendance;
using SmartEduWebAPI.DTOs.Wallet;
using SmartEduWebAPI.DTOs.Dashboard;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Repositories.Interfaces;
using SmartEduWebAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Data;

namespace SmartEduWebAPI.Services.Implementations
{
    public class TeacherService : ITeacherService
    {
        private readonly ITeacherRepository _repo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public TeacherService(ITeacherRepository repo, UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _repo = repo;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TeacherDto>> GetAllAsync()
            => _mapper.Map<IEnumerable<TeacherDto>>(await _repo.GetAllAsync());

        public async Task<TeacherDto?> GetByIdAsync(int id)
        {
            var t = await _repo.GetWithClassesAsync(id);
            return t == null ? null : _mapper.Map<TeacherDto>(t);
        }

        public async Task<TeacherDto?> GetByUserIdAsync(string userId)
        {
            var t = await _repo.GetByUserIdAsync(userId);
            return t == null ? null : _mapper.Map<TeacherDto>(t);
        }

        public async Task<TeacherDto> CreateAsync(TeacherCreateDto dto)
        {
            var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, EmailConfirmed = true, FullName = dto.FullName, AvatarUrl = dto.AvatarUrl ?? string.Empty };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded) throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            await _userManager.AddToRoleAsync(user, SystemRoles.Teacher);

            var count = await _repo.CountAsync();
            var teacher = _mapper.Map<Teacher>(dto);
            teacher.TeacherCode = $"T-{(count + 1):D3}";
            teacher.UserId = user.Id;

            await _repo.AddAsync(teacher);
            await _repo.SaveChangesAsync();
            return _mapper.Map<TeacherDto>(teacher);
        }

        public async Task<TeacherDto?> UpdateAsync(int id, TeacherUpdateDto dto)
        {
            var teacher = await _repo.GetByIdAsync(id);
            if (teacher == null) return null;
            _mapper.Map(dto, teacher);
            _repo.Update(teacher);
            await _repo.SaveChangesAsync();

            // Synchronize with ApplicationUser
            var user = await _userManager.FindByIdAsync(teacher.UserId);
            if (user != null)
            {
                user.FullName = teacher.FullName;
                if (!string.IsNullOrEmpty(teacher.AvatarUrl))
                {
                    user.AvatarUrl = teacher.AvatarUrl;
                }
                await _userManager.UpdateAsync(user);
            }

            return _mapper.Map<TeacherDto>(teacher);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var teacher = await _repo.GetByIdAsync(id);
            if (teacher == null) return false;
            var user = await _userManager.FindByIdAsync(teacher.UserId);
            if (user != null) await _userManager.DeleteAsync(user);
            _repo.Remove(teacher);
            await _repo.SaveChangesAsync();
            return true;
        }
    }

    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _repo;
        private readonly IMapper _mapper;

        public CourseService(ICourseRepository repo, IMapper mapper) { _repo = repo; _mapper = mapper; }

        public async Task<IEnumerable<CourseDto>> GetAllAsync()
            => _mapper.Map<IEnumerable<CourseDto>>(await _repo.GetAllAsync());

        public async Task<CourseDto?> GetByIdAsync(int id)
        {
            var c = await _repo.GetByIdAsync(id);
            return c == null ? null : _mapper.Map<CourseDto>(c);
        }

        public async Task<CourseDto> CreateAsync(CourseCreateDto dto)
        {
            var count = await _repo.CountAsync();
            var course = _mapper.Map<Course>(dto);
            course.CourseCode = $"CRS-{(count + 1):D3}";
            await _repo.AddAsync(course);
            await _repo.SaveChangesAsync();
            return _mapper.Map<CourseDto>(course);
        }

        public async Task<CourseDto?> UpdateAsync(int id, CourseUpdateDto dto)
        {
            var course = await _repo.GetByIdAsync(id);
            if (course == null) return null;
            _mapper.Map(dto, course);
            _repo.Update(course);
            await _repo.SaveChangesAsync();
            return _mapper.Map<CourseDto>(course);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var course = await _repo.GetByIdAsync(id);
            if (course == null) return false;
            _repo.Remove(course);
            await _repo.SaveChangesAsync();
            return true;
        }
    }

    public class ClassService : IClassService
    {
        private readonly IClassRepository _repo;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ClassService(IClassRepository repo, ApplicationDbContext context, IMapper mapper)
        {
            _repo = repo;
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ClassDto>> GetAllAsync()
        {
            var classes = await _context.Classes
                .Include(c => c.Course).Include(c => c.Teacher).Include(c => c.StudentClasses)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ClassDto>>(classes);
        }

        public async Task<ClassDto?> GetByIdAsync(int id)
        {
            var c = await _repo.GetWithDetailsAsync(id);
            return c == null ? null : _mapper.Map<ClassDto>(c);
        }

        public async Task<IEnumerable<ClassDto>> GetByTeacherAsync(int teacherId)
            => _mapper.Map<IEnumerable<ClassDto>>(await _repo.GetByTeacherAsync(teacherId));

        public async Task<IEnumerable<ClassDto>> GetByStudentAsync(int studentId)
            => _mapper.Map<IEnumerable<ClassDto>>(await _repo.GetByStudentAsync(studentId));

        public async Task<ClassDto> CreateAsync(ClassCreateDto dto)
        {
            var count = await _repo.CountAsync();
            var cls = _mapper.Map<Class>(dto);
            cls.ClassCode = $"CLS-{(count + 1):D3}";
            await _repo.AddAsync(cls);
            await _repo.SaveChangesAsync();
            return _mapper.Map<ClassDto>(cls);
        }

        public async Task<ClassDto?> UpdateAsync(int id, ClassUpdateDto dto)
        {
            var cls = await _repo.GetByIdAsync(id);
            if (cls == null) return null;
            if (!string.IsNullOrEmpty(dto.ClassName)) cls.ClassName = dto.ClassName;
            if (dto.TeacherId > 0) cls.TeacherId = dto.TeacherId;
            if (!string.IsNullOrEmpty(dto.ScheduleDay)) cls.ScheduleDay = dto.ScheduleDay;
            if (!string.IsNullOrEmpty(dto.StartTime)) cls.StartTime = TimeOnly.Parse(dto.StartTime);
            if (!string.IsNullOrEmpty(dto.EndTime)) cls.EndTime = TimeOnly.Parse(dto.EndTime);
            if (!string.IsNullOrEmpty(dto.Room)) cls.Room = dto.Room;
            if (dto.Capacity > 0) cls.Capacity = dto.Capacity;
            if (!string.IsNullOrEmpty(dto.Status)) cls.Status = dto.Status;
            _repo.Update(cls);
            await _repo.SaveChangesAsync();
            return _mapper.Map<ClassDto>(cls);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cls = await _repo.GetByIdAsync(id);
            if (cls == null) return false;
            _repo.Remove(cls);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignStudentAsync(AssignStudentDto dto)
        {
            var existing = await _context.StudentClasses
                .FirstOrDefaultAsync(sc => sc.StudentId == dto.StudentId && sc.ClassId == dto.ClassId);
            if (existing != null) return false;

            var cls = await _context.Classes.Include(c => c.Course).FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            _context.StudentClasses.Add(new StudentClass
            {
                StudentId = dto.StudentId,
                ClassId = dto.ClassId,
                RemainingSessions = cls?.Course?.TotalSessions ?? 0
            });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveStudentAsync(int classId, int studentId)
        {
            var sc = await _context.StudentClasses
                .FirstOrDefaultAsync(x => x.ClassId == classId && x.StudentId == studentId);
            if (sc == null) return false;
            _context.StudentClasses.Remove(sc);
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _repo;
        private readonly IWalletRepository _walletRepo;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public AttendanceService(IAttendanceRepository repo, IWalletRepository walletRepo,
            ApplicationDbContext context, IMapper mapper)
        {
            _repo = repo;
            _walletRepo = walletRepo;
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AttendanceDto>> GetByStudentAsync(int studentId)
            => _mapper.Map<IEnumerable<AttendanceDto>>(await _repo.GetByStudentAsync(studentId));

        public async Task<IEnumerable<AttendanceDto>> GetByClassAndDateAsync(int classId, DateTime date)
            => _mapper.Map<IEnumerable<AttendanceDto>>(await _repo.GetByClassAsync(classId, date));

        public async Task<AttendanceDto> MarkAttendanceAsync(MarkAttendanceDto dto)
        {
            var record = await _repo.GetExistingAsync(dto.StudentId, dto.ClassId, dto.AttendanceDate);
            bool isNew = record == null;

            if (isNew)
            {
                record = new AttendanceRecord
                {
                    StudentId = dto.StudentId,
                    ClassId = dto.ClassId,
                    AttendanceDate = dto.AttendanceDate,
                    Status = dto.Status,
                    Note = dto.Note
                };
            }
            else
            {
                record.Status = dto.Status;
                record.Note = dto.Note;
            }

            var cls = await _context.Classes.Include(c => c.Course).FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            var wallet = await _walletRepo.GetByStudentIdAsync(dto.StudentId);

            if (wallet == null && cls?.Course != null)
            {
                wallet = new Wallet
                {
                    StudentId = dto.StudentId,
                    Balance = 0m,
                    RemainingSessions = 0
                };
                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            if (cls?.Course != null && wallet != null)
            {
                var price = cls.Course.PricePerSession;
                bool needsDeduction = dto.Status == "Present" || dto.Status == "Unexcused" || dto.Status == "UnexcusedAbsence" || dto.Status == "Late";

                if (needsDeduction && !record.IsDeducted)
                {
                    wallet.Balance -= price;
                    wallet.RemainingSessions = Math.Max(0, wallet.RemainingSessions - 1);
                    _context.WalletTransactions.Add(new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = -price,
                        Type = "Deduction",
                        Description = $"Deduction for class '{cls.ClassName}' on {record.AttendanceDate:yyyy-MM-dd} (Status: {record.Status})",
                        TransactionDate = DateTime.UtcNow
                    });
                    record.IsDeducted = true;
                    record.DeductedAt = DateTime.UtcNow;
                }
                else if (!needsDeduction && record.IsDeducted)
                {
                    wallet.Balance += price;
                    wallet.RemainingSessions += 1;
                    _context.WalletTransactions.Add(new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = price,
                        Type = "Refund",
                        Description = $"Refund (Excused Absence) for class '{cls.ClassName}' on {record.AttendanceDate:yyyy-MM-dd}",
                        TransactionDate = DateTime.UtcNow
                    });
                    record.IsDeducted = false;
                    record.DeductedAt = null;
                }
            }

            if (isNew)
            {
                await _repo.AddAsync(record);
            }
            else
            {
                _repo.Update(record);
            }

            await _repo.SaveChangesAsync();
            return _mapper.Map<AttendanceDto>(record);
        }

        public async Task MarkBulkAttendanceAsync(BulkAttendanceDto dto)
        {
            foreach (var item in dto.Students)
            {
                await MarkAttendanceAsync(new MarkAttendanceDto
                {
                    StudentId = item.StudentId,
                    ClassId = dto.ClassId,
                    AttendanceDate = dto.Date,
                    Status = item.Status,
                    Note = string.Empty
                });
            }
        }
    }

    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _repo;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public WalletService(IWalletRepository repo, ApplicationDbContext context, IMapper mapper)
        {
            _repo = repo;
            _context = context;
            _mapper = mapper;
        }

        public async Task<WalletDto?> GetByStudentIdAsync(int studentId)
        {
            var wallet = await _repo.GetWithTransactionsAsync(studentId);
            return wallet == null ? null : _mapper.Map<WalletDto>(wallet);
        }

        public async Task<WalletDto> DepositAsync(DepositDto dto)
        {
            var wallet = await _repo.GetByStudentIdAsync(dto.StudentId)
                ?? throw new InvalidOperationException("Wallet not found");

            wallet.Balance += dto.Amount;
            wallet.RemainingSessions += dto.Sessions;
            _context.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = dto.Amount,
                Type = "Deposit",
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return _mapper.Map<WalletDto>(await _repo.GetWithTransactionsAsync(dto.StudentId));
        }

        public async Task<WalletDto> RefundAsync(RefundDto dto)
        {
            var wallet = await _repo.GetByStudentIdAsync(dto.StudentId)
                ?? throw new InvalidOperationException("Wallet not found");

            wallet.Balance -= dto.Amount;
            wallet.RemainingSessions -= dto.Sessions;
            _context.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = dto.Amount,
                Type = "Refund",
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return _mapper.Map<WalletDto>(await _repo.GetWithTransactionsAsync(dto.StudentId));
        }

        public async Task<bool> DeductAsync(int studentId, decimal amount, string description)
        {
            var wallet = await _repo.GetByStudentIdAsync(studentId);
            if (wallet == null || wallet.Balance < amount) return false;

            wallet.Balance -= amount;
            _context.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = -amount,
                Type = "Deduction",
                Description = description,
                TransactionDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }
    }

    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context) { _context = context; }

        public async Task<DashboardStatsDto> GetStatsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var monthlyRevenue = await _context.WalletTransactions
                .Where(t => t.Type == "Deposit" && t.TransactionDate >= startOfMonth)
                .SumAsync(t => t.Amount);

            var revenueChart = new List<MonthlyRevenueDto>();
            for (int i = 5; i >= 0; i--)
            {
                var month = DateTime.UtcNow.AddMonths(-i);
                var start = new DateTime(month.Year, month.Month, 1);
                var end = start.AddMonths(1);
                var rev = await _context.WalletTransactions
                    .Where(t => t.Type == "Deposit" && t.TransactionDate >= start && t.TransactionDate < end)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;
                revenueChart.Add(new MonthlyRevenueDto { Month = month.ToString("MMM yyyy"), Revenue = rev });
            }

            var attendanceChart = new List<AttendanceRateDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var records = await _context.AttendanceRecords.Where(a => a.AttendanceDate.Date == date).ToListAsync();
                attendanceChart.Add(new AttendanceRateDto
                {
                    Date = date.ToString("dd/MM"),
                    Present = records.Count(r => r.Status == "Present"),
                    Absent = records.Count(r => r.Status is "ExcusedAbsence" or "UnexcusedAbsence"),
                    Late = records.Count(r => r.Status == "Late")
                });
            }

            return new DashboardStatsDto
            {
                TotalStudents = await _context.Students.CountAsync(),
                TotalTeachers = await _context.Teachers.CountAsync(),
                TotalClasses = await _context.Classes.CountAsync(),
                TotalCourses = await _context.Courses.CountAsync(),
                MonthlyRevenue = monthlyRevenue,
                TodayAttendance = await _context.AttendanceRecords.CountAsync(a => a.AttendanceDate.Date == today && a.Status == "Present"),
                ActiveStudents = await _context.Students.CountAsync(s => s.StudentStatus == "Active"),
                PendingAbsenceRequests = await _context.AbsenceRequests.CountAsync(a => a.Status == "Pending"),
                RevenueChart = revenueChart,
                AttendanceChart = attendanceChart
            };
        }
    }
}
