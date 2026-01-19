import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

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
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile
  const fetchProfile = useMemo(() => async (userId) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (data) {
        setProfile(data);
      }
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []); // Stable reference

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          fetchProfile(newSession.user.id).catch(err => 
            console.error('Background profile fetch failed:', err)
          );
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Send OTP
  const signInWithPhone = useMemo(() => async (phone) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify OTP
  const verifyOtp = useMemo(() => async (phone, token) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useMemo(() => async (role) => {
    
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const updates = {
        id: user.id,
        phone: user.phone,
        role,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update role error:', error);
      return { error };
    }
  }, [user]); // Re-creates when user changes

  const signOut = useMemo(() => async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    profileLoading,
    signInWithPhone,
    verifyOtp,
    updateRole,
    signOut,
  }), [user, session, profile, loading, profileLoading, signInWithPhone, verifyOtp, updateRole, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
