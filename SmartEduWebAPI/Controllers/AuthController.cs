using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEduWebAPI.DTOs.Auth;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.Services.Interfaces;
using System.Security.Claims;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService) => _authService = authService;

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
                return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password"));

            return Ok(ApiResponse<LoginResponse>.Ok(result, "Login successful"));
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Refresh([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            if (result == null)
                return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid or expired refresh token"));

            return Ok(ApiResponse<LoginResponse>.Ok(result, "Token refreshed"));
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            await _authService.LogoutAsync(userId);
            return Ok(ApiResponse<bool>.Ok(true, "Logged out successfully"));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserInfo>>> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var user = await _authService.GetUserInfoAsync(userId);
            if (user == null)
                return NotFound(ApiResponse<UserInfo>.Fail("User not found"));
            return Ok(ApiResponse<UserInfo>.Ok(user));
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserInfo>>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            try
            {
                var result = await _authService.UpdateProfileAsync(userId, request);
                if (result == null)
                    return NotFound(ApiResponse<UserInfo>.Fail("User not found"));
                return Ok(ApiResponse<UserInfo>.Ok(result, "Profile updated successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<UserInfo>.Fail(ex.Message));
            }
        }
    }
}
