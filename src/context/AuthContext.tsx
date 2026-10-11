// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — AUTHENTICATION & AUTHORIZATION STATE MACHINE
// Strictly prevents false "Unauthorized" flashes. Real Supabase integration.
// ==============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { AdminUser } from '../types/database';
import { AuthStateStatus, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStateStatus>('CHECKING_SESSION');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verifies the user's UUID in the admin_users table
  const verifyAdminAuthorization = useCallback(async (authenticatedUser: User): Promise<boolean> => {
    setStatus('CHECKING_ADMIN');
    setErrorMessage(null);

    try {
      if (!isSupabaseReady()) {
        setStatus('UNAUTHORIZED');
        setErrorMessage('Supabase database connection is not configured.');
        return false;
      }

      // Query admin_users by user_id UUID, ensuring enabled = true
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authenticatedUser.id)
        .eq('enabled', true)
        .maybeSingle();

      if (error) {
        console.error('[AUTH CHECK ERROR]', error);
        setStatus('ERROR');
        setErrorMessage(`Authorization verification failed: ${error.message}`);
        return false;
      }

      if (data && (data.role === 'admin' || data.role === 'super_admin')) {
        setAdminRecord(data as AdminUser);
        setStatus('AUTHORIZED');
        return true;
      } else {
        setAdminRecord(null);
        setStatus('UNAUTHORIZED');
        setErrorMessage('User exists in Supabase Auth but does not possess an enabled record in admin_users.');
        return false;
      }
    } catch (err: any) {
      console.error('[AUTH UNEXPECTED FAULT]', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Unexpected authorization error');
      return false;
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseReady()) {
        if (mounted) {
          setStatus('UNAUTHENTICATED');
        }
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[GET SESSION ERROR]', error);
          if (mounted) {
            setStatus('UNAUTHENTICATED');
          }
          return;
        }

        if (initialSession && initialSession.user) {
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            await verifyAdminAuthorization(initialSession.user);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setAdminRecord(null);
            setStatus('UNAUTHENTICATED');
          }
        }
      } catch (err) {
        console.error('[SESSION INIT FAULT]', err);
        if (mounted) {
          setStatus('UNAUTHENTICATED');
        }
      }
    }

    initializeAuth();

    // Listen to Supabase Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await verifyAdminAuthorization(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setAdminRecord(null);
          setStatus('UNAUTHENTICATED');
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          // Only re-verify if not already authorized
          if (status !== 'AUTHORIZED') {
            await verifyAdminAuthorization(newSession.user);
          }
        } else if (event === 'USER_UPDATED' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAdminAuthorization]);

  const signIn = async (email: string, password: string) => {
    setErrorMessage(null);

    if (!isSupabaseReady()) {
      return { success: false, error: 'Database environment credentials missing in .env.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const authorized = await verifyAdminAuthorization(data.user);
        if (!authorized) {
          return {
            success: false,
            error: 'Authentication succeeded, but account is not authorized in admin_users.',
          };
        }
        return { success: true };
      }

      return { success: false, error: 'No user returned from authentication.' };
    } catch (err: any) {
      const msg = err.message || 'Sign in encountered an unexpected failure.';
      setErrorMessage(msg);
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseReady()) {
        await supabase.auth.signOut();
      }
    } finally {
      setUser(null);
      setSession(null);
      setAdminRecord(null);
      setStatus('UNAUTHENTICATED');
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseReady()) {
      return { success: false, error: 'Database environment credentials missing in .env.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseReady()) {
      return { success: false, error: 'Database environment credentials missing in .env.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed.' };
    }
  };

  const refreshAdminStatus = async () => {
    if (user) {
      await verifyAdminAuthorization(user);
    }
  };

  const value: AuthContextType = {
    status,
    user,
    session,
    adminRecord,
    isAuthorizedAdmin: status === 'AUTHORIZED',
    errorMessage,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    refreshAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be utilized within an AuthProvider hierarchy.');
  }
  return context;
};
