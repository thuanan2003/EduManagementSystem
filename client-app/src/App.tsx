import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { useAppSelector } from './hooks/redux';

// Admin Pages
import { Overview } from './pages/admin/Overview';
import { Students } from './pages/admin/Students';
import { StudentDetail } from './pages/admin/StudentDetail';
import { Teachers } from './pages/admin/Teachers';
import { Courses } from './pages/admin/Courses';
import { Classes } from './pages/admin/Classes';
import { Reports } from './pages/admin/Reports';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentSchedule } from './pages/student/Schedule';
import { StudentClasses } from './pages/student/Classes';
import { StudentTuition } from './pages/student/Tuition';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { TeacherSchedule } from './pages/teacher/Schedule';
import { TeacherAttendance } from './pages/teacher/Attendance';

// Redirection component to route users to their respective dashboards based on role
const RootRedirect: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  if (user?.roles.includes('Admin')) {
    return <Navigate to="/admin" replace />;
  } else if (user?.roles.includes('Student')) {
    return <Navigate to="/student" replace />;
  } else if (user?.roles.includes('Teacher')) {
    return <Navigate to="/teacher" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Route: Redirect to dashboard based on role */}
          <Route index element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/students"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/students/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/teachers"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/classes"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/schedule"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/classes"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/tuition"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentTuition />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="teacher"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/schedule"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherAttendance />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
