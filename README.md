# 🎓 SmartEdu - Student Management & Tuition Wallet System

**SmartEdu** là hệ thống quản trị trung tâm giáo dục và ví học phí tự động (Full-stack Student Management System). Dự án được thiết kế nhằm tối ưu hóa các nghiệp vụ quản lý học viên, lớp học, lịch giảng dạy của giáo viên, điểm danh chuyên cần và tự động khấu trừ học phí qua tài khoản ví điện tử nội bộ.
---

## 📖 Mục lục
1. [Tính năng nổi bật](#-tính-năng-nổi-bật)
2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
4. [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
5. [Tài khoản thử nghiệm](#-tài-khoản-thử-nghiệm)
6. [Quy tắc nghiệp vụ cốt lõi](#-quy-tắc-nghiệp-vụ-cốt-lõi)
7. [Cấu trúc thư mục](#-cấu-tác-thư-mục)

---

## 🌟 Tính năng nổi bật

### Phân hệ Admin (Quản trị viên)
*   **Dashboard trực quan:** Thống kê tổng số học sinh, giáo viên, lớp học, doanh thu tháng và biểu đồ tăng trưởng trực quan (Recharts).
*   **Quản lý dữ liệu:** CRUD Học sinh, Giáo viên, Khóa học, Lớp học và Lịch học.
*   **Xếp lớp & Phân lịch:** Gán học sinh vào lớp học, phân công giáo viên giảng dạy, phòng học và thời gian biểu.
*   **Báo cáo & Xuất file:** Xuất dữ liệu học phí dưới dạng file Excel (ClosedXML) và báo cáo tổng quan hoạt động dưới dạng file PDF (QuestPDF).

### Phân hệ Teacher (Giáo viên)
*   **Lịch giảng dạy:** Xem lịch dạy hàng tuần trực quan.
*   **Điểm danh chuyên cần:** Điểm danh học sinh từng buổi học (Present, Late, Excused/Unexcused Absence).
*   **Quản lý nhận xét:** Ghi chú và nhận xét kết quả học tập của học sinh sau mỗi buổi.

### Phân hệ Student (Học sinh/Phụ huynh)
*   **Thời khóa biểu:** Xem thời khóa biểu cá nhân các lớp học đã đăng ký.
*   **Ví học phí (Wallet):** Theo dõi số dư tài khoản, số buổi học còn lại và lịch sử giao dịch ví.
*   **Xin nghỉ học:** Gửi yêu cầu xin nghỉ học có phép trước khi lớp học bắt đầu.

---

## 📐 Kiến trúc hệ thống

Dự án áp dụng mô hình **Clean Architecture** ở tầng Backend nhằm tách biệt rõ ràng các mối quan tâm (Separation of Concerns):

```mermaid
graph TD
    subgraph Client (Frontend)
        React[React Client] --> Axios[Axios API Client / Interceptors]
    end
    
    subgraph Server (Backend)
        Axios --> Controllers[Presentation Layer: Controllers]
        Controllers --> Services[Application/Business Layer: Services]
        Services --> Repositories[Core/Data Layer: Repositories]
        Repositories --> DbContext[Infrastructure: EF Core DbContext]
    end

    subgraph Database
        DbContext --> SQL[SQL Server]
    end
```

*   **API Layer:** Định nghĩa các RESTful API endpoints, xử lý routing, CORS và JWT validation middleware.
*   **Service Layer:** Chứa toàn bộ logic nghiệp vụ (Business Logic), quản lý giao dịch tài chính ví học phí, tính lương giáo viên và kiểm tra xung đột lịch học.
*   **Repository Layer:** Triển khai Repository Pattern để đóng gói các câu lệnh truy vấn dữ liệu từ cơ sở dữ liệu.
*   **Infrastructure (Data):** Chứa DbContext, cấu hình Fluent API định nghĩa các mối quan hệ thực thể, và các bản Migrations của Entity Framework Core.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Tầng công nghệ | Công nghệ / Thư viện tiêu biểu |
| :--- | :--- |
| **Backend Core** | ASP.NET Core 8 Web API, C#, .NET 8 (LTS) |
| **Database & ORM** | Microsoft SQL Server, Entity Framework Core 8 |
| **Xác thực & Bảo mật** | ASP.NET Core Identity, JWT (JSON Web Tokens), Refresh Token |
| **Tác vụ ngầm** | `BackgroundService` (.NET Core Hosted Services) chạy quét ví định kỳ |
| **Công cụ xuất file** | ClosedXML (Excel), QuestPDF (PDF generation) |
| **Thư viện Backend** | AutoMapper, FluentValidation, Swashbuckle (Swagger UI) |
| **Frontend Core** | React 19, TypeScript, Vite |
| **Quản lý State** | Redux Toolkit (RTK), React Query (TanStack Query) |
| **Định tuyến** | React Router DOM v6 (hỗ trợ Protected Routes / RBAC) |
| **UI Component Library** | Ant Design (AntD) |
| **Biểu đồ & HTTP** | Recharts, Axios (tích hợp Auto-Refresh Token Interceptors) |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống (Prerequisites)
*   [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) trở lên
*   [Node.js](https://nodejs.org/) (Khuyên dùng v18 hoặc v20 LTS trở lên)
*   [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express hoặc Enterprise edition)
*   Git

### Bước 1: Clone dự án về máy
```bash
git clone https://github.com/thuanan2003/EduManagementSystem.git
cd EduManagementSystem
```

### Bước 2: Cấu hình và chạy Backend API
1.  Di chuyển vào thư mục dự án Backend:
    ```bash
    cd SmartEduWebAPI
    ```
2.  Mở file `appsettings.json` và cập nhật chuỗi kết nối cơ sở dữ liệu `DefaultConnection` phù hợp với cấu hình SQL Server trên máy của bạn:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=SmartEduDB;Trusted_Connection=True;TrustServerCertificate=True;"
    }
    ```
3.  Chạy ứng dụng Backend (hệ thống sẽ tự động thực hiện Migration tạo cơ sở dữ liệu và seed dữ liệu mẫu trong lần chạy đầu tiên):
    ```bash
    dotnet run
    ```
    *   API chạy tại: `http://localhost:5258`
    *   Swagger API Docs: `http://localhost:5258/swagger`

### Bước 3: Cấu hình và chạy Frontend Client
1.  Mở một cửa sổ terminal mới từ thư mục gốc dự án và di chuyển vào thư mục frontend:
    ```bash
    cd client-app
    ```
2.  Cài đặt các gói thư viện (dependencies):
    ```bash
    npm install
    ```
3.  Khởi động ứng dụng frontend ở môi trường phát triển (development):
    ```bash
    npm run dev
    ```
    *   Ứng dụng chạy tại: `http://localhost:5173`
    *   *Lưu ý:* Cấu hình Proxy trong file `vite.config.ts` sẽ tự động chuyển tiếp toàn bộ request `/api` và `/Uploads` từ frontend về cổng API `http://localhost:5258` của Backend.

---

## 👥 Tài khoản thử nghiệm (Seed Data)

Hệ thống đã chuẩn bị sẵn các tài khoản mẫu phục vụ kiểm thử đăng nhập nhanh theo từng vai trò (Role):

| Vai trò | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@smartedu.local` | `Admin@123` |
| **Giáo viên (Teacher)** | `teacher@smartedu.local` | `Teacher@123` |
| **Học sinh (Student)** | `student@smartedu.local` | `Student@123` |

> [!IMPORTANT]
> Mật khẩu seed mặc định chứa ký tự đặc biệt `@` (ví dụ: `Admin@123`) để đáp ứng các tiêu chuẩn về độ mạnh mật khẩu mặc định của thư viện `ASP.NET Core Identity`.

---

## 🔑 Quy tắc nghiệp vụ cốt lõi (Business Rules)

*   **Logic khấu trừ học phí tự động:**
    *   Khi điểm danh là **Có mặt (Present)** hoặc **Nghỉ không phép (UnexcusedAbsence)**: Hệ thống trừ trực tiếp số tiền học tương ứng trong ví của học sinh (`Wallet.Balance`) và giảm số buổi học còn lại (`Wallet.RemainingSessions`) đi 1.
    *   Khi điểm danh là **Nghỉ có phép (ExcusedAbsence)**: Không trừ tiền học sinh.
    *   **Chống trừ tiền trùng lặp (Double Deduction Prevention):** Trạng thái điểm danh lưu kèm cờ `IsDeducted`. Nếu cập nhật trạng thái điểm danh từ Có mặt sang Nghỉ có phép, ví của học sinh sẽ tự động được hoàn lại tiền (Refund) và cờ `IsDeducted` sẽ đặt về `false`.
*   **Ngăn ngừa trùng lịch biểu (Conflict Checks):**
    *   Giáo viên không thể dạy đồng thời 2 lớp tại cùng một khung giờ.
    *   Phòng học không thể xếp lịch cho 2 lớp học đồng thời.
*   **Nhắc nhở học phí chạy ngầm:**
    *   Tác vụ chạy ngầm định kỳ 24h quét toàn bộ ví học sinh. Bất kỳ ví nào có số dư dưới 500,000 VND hoặc còn dưới 3 buổi học sẽ tự động nhận được thông báo nhắc nhở nạp tiền trên hệ thống.

---

## 📁 Cấu trúc thư mục

```text
SmartEduProject/
├── client-app/                  # Mã nguồn Frontend (React, Vite, TypeScript)
│   ├── public/                  # Tài nguyên tĩnh phía Client
│   ├── src/                     # Source code React chính
│   │   ├── components/          # Component dùng chung, Layout, ProtectedRoute
│   │   ├── pages/               # Phân trang chi tiết (admin, teacher, student)
│   │   ├── services/            # Axios instance, Interceptors tự động refresh token
│   │   └── store/               # Redux Toolkit store và authSlice
│   └── vite.config.ts           # Cấu hình Vite dev server và proxy endpoint
├── SmartEduWebAPI/              # Mã nguồn Backend (ASP.NET Core 8 Web API)
│   ├── Controllers/             # API Endpoints xử lý các nghiệp vụ
│   ├── Data/                    # DbContext cấu hình database và SeedData
│   ├── DTOs/                    # Data Transfer Objects trao đổi dữ liệu
│   ├── Models/                  # Thực thể Database (Student, Teacher, Wallet,...)
│   ├── Repositories/            # Logic truy vấn Database (Repository Pattern)
│   ├── Services/                # Lớp nghiệp vụ (Service Layer) & Background Tasks
│   └── Program.cs               # Cấu hình Startup, Middlewares, DI
```
