using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.DTOs.Teacher;
using SmartEduWebAPI.DTOs.Course;
using SmartEduWebAPI.DTOs.Class;
using SmartEduWebAPI.DTOs.Attendance;
using SmartEduWebAPI.DTOs.Wallet;
using SmartEduWebAPI.DTOs.Dashboard;
using SmartEduWebAPI.Services.Interfaces;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService _service;
        public TeachersController(ITeacherService service) => _service = service;

        [HttpGet] public async Task<ActionResult<ApiResponse<IEnumerable<TeacherDto>>>> GetAll()
            => Ok(ApiResponse<IEnumerable<TeacherDto>>.Ok(await _service.GetAllAsync()));

        [HttpGet("{id:int}")] public async Task<ActionResult<ApiResponse<TeacherDto>>> GetById(int id)
        {
            var t = await _service.GetByIdAsync(id);
            return t == null ? NotFound(ApiResponse<TeacherDto>.Fail("Not found")) : Ok(ApiResponse<TeacherDto>.Ok(t));
        }

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<TeacherDto>>> Create([FromBody] TeacherCreateDto dto)
        {
            try { var t = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = t.Id }, ApiResponse<TeacherDto>.Ok(t)); }
            catch (InvalidOperationException ex) { return BadRequest(ApiResponse<TeacherDto>.Fail(ex.Message)); }
        }

        [HttpPut("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<TeacherDto>>> Update(int id, [FromBody] TeacherUpdateDto dto)
        {
            var t = await _service.UpdateAsync(id, dto);
            return t == null ? NotFound(ApiResponse<TeacherDto>.Fail("Not found")) : Ok(ApiResponse<TeacherDto>.Ok(t));
        }

        [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var r = await _service.DeleteAsync(id);
            return r ? Ok(ApiResponse<bool>.Ok(true, "Deleted")) : NotFound(ApiResponse<bool>.Fail("Not found"));
        }
    }

    [ApiController, Route("api/[controller]"), Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _service;
        public CoursesController(ICourseService service) => _service = service;

        [HttpGet] public async Task<ActionResult<ApiResponse<IEnumerable<CourseDto>>>> GetAll()
            => Ok(ApiResponse<IEnumerable<CourseDto>>.Ok(await _service.GetAllAsync()));

        [HttpGet("{id:int}")] public async Task<ActionResult<ApiResponse<CourseDto>>> GetById(int id)
        {
            var c = await _service.GetByIdAsync(id);
            return c == null ? NotFound(ApiResponse<CourseDto>.Fail("Not found")) : Ok(ApiResponse<CourseDto>.Ok(c));
        }

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<CourseDto>>> Create([FromBody] CourseCreateDto dto)
        { var c = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = c.Id }, ApiResponse<CourseDto>.Ok(c)); }

        [HttpPut("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<CourseDto>>> Update(int id, [FromBody] CourseUpdateDto dto)
        {
            var c = await _service.UpdateAsync(id, dto);
            return c == null ? NotFound(ApiResponse<CourseDto>.Fail("Not found")) : Ok(ApiResponse<CourseDto>.Ok(c));
        }

        [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var r = await _service.DeleteAsync(id);
            return r ? Ok(ApiResponse<bool>.Ok(true)) : NotFound(ApiResponse<bool>.Fail("Not found"));
        }
    }

    [ApiController, Route("api/[controller]"), Authorize]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _service;
        public ClassesController(IClassService service) => _service = service;

        [HttpGet] public async Task<ActionResult<ApiResponse<IEnumerable<ClassDto>>>> GetAll()
            => Ok(ApiResponse<IEnumerable<ClassDto>>.Ok(await _service.GetAllAsync()));

        [HttpGet("{id:int}")] public async Task<ActionResult<ApiResponse<ClassDto>>> GetById(int id)
        {
            var c = await _service.GetByIdAsync(id);
            return c == null ? NotFound(ApiResponse<ClassDto>.Fail("Not found")) : Ok(ApiResponse<ClassDto>.Ok(c));
        }

        [HttpGet("by-teacher/{teacherId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ClassDto>>>> GetByTeacher(int teacherId)
            => Ok(ApiResponse<IEnumerable<ClassDto>>.Ok(await _service.GetByTeacherAsync(teacherId)));

        [HttpGet("by-student/{studentId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ClassDto>>>> GetByStudent(int studentId)
            => Ok(ApiResponse<IEnumerable<ClassDto>>.Ok(await _service.GetByStudentAsync(studentId)));

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ClassDto>>> Create([FromBody] ClassCreateDto dto)
        { var c = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = c.Id }, ApiResponse<ClassDto>.Ok(c)); }

        [HttpPut("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ClassDto>>> Update(int id, [FromBody] ClassUpdateDto dto)
        {
            var c = await _service.UpdateAsync(id, dto);
            return c == null ? NotFound(ApiResponse<ClassDto>.Fail("Not found")) : Ok(ApiResponse<ClassDto>.Ok(c));
        }

        [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var r = await _service.DeleteAsync(id);
            return r ? Ok(ApiResponse<bool>.Ok(true)) : NotFound(ApiResponse<bool>.Fail("Not found"));
        }

        [HttpPost("assign-student"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> AssignStudent([FromBody] AssignStudentDto dto)
        {
            var r = await _service.AssignStudentAsync(dto);
            return r ? Ok(ApiResponse<bool>.Ok(true, "Student assigned")) : BadRequest(ApiResponse<bool>.Fail("Already enrolled"));
        }

        [HttpDelete("{classId:int}/students/{studentId:int}"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveStudent(int classId, int studentId)
        {
            var r = await _service.RemoveStudentAsync(classId, studentId);
            return r ? Ok(ApiResponse<bool>.Ok(true)) : NotFound(ApiResponse<bool>.Fail("Not found"));
        }
    }

    [ApiController, Route("api/[controller]"), Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;
        public AttendanceController(IAttendanceService service) => _service = service;

        [HttpGet("student/{studentId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetByStudent(int studentId)
            => Ok(ApiResponse<IEnumerable<AttendanceDto>>.Ok(await _service.GetByStudentAsync(studentId)));

        [HttpGet("class/{classId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetByClass(int classId, [FromQuery] DateTime? date)
            => Ok(ApiResponse<IEnumerable<AttendanceDto>>.Ok(await _service.GetByClassAndDateAsync(classId, date ?? DateTime.UtcNow.Date)));

        [HttpPost("mark"), Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<ApiResponse<AttendanceDto>>> Mark([FromBody] MarkAttendanceDto dto)
        {
            var result = await _service.MarkAttendanceAsync(dto);
            return Ok(ApiResponse<AttendanceDto>.Ok(result, "Attendance marked"));
        }

        [HttpPost("bulk"), Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<ApiResponse<object>>> BulkAttendance([FromBody] BulkAttendanceDto dto)
        {
            await _service.MarkBulkAttendanceAsync(dto);
            return Ok(ApiResponse<object>.Ok(new { }, "Bulk attendance marked successfully"));
        }

        [HttpGet("me/{studentId:int}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetMyAttendance(int studentId)
            => Ok(ApiResponse<IEnumerable<AttendanceDto>>.Ok(await _service.GetByStudentAsync(studentId)));
    }

    [ApiController, Route("api/[controller]"), Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _service;
        public WalletController(IWalletService service) => _service = service;

        [HttpGet("student/{studentId:int}")]
        public async Task<ActionResult<ApiResponse<WalletDto>>> GetByStudent(int studentId)
        {
            var w = await _service.GetByStudentIdAsync(studentId);
            return w == null ? NotFound(ApiResponse<WalletDto>.Fail("Wallet not found")) : Ok(ApiResponse<WalletDto>.Ok(w));
        }

        [HttpPost("deposit"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<WalletDto>>> Deposit([FromBody] DepositDto dto)
        {
            var w = await _service.DepositAsync(dto);
            return Ok(ApiResponse<WalletDto>.Ok(w, "Deposit successful"));
        }

        [HttpPost("refund"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<WalletDto>>> Refund([FromBody] RefundDto dto)
        {
            var w = await _service.RefundAsync(dto);
            return Ok(ApiResponse<WalletDto>.Ok(w, "Refund processed successfully"));
        }
    }

    [ApiController, Route("api/[controller]"), Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;
        public DashboardController(IDashboardService service) => _service = service;

        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats()
            => Ok(ApiResponse<DashboardStatsDto>.Ok(await _service.GetStatsAsync()));
    }
}
