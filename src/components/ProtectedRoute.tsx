import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading, isAdmin, resetInactivityTimer } = useAuth();
  const navigate = useNavigate();
  const hasHandledAuth = useRef(false);

  useEffect(() => {
    // Only run this once when auth state is determined
    if (!isLoading && !hasHandledAuth.current) {
      hasHandledAuth.current = true;

      // Check authentication
      if (!user) {
        toast.error('Unauthorized access', {
          description: 'Please log in to access this page.'
        });
        navigate('/auth');
        return;
      } 
      
      // Check admin privileges if needed
      if (adminOnly && !isAdmin) {
        toast.error('Unauthorized access', {
          description: 'You need admin privileges to access this page.'
        });
        navigate('/challenges');
        return;
      }
      
      // Reset inactivity timer on route change
      resetInactivityTimer();
    }
  }, [user, isLoading, navigate, adminOnly, isAdmin, resetInactivityTimer]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="text-cyber-blue animate-pulse">Loading...</div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;