using SmartEduWebAPI.DTOs.Auth;

namespace SmartEduWebAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(string userId);
        Task<UserInfo?> GetUserInfoAsync(string userId);
        Task<UserInfo?> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    }
}
