import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import StudentDashboard from './pages/student/StudentDashboard';
import ApplicationFormPage from './pages/student/ApplicationFormPage';
import ApplicationDetailsPage from './pages/student/ApplicationDetailsPage';
import NotificationsPage from './pages/student/NotificationsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageApplicationsPage from './pages/admin/ManageApplicationsPage';
import ReviewApplicationPage from './pages/admin/ReviewApplicationPage';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Panel */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/apply"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ApplicationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/application"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ApplicationDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReviewApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStudentsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
