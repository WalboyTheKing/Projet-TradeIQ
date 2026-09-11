// ============================================================================
// OAUTH CALLBACK HANDLER — TRADEIQ (/auth/callback)
// Resolves Supabase Google OAuth: supports both PKCE (?code=) and Implicit (#access_token=)
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../lib/storage';

interface AuthCallbackProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onNavigateLogin }) => {
  const { refreshProfile, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Keep stable references to props and context methods to prevent effect tear-down
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const refreshProfileRef = useRef(refreshProfile);
  refreshProfileRef.current = refreshProfile;

  const completedRef = useRef(false);

  useEffect(() => {
    let isDisposed = false;

    // Single unified finalization handler
    const finalizeSessionSuccess = async (userId: string) => {
      if (completedRef.current) return;
      completedRef.current = true;

      // 1. Immediate URL cleanup so no tokens or codes remain in browser history
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', '/dashboard');
      }

      // 2. Disable demo mode
      storageService.setDemoMode(false);

      // 3. Synchronize profile with a strict 2.5s timeout to ensure navigation never blocks
      try {
        await Promise.race([
          refreshProfileRef.current(),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      } catch (syncErr) {
        console.warn('[OAuth] Warning profile sync:', syncErr);
      }

      // 4. Redirect to dashboard
      onSuccessRef.current();
    };

    // Listen for auth state transitions triggered in the background
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
        newSession?.user &&
        !completedRef.current
      ) {
        await finalizeSessionSuccess(newSession.user.id);
      }
    });

    async function processOAuthCallback() {
      try {
        // First: Check if a valid session is ALREADY available (e.g. auto-resolved by client or page refresh)
        const { data: existingSessionData } = await supabase.auth.getSession();
        if (existingSessionData?.session?.user) {
          await finalizeSessionSuccess(existingSessionData.session.user.id);
          return;
        }

        const rawHash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(rawHash);
        const searchParams = new URLSearchParams(window.location.search);

        // Check for provider-level errors in URL query or hash
        const errorDesc =
          hashParams.get('error_description') ||
          searchParams.get('error_description') ||
          hashParams.get('error') ||
          searchParams.get('error');

        if (errorDesc) {
          if (window.history?.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          if (!isDisposed && !completedRef.current) {
            setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          }
          return;
        }

        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // ======================================================================
        // FLOW A: PKCE Authorization Code Flow (?code=...)
        // ======================================================================
        if (code) {
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            // Check whether the code was already consumed by the background client
            const { data: retrySession } = await supabase.auth.getSession();
            if (retrySession?.session?.user) {
              await finalizeSessionSuccess(retrySession.session.user.id);
              return;
            }

            console.error('[OAuth] exchangeCodeForSession error:', exchangeError.message);
            if (!isDisposed && !completedRef.current) {
              setError(
                exchangeError.message ||
                "Impossible d'échanger le code d'autorisation Google. Veuillez réessayer."
              );
            }
            return;
          }

          if (exchangeData?.session?.user) {
            await finalizeSessionSuccess(exchangeData.session.user.id);
            return;
          }
        }

        // ======================================================================
        // FLOW B: Implicit Grant Flow (#access_token=...&refresh_token=...)
        // ======================================================================
        else if (accessToken && refreshToken) {
          const { data: setData, error: setErrorObj } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setErrorObj) {
            console.error('[OAuth] setSession error:', setErrorObj.message);
            if (!isDisposed && !completedRef.current) {
              setError(
                setErrorObj.message ||
                'Impossible de valider les jetons de session Google reçus.'
              );
            }
            return;
          }

          if (setData?.session?.user) {
            await finalizeSessionSuccess(setData.session.user.id);
            return;
          }
        }

        // ======================================================================
        // FLOW C: Direct URL visit without code or tokens
        // ======================================================================
        else {
          // Delay briefly to allow any pending background storage restoration
          await new Promise((resolve) => setTimeout(resolve, 600));
          const { data: finalCheck } = await supabase.auth.getSession();

          if (finalCheck?.session?.user) {
            await finalizeSessionSuccess(finalCheck.session.user.id);
            return;
          }

          if (!isDisposed && !completedRef.current) {
            setError(
              "Aucun code d'autorisation ni session active trouvée. Veuillez relancer la connexion."
            );
          }
          return;
        }
      } catch (err: any) {
        console.error('[OAuth] Exception during OAuth callback processing:', err);
        if (!isDisposed && !completedRef.current) {
          setError(
            err?.message ||
            'Une erreur inattendue est survenue lors de la validation de la session.'
          );
        }
      }
    }

    processOAuthCallback();

    // Absolute safety timeout (6 seconds): guarantees the screen NEVER hangs indefinitely
    const safetyTimeout = setTimeout(async () => {
      if (completedRef.current || isDisposed) return;
      const { data: timeoutCheck } = await supabase.auth.getSession();
      if (timeoutCheck?.session?.user) {
        await finalizeSessionSuccess(timeoutCheck.session.user.id);
      } else if (!completedRef.current) {
        setError(
          "Le délai de validation de la session Google a expiré. Veuillez vérifier votre connexion et réessayer."
        );
      }
    }, 6000);

    return () => {
      isDisposed = true;
      clearTimeout(safetyTimeout);
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Run once on mount

  const handleRetryGoogle = async () => {
    setRetrying(true);
    setError(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
      setRetrying(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 selection:bg-emerald-500/30 selection:text-emerald-200">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
            Échec de connexion Google
          </h3>
          <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
            {error}
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleRetryGoogle}
              disabled={retrying}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {retrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Réessayer avec Google</span>
            </button>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Retour à la page de connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
          Connexion à TRADEIQ...
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Vérification de la session Supabase et synchronisation de votre profil de trading.
        </p>
      </div>
    </div>
  );
};
