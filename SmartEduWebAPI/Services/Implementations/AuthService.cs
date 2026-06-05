using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartEduWebAPI.Data;
using SmartEduWebAPI.DTOs.Auth;
using SmartEduWebAPI.Models;
using SmartEduWebAPI.Services.Interfaces;

namespace SmartEduWebAPI.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(UserManager<ApplicationUser> userManager, ApplicationDbContext context, IConfiguration config)
        {
            _userManager = userManager;
            _context = context;
            _config = config;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
                return null;

            return await GenerateTokensAsync(user);
        }

        public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
        {
            var token = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);

            if (token == null) return null;

            token.IsRevoked = true;
            await _context.SaveChangesAsync();

            return await GenerateTokensAsync(token.User);
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var t in tokens) t.IsRevoked = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<LoginResponse> GenerateTokensAsync(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var expiryMinutes = int.Parse(_config["Jwt:AccessTokenExpiryMinutes"] ?? "60");
            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new("fullName", user.FullName)
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var jwtToken = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

            // Refresh token
            var refreshTokenValue = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshExpiryDays = int.Parse(_config["Jwt:RefreshTokenExpiryDays"] ?? "7");

            _context.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshTokenValue,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays),
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            int? studentId = null;
            int? teacherId = null;
            string phone = string.Empty;

            if (roles.Contains(SystemRoles.Student))
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
                studentId = student?.Id;
                if (student != null) phone = student.Phone;
            }
            if (roles.Contains(SystemRoles.Teacher))
            {
                var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);
                teacherId = teacher?.Id;
                if (teacher != null) phone = teacher.Phone;
            }

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenValue,
                ExpiresAt = expiresAt,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    Phone = phone,
                    Roles = roles.ToList(),
                    StudentId = studentId,
                    TeacherId = teacherId
                }
            };
        }

        public async Task<UserInfo?> GetUserInfoAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            int? studentId = null;
            int? teacherId = null;
            string phone = string.Empty;

            if (roles.Contains(SystemRoles.Student))
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
                studentId = student?.Id;
                if (student != null) phone = student.Phone;
            }
            if (roles.Contains(SystemRoles.Teacher))
            {
                var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);
                teacherId = teacher?.Id;
                if (teacher != null) phone = teacher.Phone;
            }

            return new UserInfo
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Phone = phone,
                Roles = roles.ToList(),
                StudentId = studentId,
                TeacherId = teacherId
            };
        }

        public async Task<UserInfo?> UpdateProfileAsync(string userId, UpdateProfileRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            user.FullName = request.FullName;
            if (!string.IsNullOrEmpty(request.AvatarUrl))
            {
                user.AvatarUrl = request.AvatarUrl;
            }

            if (!string.IsNullOrEmpty(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, request.Password);
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }

            var identityResult = await _userManager.UpdateAsync(user);
            if (!identityResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join(", ", identityResult.Errors.Select(e => e.Description)));
            }

            var roles = await _userManager.GetRolesAsync(user);
            int? studentId = null;
            int? teacherId = null;
            string phone = request.Phone;

            if (roles.Contains(SystemRoles.Student))
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
                if (student != null)
                {
                    student.FullName = request.FullName;
                    student.Phone = request.Phone;
                    if (!string.IsNullOrEmpty(request.AvatarUrl)) student.AvatarUrl = request.AvatarUrl;
                    _context.Students.Update(student);
                    await _context.SaveChangesAsync();
                    studentId = student.Id;
                }
            }
            else if (roles.Contains(SystemRoles.Teacher))
            {
                var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);
                if (teacher != null)
                {
                    teacher.FullName = request.FullName;
                    teacher.Phone = request.Phone;
                    if (!string.IsNullOrEmpty(request.AvatarUrl)) teacher.AvatarUrl = request.AvatarUrl;
                    _context.Teachers.Update(teacher);
                    await _context.SaveChangesAsync();
                    teacherId = teacher.Id;
                }
            }

            return new UserInfo
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Phone = phone,
                Roles = roles.ToList(),
                StudentId = studentId,
                TeacherId = teacherId
            };
        }
    }
}
