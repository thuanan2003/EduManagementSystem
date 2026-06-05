using AutoMapper;
using SmartEduWebAPI.DTOs.Teacher;
using SmartEduWebAPI.DTOs.Course;
using SmartEduWebAPI.DTOs.Class;
using SmartEduWebAPI.DTOs.Attendance;
using SmartEduWebAPI.DTOs.Wallet;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Mappings
{
    public class TeacherProfile : Profile
    {
        public TeacherProfile()
        {
            CreateMap<Teacher, TeacherDto>()
                .ForMember(d => d.ClassCount, o => o.MapFrom(s => s.Classes != null ? s.Classes.Count : 0));
            CreateMap<TeacherCreateDto, Teacher>();
            CreateMap<TeacherUpdateDto, Teacher>();
        }
    }

    public class CourseProfile : Profile
    {
        public CourseProfile()
        {
            CreateMap<Course, CourseDto>()
                .ForMember(d => d.ClassCount, o => o.MapFrom(s => s.Classes != null ? s.Classes.Count : 0));
            CreateMap<CourseCreateDto, Course>();
            CreateMap<CourseUpdateDto, Course>();
        }
    }

    public class ClassProfile : Profile
    {
        public ClassProfile()
        {
            CreateMap<Class, ClassDto>()
                .ForMember(d => d.CourseName, o => o.MapFrom(s => s.Course != null ? s.Course.Name : string.Empty))
                .ForMember(d => d.TeacherName, o => o.MapFrom(s => s.Teacher != null ? s.Teacher.FullName : string.Empty))
                .ForMember(d => d.StudentCount, o => o.MapFrom(s => s.StudentClasses != null ? s.StudentClasses.Count : 0))
                .ForMember(d => d.StartTime, o => o.MapFrom(s => s.StartTime.ToString("HH:mm")))
                .ForMember(d => d.EndTime, o => o.MapFrom(s => s.EndTime.ToString("HH:mm")));
            CreateMap<ClassCreateDto, Class>()
                .ForMember(d => d.StartTime, o => o.MapFrom(s => TimeOnly.Parse(s.StartTime)))
                .ForMember(d => d.EndTime, o => o.MapFrom(s => TimeOnly.Parse(s.EndTime)));
            CreateMap<StudentClass, StudentClassDto>();
        }
    }

    public class AttendanceProfile : Profile
    {
        public AttendanceProfile()
        {
            CreateMap<AttendanceRecord, AttendanceDto>()
                .ForMember(d => d.StudentName, o => o.MapFrom(s => s.Student != null ? s.Student.FullName : string.Empty))
                .ForMember(d => d.ClassName, o => o.MapFrom(s => s.Class != null ? s.Class.ClassName : string.Empty));
        }
    }

    public class WalletProfile : Profile
    {
        public WalletProfile()
        {
            CreateMap<Wallet, WalletDto>()
                .ForMember(d => d.StudentName, o => o.MapFrom(s => s.Student != null ? s.Student.FullName : string.Empty));
            CreateMap<WalletTransaction, WalletTransactionDto>();
        }
    }
}
