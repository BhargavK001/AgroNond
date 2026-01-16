import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from './Loading';

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return <PageLoading />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is required and user has it
  if (requireRole && profile?.role !== requireRole) {
    // User doesn't have required role - redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated (and has required role if specified)
  return children;
}
