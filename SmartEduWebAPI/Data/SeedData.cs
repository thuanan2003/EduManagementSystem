using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Ensure DB is created
            await dbContext.Database.MigrateAsync();

            // Seed roles
            await EnsureRoleAsync(roleManager, SystemRoles.Admin);
            await EnsureRoleAsync(roleManager, SystemRoles.Student);
            await EnsureRoleAsync(roleManager, SystemRoles.Teacher);

            // Seed users
            var adminUser = await EnsureUserAsync(userManager, "admin@smartedu.local", "Admin@123", SystemRoles.Admin, "Admin SmartEdu");
            var studentUser = await EnsureUserAsync(userManager, "student@smartedu.local", "Student@123", SystemRoles.Student, "Tran Van Student");
            var teacherUser = await EnsureUserAsync(userManager, "teacher@smartedu.local", "Teacher@123", SystemRoles.Teacher, "Nguyen Van Teacher");

            // Seed domain data
            await SeedDomainDataAsync(dbContext, studentUser.Id, teacherUser.Id);
        }

        private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string role)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        private static async Task<ApplicationUser> EnsureUserAsync(
            UserManager<ApplicationUser> userManager,
            string email, string password, string role, string fullName)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = fullName
                };
                var result = await userManager.CreateAsync(user, password);
                if (!result.Succeeded) throw new Exception($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            if (!await userManager.IsInRoleAsync(user, role))
                await userManager.AddToRoleAsync(user, role);

            return user;
        }

        private static async Task SeedDomainDataAsync(ApplicationDbContext db, string studentUserId, string teacherUserId)
        {
            if (await db.Courses.AnyAsync()) return;

            var course = new Course
            {
                CourseCode = "CRS-001",
                Name = "Math Foundation",
                Subject = "Math",
                Grade = "6",
                TuitionFee = 1500000m,
                DurationWeeks = 8,
                PricePerSession = 150000m,
                TotalSessions = 10,
                MaxStudents = 20,
                Status = "Active",
                Description = "Foundation mathematics for grade 6 students"
            };

            var teacher = new Teacher
            {
                TeacherCode = "T-001",
                FullName = "Nguyen Van Teacher",
                Specialization = "Math",
                Phone = "0900000001",
                Email = "teacher@smartedu.local",
                Status = "Active",
                MonthlySalary = 10000000m,
                Bonus = 0m,
                UserId = teacherUserId
            };

            var student = new Student
            {
                StudentCode = "S-001",
                FullName = "Tran Van Student",
                DateOfBirth = new DateTime(2010, 5, 1),
                Gender = "Male",
                Phone = "0900000002",
                Address = "HCM City",
                Email = "student@smartedu.local",
                ParentName = "Tran Van Parent",
                ParentPhone = "0900000003",
                ParentEmail = "parent@smartedu.local",
                SchoolName = "Sample School",
                GradeLevel = "6",
                StudentStatus = "Active",
                UserId = studentUserId,
                Wallet = new Wallet
                {
                    Balance = 2000000m,
                    RemainingSessions = 10,
                    Transactions = new List<WalletTransaction>
                    {
                        new WalletTransaction
                        {
                            Amount = 2000000m,
                            Type = "Deposit",
                            Description = "Initial deposit",
                            TransactionDate = DateTime.UtcNow.AddDays(-10)
                        }
                    }
                }
            };

            db.Courses.Add(course);
            db.Teachers.Add(teacher);
            db.Students.Add(student);
            await db.SaveChangesAsync();

            var classItem = new Class
            {
                ClassCode = "CLS-001",
                ClassName = "Math 6A",
                CourseId = course.Id,
                TeacherId = teacher.Id,
                Grade = "6",
                ScheduleDay = "Monday",
                StartTime = new TimeOnly(18, 0),
                EndTime = new TimeOnly(19, 30),
                Room = "Room 101",
                Capacity = 20,
                Status = "Active"
            };

            db.Classes.Add(classItem);
            await db.SaveChangesAsync();

            db.StudentClasses.Add(new StudentClass
            {
                StudentId = student.Id,
                ClassId = classItem.Id,
                RemainingSessions = 10
            });
            db.TuitionRecords.Add(new TuitionRecord
            {
                StudentId = student.Id,
                Amount = 1500000m,
                Status = "Paid",
                DueDate = DateTime.UtcNow.AddDays(-3),
                PaidAt = DateTime.UtcNow.AddDays(-2),
                PaymentMethod = "Cash"
            });
            db.AttendanceRecords.Add(new AttendanceRecord
            {
                StudentId = student.Id,
                ClassId = classItem.Id,
                AttendanceDate = DateTime.UtcNow.Date.AddDays(-1),
                Status = "Present",
                IsDeducted = true,
                DeductedAt = DateTime.UtcNow.AddDays(-1)
            });

            await db.SaveChangesAsync();
        }
    }
}
