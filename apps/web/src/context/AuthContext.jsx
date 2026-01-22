import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');

      if (token && storedUser) {
        // Optimistically set user
        setUser(JSON.parse(storedUser));

        // Validate token and refresh profile in background
        try {
          const profileData = await api.users.getProfile();
          // Merge profile data
          const updatedUser = { ...profileData.user, ...profileData.profile };
          setUser(updatedUser);
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Session validation failed:', error);
          // If 401, clear session
          if (error.message === 'Unauthorized' || error.message.includes('401')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Send OTP
  const signInWithPhone = useCallback(async (phone) => {
    try {
      setLoading(true);
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify OTP
  const verifyOtp = useCallback(async (phone, token) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store session
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (role) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      // Use API wrapper
      const response = await api.users.setRole(role);

      // Update local state
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      return { data: response, error: null };
    } catch (error) {
      console.error('Update role error:', error);
      return { error };
    }
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      // Call backend logout (optional, but good practice)
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      logout();
      setLoading(false);
      return { error: null };
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    session: user, // Backward compatibility
    profile: user, // Backward compatibility: merged user and profile
    loading,
    profileLoading: false,
    signInWithPhone,
    verifyOtp,
    updateRole,
    signOut,
  }), [user, loading, signInWithPhone, verifyOtp, updateRole, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;