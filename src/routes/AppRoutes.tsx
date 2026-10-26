import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getDefaultRouteForRole } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Shared Pages
import { ProfilePage } from '../pages/shared/ProfilePage';
import { NotificationsPage } from '../pages/shared/NotificationsPage';
import { ForbiddenPage } from '../pages/shared/ForbiddenPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { MasterData } from '../pages/admin/MasterData';
import { StudentsManagement } from '../pages/admin/StudentsManagement';
import { TeachersManagement } from '../pages/admin/TeachersManagement';
import { OfferingsManagement } from '../pages/admin/OfferingsManagement';
import { TimetableManagement } from '../pages/admin/TimetableManagement';
import { SessionsManagement } from '../pages/admin/SessionsManagement';
import { DevicesManagement } from '../pages/admin/DevicesManagement';
import { AttendancePolicy } from '../pages/admin/AttendancePolicy';
import { ApprovalsManagement } from '../pages/admin/ApprovalsManagement';
import { ReportsGenerator } from '../pages/admin/ReportsGenerator';
import { FaceAnalytics } from '../pages/admin/FaceAnalytics';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { UserManagement } from '../pages/admin/UserManagement';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { MyClasses } from '../pages/teacher/MyClasses';
import { TakeAttendance } from '../pages/teacher/TakeAttendance';
import { FaceReviewQueue } from '../pages/teacher/FaceReviewQueue';
import { TeacherCorrections } from '../pages/teacher/TeacherCorrections';
import { TeacherReports } from '../pages/teacher/TeacherReports';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentAttendanceHistory } from '../pages/student/StudentAttendanceHistory';
import { CheckIn } from '../pages/student/CheckIn';
import { ApplyLeave } from '../pages/student/ApplyLeave';
import { RaiseCorrection } from '../pages/student/RaiseCorrection';
import { BiometricPrivacy } from '../pages/student/BiometricPrivacy';

// Parent Pages
import { ParentDashboard } from '../pages/parent/ParentDashboard';

export const AppRoutes: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRouteForRole(role)} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Protected Root & Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Index redirect to user's role-based home dashboard */}
        <Route index element={<Navigate to={getDefaultRouteForRole(role)} replace />} />

        {/* Shared Authenticated Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/master-data"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <MasterData />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <StudentsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <TeachersManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/offerings"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <OfferingsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <TimetableManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <SessionsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/devices"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <DevicesManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/policy"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AttendancePolicy />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <ApprovalsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <ReportsGenerator />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/face-analytics"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <FaceAnalytics />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AuditLogs />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </RoleRoute>
          }
        />

        {/* TEACHER ROUTES */}
        <Route
          path="/teacher/dashboard"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <MyClasses />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/take-attendance"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TakeAttendance />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/review-queue"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <FaceReviewQueue />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/corrections"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherCorrections />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/reports"
          element={
            <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherReports />
            </RoleRoute>
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentAttendanceHistory />
            </RoleRoute>
          }
        />
        <Route
          path="/student/check-in"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <CheckIn />
            </RoleRoute>
          }
        />
        <Route
          path="/student/leave"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <ApplyLeave />
            </RoleRoute>
          }
        />
        <Route
          path="/student/correction"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <RaiseCorrection />
            </RoleRoute>
          }
        />
        <Route
          path="/student/biometric"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <BiometricPrivacy />
            </RoleRoute>
          }
        />

        {/* PARENT ROUTES */}
        <Route
          path="/parent/dashboard"
          element={
            <RoleRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/parent/attendance"
          element={
            <RoleRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/parent/leaves"
          element={
            <RoleRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentDashboard />
            </RoleRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
