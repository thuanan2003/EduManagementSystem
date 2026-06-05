using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEduWebAPI.DTOs.Common;
using SmartEduWebAPI.DTOs.Student;
using SmartEduWebAPI.Services.Interfaces;

namespace SmartEduWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _service;

        public StudentsController(IStudentService service) => _service = service;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<StudentDto>>>> GetAll(
            [FromQuery] string? search, [FromQuery] string? grade, [FromQuery] string? status)
        {
            var students = await _service.GetAllAsync(search, grade, status);
            return Ok(ApiResponse<IEnumerable<StudentDto>>.Ok(students));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<StudentDto>>> GetById(int id)
        {
            var student = await _service.GetByIdAsync(id);
            if (student == null) return NotFound(ApiResponse<StudentDto>.Fail("Student not found"));
            return Ok(ApiResponse<StudentDto>.Ok(student));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<StudentDto>>> Create([FromBody] StudentCreateDto dto)
        {
            try
            {
                var student = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = student.Id }, ApiResponse<StudentDto>.Ok(student, "Student created"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentDto>.Fail(ex.Message));
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<StudentDto>>> Update(int id, [FromBody] StudentUpdateDto dto)
        {
            var student = await _service.UpdateAsync(id, dto);
            if (student == null) return NotFound(ApiResponse<StudentDto>.Fail("Student not found"));
            return Ok(ApiResponse<StudentDto>.Ok(student, "Student updated"));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(ApiResponse<bool>.Fail("Student not found"));
            return Ok(ApiResponse<bool>.Ok(true, "Student deleted"));
        }
    }
}
