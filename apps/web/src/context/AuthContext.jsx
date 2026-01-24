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
  const [profileLoading, setProfileLoading] = useState(false); // ✅ FIX 1: Make it a state variable

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');

      if (token && storedUser) {
        // Optimistically set user
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // ✅ FIX 2: Set profileLoading to true while fetching
        setProfileLoading(true);

        // Validate token and refresh profile in background
        try {
          const profileData = await api.users.getProfile();

          // ✅ FIX 3: Properly merge the profile data
          const updatedUser = {
            ...parsedUser,
            ...profileData,
            // Ensure role is present
            role: profileData.role || parsedUser.role || 'farmer'
          };

          setUser(updatedUser);
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Session validation failed:', error);
          // If 401, clear session
          if (error.message === 'Unauthorized' || error.message.includes('401')) {
            logout();
          }
        } finally {
          // ✅ FIX 4: Set profileLoading to false after fetch completes
          setProfileLoading(false);
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

      // ✅ FIX 5: Ensure role exists in the user object
      const userWithRole = {
        ...data.user,
        role: data.user.role || 'farmer' // Default to farmer if no role
      };

      // Store session
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(userWithRole));

      setUser(userWithRole);
      return { data: { ...data, user: userWithRole }, error: null };
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
  };

  const refreshProfile = useCallback(async () => {
    try {
      const profileData = await api.users.getProfile();
      // Backend returns flat structure: { id, phone, role, name, location... }
      // Frontend expects: { full_name, ... }

      const updatedUser = {
        ...user,
        ...profileData,
        full_name: profileData.name || profileData.full_name || user?.full_name
      };

      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Refresh profile error:', error);
      return null;
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    session: user, // Backward compatibility
    profile: user, // Backward compatibility: merged user and profile
    loading,
    profileLoading, // ✅ Now this is the actual state variable
    signInWithPhone,
    verifyOtp,
    updateRole,
    signOut,
    refreshProfile
  }), [user, loading, signInWithPhone, verifyOtp, updateRole, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;