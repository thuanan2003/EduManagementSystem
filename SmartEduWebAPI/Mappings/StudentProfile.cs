using AutoMapper;
using SmartEduWebAPI.DTOs.Student;
using SmartEduWebAPI.Models;

namespace SmartEduWebAPI.Mappings
{
    public class StudentProfile : Profile
    {
        public StudentProfile()
        {
            CreateMap<Student, StudentDto>()
                .ForMember(d => d.WalletBalance, o => o.MapFrom(s => s.Wallet != null ? s.Wallet.Balance : (decimal?)null))
                .ForMember(d => d.RemainingSessions, o => o.MapFrom(s => s.Wallet != null ? s.Wallet.RemainingSessions : (int?)null));

            CreateMap<StudentCreateDto, Student>()
                .ForMember(d => d.AvatarUrl, o => o.MapFrom(s => s.AvatarUrl ?? string.Empty));
            CreateMap<StudentUpdateDto, Student>()
                .ForAllMembers(o => o.Condition((src, dest, val) => val != null && !string.IsNullOrEmpty(val.ToString())));
        }
    }
}
