import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-blue via-white to-warm-cream">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-mind-blue mx-auto mb-4" />
          <p className="text-neutral-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;