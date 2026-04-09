import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import LoadingAnimation from './LoadingAnimation';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: 'client' | 'associate';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingAnimation message="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Optional: Redirect if user has the wrong role
    // You might want to show an "Unauthorized" page instead
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
