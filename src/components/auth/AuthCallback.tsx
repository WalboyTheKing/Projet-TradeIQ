// ============================================================================
// OAUTH CALLBACK HANDLER — TRADEIQ (/auth/callback)
// Resolves Supabase Google OAuth: supports both PKCE (?code=) and Implicit (#access_token=)
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../lib/storage';

interface AuthCallbackProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onNavigateLogin }) => {
  const { refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    let active = true;

    // Traitement unifié de la session valide
    const handleAuthSuccess = async (userId: string) => {
      if (completedRef.current || !active) return;
      completedRef.current = true;

      // 1. Nettoyage immédiat de l'URL pour ne laisser aucun fragment ni paramètre sensible
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 2. Désactivation stricte du mode Démo
      storageService.setDemoMode(false);

      // 3. Synchronisation du profil public.users avec le véritable UUID
      try {
        await refreshProfile();
      } catch (profileErr) {
        console.warn('[OAuth] Warning profile sync:', profileErr);
      }

      // 4. Redirection vers l'application en mode authentifié
      if (active) {
        onSuccess();
      }
    };

    // Écouteur Supabase pour capter les sessions résolues automatiquement en arrière-plan
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newSession?.user && !completedRef.current) {
        await handleAuthSuccess(newSession.user.id);
      }
    });

    async function processOAuthCallback() {
      try {
        const rawHash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(rawHash);
        const searchParams = new URLSearchParams(window.location.search);

        // Détection d'erreurs éventuelles renvoyées par le fournisseur OAuth
        const errorDesc =
          hashParams.get('error_description') ||
          searchParams.get('error_description') ||
          hashParams.get('error') ||
          searchParams.get('error');

        if (errorDesc) {
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          if (active && !completedRef.current) {
            setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          }
          return;
        }

        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // ======================================================================
        // FLUX B : Implicit Grant / Hash (#access_token=...&refresh_token=...)
        // ======================================================================
        if (accessToken && refreshToken) {
          // Nettoyage immédiat de l'URL pour éliminer les jetons de la barre d'adresse et de l'historique
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // supabase.auth.setSession enregistre les jetons et gère la persistance de manière sécurisée
          const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error('[OAuth] setSession error');
            if (active && !completedRef.current) {
              setError(setSessionError.message || 'Impossible de valider la session OAuth avec les jetons reçus.');
            }
            return;
          }

          if (setSessionData?.session?.user) {
            await handleAuthSuccess(setSessionData.session.user.id);
            return;
          }
        }

        // ======================================================================
        // FLUX A : PKCE flow (?code=...)
        // ======================================================================
        else if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          // Nettoyage de l'URL
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          if (exchangeError) {
            // Si le code a déjà été consommé en arrière-plan, vérifions si la session est active
            const { data: existingSession } = await supabase.auth.getSession();
            if (existingSession?.session?.user) {
              await handleAuthSuccess(existingSession.session.user.id);
              return;
            }

            console.error('[OAuth] exchangeCodeForSession error');
            if (active && !completedRef.current) {
              setError(exchangeError.message || 'Impossible d’échanger le code d’autorisation Google.');
            }
            return;
          }

          if (exchangeData?.session?.user) {
            await handleAuthSuccess(exchangeData.session.user.id);
            return;
          }
        }

        // ======================================================================
        // Vérification de session résiduelle / auto-détectée
        // ======================================================================
        const { data: checkData } = await supabase.auth.getSession();
        if (checkData?.session?.user) {
          await handleAuthSuccess(checkData.session.user.id);
          return;
        }

        // Court délai d'attente pour laisser à GoTrueClient le temps de finaliser
        const timeout = setTimeout(async () => {
          if (completedRef.current || !active) return;
          const { data: retryData, error: retryError } = await supabase.auth.getSession();

          if (retryData?.session?.user) {
            await handleAuthSuccess(retryData.session.user.id);
          } else if (active && !completedRef.current) {
            setError(
              retryError?.message ||
              'Impossible de finaliser l’authentification Google : aucune session valide n’a été trouvée.'
            );
          }
        }, 1000);

        return () => clearTimeout(timeout);
      } catch (err: any) {
        console.error('[OAuth] Exception during callback processing');
        if (active && !completedRef.current) {
          setError(err?.message || 'Une erreur est survenue lors du traitement de l’authentification.');
        }
      }
    }

    processOAuthCallback();

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [onSuccess, refreshProfile]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Erreur d'authentification Google
          </h3>
          <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-100">
          Connexion à TRADEIQ...
        </h3>
        <p className="text-xs text-slate-400">
          Vérification de la session Supabase et synchronisation de votre profil de trading.
        </p>
      </div>
    </div>
  );
};
