import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import JobsListPage from './pages/JobsListPage';
import JobDetailPage from './pages/JobDetailPage';
import JobFormPage from './pages/JobFormPage';
import MyPostingsPage from './pages/MyPostingsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import CoursesListPage from './pages/CoursesListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseFormPage from './pages/CourseFormPage';
import CourseContentFormPage from './pages/CourseContentFormPage';
import MyCoursesPage from './pages/MyCoursesPage';
import MyEnrollmentsPage from './pages/MyEnrollmentsPage';
import BulletinsListPage from './pages/BulletinsListPage';
import BulletinFormPage from './pages/BulletinFormPage';
import MyBulletinsPage from './pages/MyBulletinsPage';
import ConnectionsPage from './pages/ConnectionsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppLayout />}>
        <Route path="/teachers/:id" element={<TeacherProfilePage />} />
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/courses" element={<CoursesListPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/bulletins" element={<BulletinsListPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route element={<RoleRoute allow={['INSTITUTION']} />}>
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/mine" element={<MyPostingsPage />} />
            <Route path="/bulletins/new" element={<BulletinFormPage />} />
            <Route path="/bulletins/mine" element={<MyBulletinsPage />} />
          </Route>

          <Route element={<RoleRoute allow={['TEACHER']} />}>
            <Route path="/applications/mine" element={<MyApplicationsPage />} />
            <Route path="/courses/new" element={<CourseFormPage />} />
            <Route path="/courses/:id/content/new" element={<CourseContentFormPage />} />
            <Route path="/teachers/me/courses" element={<MyCoursesPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
          </Route>

          <Route element={<RoleRoute allow={['STUDENT']} />}>
            <Route path="/students/me/enrollments" element={<MyEnrollmentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
