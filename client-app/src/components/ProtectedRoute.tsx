import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !user.roles.some((role) => allowedRoles.includes(role))) {
    // Redirect to home role page
    if (user.roles.includes('Admin')) {
      return <Navigate to="/admin" replace />;
    } else if (user.roles.includes('Student')) {
      return <Navigate to="/student" replace />;
    } else if (user.roles.includes('Teacher')) {
      return <Navigate to="/teacher" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
