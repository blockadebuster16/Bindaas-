import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('adminToken');

  // If no token exists, they are not an admin. Redirect to secure login.
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  // Admin verified. Render the child components (AdminDashboard).
  return <Outlet />;
};

export default AdminRoute;
