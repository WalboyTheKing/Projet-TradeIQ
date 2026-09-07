// ============================================================================
// OAUTH CALLBACK HANDLER — TRADEIQ (/auth/callback)
// Resolves Supabase Google OAuth tokens, validates session, and routes to Dashboard
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AuthCallbackProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onNavigateLogin }) => {
  const { refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleOAuthReturn() {
      try {
        // Parse error from hash or search
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
        if (errorDesc) {
          if (active) setError(decodeURIComponent(errorDesc));
          return;
        }

        // Supabase auto-detects session in URL with detectSessionInUrl: true
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (active) setError(sessionError.message);
          return;
        }

        if (session?.user) {
          // Sync profile
          await refreshProfile();

          // Clear auth hash from URL for a clean state
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          if (active) {
            onSuccess();
          }
        } else {
          // If no immediate session, give it 1 second or listen for change
          const timeout = setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData?.session && active) {
              await refreshProfile();
              onSuccess();
            } else if (active) {
              setError('Impossible de finaliser l’authentification Google. Veuillez réessayer.');
            }
          }, 1000);

          return () => clearTimeout(timeout);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Erreur lors du traitement OAuth.');
      }
    }

    handleOAuthReturn();

    return () => {
      active = false;
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
