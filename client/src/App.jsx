/**
 * Author: Adeeba Fatima Zaidi
 * Project: CampusConnect
 * Copyright: © 2026 Adeeba Fatima Zaidi
 */

import { Outlet, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminComplaints from './pages/AdminComplaints';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './context/AuthContext';

/** Full-height shell: sidebar + topbar + scrollable content */
const DashboardLayout = () => (
  <ProtectedRoute>
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Topbar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  </ProtectedRoute>
);

/** Role-aware index: admin→AdminDashboard, staff→StaffDashboard, student→StudentDashboard */
const RoleIndex = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'staff') return <StaffDashboard />;
  return <StudentDashboard />;
};

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route index element={<RoleIndex />} />
            <Route path="submit" element={<SubmitComplaint />} />
            <Route path="complaints/:id" element={<ComplaintDetails />} />
            <Route
              path="admin/complaints"
              element={
                <StaffRoute>
                  <AdminComplaints />
                </StaffRoute>
              }
            />
            <Route
              path="admin/stats"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
