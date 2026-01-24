import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading, { PageLoading } from './Loading';

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Show tractor animation while checking initial auth state
  if (loading) {
    return <Loading text="Checking authentication" />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is required and user has it
  if (requireRole) {
    // Wait for profile to load before checking role
    if (profileLoading) {
      return <PageLoading />;
    }

    if (profile?.role !== requireRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Enforce profile completion for farmers
  // Don't redirect if we are already on the login page (handled by Login component itself)
  if (profile?.role === 'farmer' && (!profile?.full_name || !profile?.location) && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated (and has required role if specified)
  return children;
}
