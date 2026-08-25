import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect to home if logged in but not admin, else redirect to login
    return <Navigate to={user ? '/' : '/login'} replace />;
  }

  return children;
};

export default AdminRoute;
