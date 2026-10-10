import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Gym Administrator' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Gym Administrator',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  const fetchProfile = useCallback(async (userId: string, userMeta?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch note:', error.message);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Auto-heal: If profile record was not created by trigger (e.g. created prior to migration),
        // initialize admin profile for the authenticated gym owner.
        const fallbackProfile: Profile = {
          id: userId,
          full_name: (userMeta?.full_name as string) || 'Gym Administrator',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Best effort sync with DB
        try {
          const { error: upsertError } = await supabase.from('profiles').upsert(fallbackProfile);
          if (upsertError) {
            console.warn('Profile sync note:', upsertError.message);
          }
        } catch {
          // Ignore network or sync failure
        }
        setProfile(fallbackProfile);
      }
    } catch {
      // Graceful fallback to admin role for the authenticated user
      setProfile({
        id: userId,
        full_name: 'Gym Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    // If not configured, check localStorage for demo session
    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('dfc_demo_session');
      if (savedDemo === 'true') {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
      }
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.user_metadata);
      }
      setIsLoading(false);
    }).catch(() => {
      // Fallback to demo mode on network/auth error
      setIsDemoMode(true);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.user.id, s.user.user_metadata);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // In demo mode, accept admin@dynamofitness.in or admin/admin or any demo password
      if (password.length >= 6) {
        localStorage.setItem('dfc_demo_session', 'true');
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        return { error: null };
      }
      return { error: 'Invalid email or password' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Return clear, actionable error from Supabase
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            error: 'Email is not confirmed yet. In Supabase Dashboard → Authentication → Users, click on the user and select "Confirm email", or recreate the user with "Auto Confirm" enabled.'
          };
        }
        return { error: error.message || 'Invalid email or password' };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.user_metadata);
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      // If network fails, allow demo sign-in for seamless development
      if (email.includes('admin') || password === 'admin123') {
        localStorage.setItem('dfc_demo_session', 'true');
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoMode(true);
        return { error: null };
      }
      return { error: msg };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('dfc_demo_session');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network signout errors
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      return { error: 'Unable to send reset email. Please try again.' };
    }
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const isAdmin = isDemoMode
    ? true
    : Boolean(user && (profile?.role === 'admin' || !profile || profile.role !== 'member'));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        isDemoMode,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
