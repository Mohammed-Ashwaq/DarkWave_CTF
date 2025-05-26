import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DEFAULT_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (user: User) => Promise<void>;
  isAdmin: boolean;
  resetInactivityTimer: () => void;
  updateProfile: (updates: { display_name?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  inactivityTimeout?: number;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  inactivityTimeout = DEFAULT_INACTIVITY_TIMEOUT
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (user) {
      const timer = setTimeout(() => {
        console.log('User inactive. Signing out...');
        toast.info('Signed out due to inactivity');
        signOut();
      }, inactivityTimeout);
      setInactivityTimer(timer);
    }
  };

  const refreshProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setIsAdmin(!!data?.is_admin);
      console.log("Profile refreshed:", data);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const updateProfile = async (updates: { display_name?: string; bio?: string }) => {
    if (!user) {
      console.log("Cannot update profile - no user logged in");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Successfully signed in!');
      navigate('/challenges');
    } catch (error: any) {
      toast.error('Error signing in', {
        description: error.message
      });
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });

      if (error) throw error;

      toast.success('Successfully signed up!', {
        description: 'Please verify your email.'
      });
    } catch (error: any) {
      toast.error('Error signing up', {
        description: error.message
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Signed out');
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setSession(null);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
    } catch (error: any) {
      toast.error('Error signing out', {
        description: error.message
      });
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted");
    setIsLoading(true);

    let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"] | null = null;

    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const currentUser = currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);

      if (currentUser) {
        await refreshProfile(currentUser);
        resetInactivityTimer();
      }

      setIsLoading(false);

      authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
        const authUser = session?.user ?? null;
        console.log("Auth state changed:", event, !!authUser);

        setSession(session);
        setUser(authUser);

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            setInactivityTimer(null);
          }
          toast.info('Signed out');
          setIsLoading(false);
        }

        if (authUser) {
          await refreshProfile(authUser);
          resetInactivityTimer();
          setIsLoading(false);
        }
      }).data.subscription;
    };

    initAuth();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const onActivity = () => resetInactivityTimer();
    activityEvents.forEach(e => window.addEventListener(e, onActivity));

    return () => {
      console.log("AuthProvider cleanup");
      if (authSubscription) authSubscription.unsubscribe();
      activityEvents.forEach(e => window.removeEventListener(e, onActivity));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isAdmin,
      resetInactivityTimer,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
