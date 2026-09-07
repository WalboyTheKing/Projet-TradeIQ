// ============================================================================
// AUTH CONTEXT — TRADEIQ (SUPABASE AUTH INTEGRATION)
// Manages authentication state, user sessions, and public.users profile synchronization
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getFriendlyAuthErrorMessage } from '../lib/supabase';
import { UserProfile } from '../types/trade';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string; needsEmailVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'tradeiq_auth_fallback_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync or fetch profile from public.users
  const fetchUserProfile = useCallback(async (supabaseUser: User): Promise<UserProfile> => {
    const fallbackProfile: UserProfile = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Trader',
      email: supabaseUser.email || '',
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'UTC',
      defaultRiskUnit: '%',
      defaultRiskValue: 1.0,
      initialCapital: 10000,
      plan: 'free',
      favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
      onboardingCompleted: false,
      subscriptionTier: 'STARTER',
    };

    if (!isSupabaseConfigured) {
      // In local offline mode
      const saved = localStorage.getItem(`tradeiq_profile_${supabaseUser.id}`);
      if (saved) {
        try {
          return { ...fallbackProfile, ...JSON.parse(saved) };
        } catch {}
      }
      return fallbackProfile;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not read public.users profile:', error.message);
      }

      if (data) {
        return {
          id: data.id,
          name: data.name || fallbackProfile.name,
          email: data.email || fallbackProfile.email,
          currency: data.currency || 'USD',
          currencySymbol: data.currency_symbol || '$',
          timezone: data.timezone || 'UTC',
          defaultRiskUnit: (data.default_risk_unit as '%' | '$') || '%',
          defaultRiskValue: Number(data.default_risk_value) || 1.0,
          initialCapital: Number(data.initial_capital) || 10000,
          plan: data.plan || 'free',
          favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
          onboardingCompleted: Boolean(data.onboarding_completed),
          subscriptionTier: data.plan === 'premium' ? 'ELITE' : data.plan === 'pro' ? 'PRO' : 'STARTER',
        };
      }

      // If user profile does not exist yet (e.g. trigger delay), insert it
      const insertPayload = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: fallbackProfile.name,
        plan: 'free',
        currency: 'USD',
        currency_symbol: '$',
        timezone: 'UTC',
        default_risk_unit: '%',
        default_risk_value: 1.0,
        initial_capital: 10000.0,
        onboarding_completed: false,
      };

      const { data: inserted } = await supabase
        .from('users')
        .insert(insertPayload)
        .select()
        .single();

      if (inserted) {
        return {
          ...fallbackProfile,
          id: inserted.id,
          name: inserted.name,
          plan: inserted.plan || 'free',
          onboardingCompleted: Boolean(inserted.onboarding_completed),
        };
      }
    } catch (err) {
      console.warn('Error fetching or creating public.users:', err);
    }

    return fallbackProfile;
  }, []);

  // Initialize and listen to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        // Fallback for environment without Supabase keys yet
        const savedFallback = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (savedFallback) {
          try {
            const parsed = JSON.parse(savedFallback);
            if (isMounted) {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch {}
        }
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }

        if (initialSession?.user && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          const prof = await fetchUserProfile(initialSession.user);
          if (isMounted) setProfile(prof);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      const currentUser = newSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const prof = await fetchUserProfile(currentUser);
        if (isMounted) setProfile(prof);
      } else {
        if (isMounted) setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchUserProfile(user);
      setProfile(p);
    }
  }, [user, fetchUserProfile]);

  // Sign In with Email and Password
  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      if (!isSupabaseConfigured) {
        // Mock offline session for preview if keys not set
        const mockUser = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          email,
          user_metadata: { name: email.split('@')[0] },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;

        const mockProfile: UserProfile = {
          id: mockUser.id,
          name: email.split('@')[0],
          email,
          currency: 'USD',
          currencySymbol: '$',
          timezone: 'UTC',
          defaultRiskUnit: '%',
          defaultRiskValue: 1.0,
          initialCapital: 10000,
          plan: 'free',
          favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
          onboardingCompleted: true,
          subscriptionTier: 'STARTER',
        };

        setUser(mockUser);
        setProfile(mockProfile);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
        return {};
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const p = await fetchUserProfile(data.user);
        setProfile(p);
      }

      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err) };
    }
  };

  // Sign Up with Email and Password
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error?: string; needsEmailVerification?: boolean }> => {
    try {
      if (!isSupabaseConfigured) {
        return await signInWithEmail(email, password);
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error) };
      }

      // Check if user is immediately logged in or requires confirmation
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        const p = await fetchUserProfile(data.user);
        setProfile(p);
        return { needsEmailVerification: false };
      }

      // If no session is returned, email confirmation is required
      return { needsEmailVerification: true };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err) };
    }
  };

  // Sign In with Google OAuth via Supabase
  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback demo for preview without credentials
        return await signInWithEmail('google.trader@tradeiq.io', 'password123');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error) };
      }

      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err) };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      localStorage.removeItem('tradeiq_onboarded');
    }
  };

  // Reset Password Request (Send link to email)
  const resetPasswordForEmail = async (email: string): Promise<{ error?: string }> => {
    try {
      if (!isSupabaseConfigured) {
        return {};
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error) };
      }

      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err) };
    }
  };

  // Update Password (from reset password session)
  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
      if (!isSupabaseConfigured) return {};

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error) };
      }

      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err) };
    }
  };

  // Update Profile Preferences (Strictly disallows modifying plan from client)
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!profile || !user) return { error: 'Aucun utilisateur connecté.' };

    // Prevent client from changing plan
    const { plan, subscriptionTier, ...safeUpdates } = updates;

    const newProfile: UserProfile = {
      ...profile,
      ...safeUpdates,
    };

    setProfile(newProfile);

    if (isSupabaseConfigured) {
      try {
        const dbPayload: any = {};
        if (safeUpdates.name !== undefined) dbPayload.name = safeUpdates.name;
        if (safeUpdates.currency !== undefined) dbPayload.currency = safeUpdates.currency;
        if (safeUpdates.currencySymbol !== undefined) dbPayload.currency_symbol = safeUpdates.currencySymbol;
        if (safeUpdates.timezone !== undefined) dbPayload.timezone = safeUpdates.timezone;
        if (safeUpdates.defaultRiskUnit !== undefined) dbPayload.default_risk_unit = safeUpdates.defaultRiskUnit;
        if (safeUpdates.defaultRiskValue !== undefined) dbPayload.default_risk_value = safeUpdates.defaultRiskValue;
        if (safeUpdates.initialCapital !== undefined) dbPayload.initial_capital = safeUpdates.initialCapital;
        if (safeUpdates.onboardingCompleted !== undefined) dbPayload.onboarding_completed = safeUpdates.onboardingCompleted;

        const { error } = await supabase
          .from('users')
          .update(dbPayload)
          .eq('id', user.id);

        if (error) {
          console.warn('Failed to update public.users:', error.message);
          return { error: getFriendlyAuthErrorMessage(error) };
        }
      } catch (err: any) {
        return { error: getFriendlyAuthErrorMessage(err) };
      }
    } else {
      localStorage.setItem(`tradeiq_profile_${user.id}`, JSON.stringify(newProfile));
    }

    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
