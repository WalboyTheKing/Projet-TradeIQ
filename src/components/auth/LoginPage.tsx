// ============================================================================
// LOGIN PAGE — TRADEIQ
// Modern, premium authentication view integrated with Supabase Auth & Google OAuth
// ============================================================================

import React, { useState } from 'react';
import { BarChart3, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSuccess,
  onNavigateHome,
}) => {
  const { signInWithEmail, signInWithGoogle, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await signInWithEmail(email, password);

    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      if (onSuccess) onSuccess();
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrorMessage(res.error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-2.5 cursor-pointer mb-3 group"
            title="Retour à l'accueil"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-slate-100 font-mono">
              TRADEIQ
            </h1>
          </div>
          <p className="text-xs text-slate-400 tracking-wide font-medium">
            Trading Intelligence Platform
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Configuration notice if running in local sandbox without Supabase keys */}
        {!isConfigured && (
          <div className="mb-5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Mode Sandbox : vous pouvez vous connecter avec n'importe quel email.</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.7 0 3 .7 3.7 1.4l2.8-2.8C16.8 1.9 14.6 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.2.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
              />
            </svg>
          )}
          <span>Continuer avec Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5 gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            OU
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Vous n'avez pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer ml-1"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
