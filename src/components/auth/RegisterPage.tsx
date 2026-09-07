// ============================================================================
// REGISTER PAGE — TRADEIQ
// Professional registration flow with Supabase Auth, email verification handling & Google OAuth
// ============================================================================

import React, { useState } from 'react';
import { BarChart3, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onSuccess,
  onNavigateHome,
}) => {
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Veuillez renseigner tous les champs.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const res = await signUpWithEmail(email, password, name);

    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else if (res.needsEmailVerification) {
      setLoading(false);
      setVerificationRequired(true);
    } else {
      setLoading(false);
      if (onSuccess) onSuccess();
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrorMessage(res.error);
      setGoogleLoading(false);
    }
  };

  if (verificationRequired) {
    return (
      <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 py-8 relative">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Vérifiez votre boîte de réception
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Un email de confirmation a été envoyé à <strong className="text-slate-200">{email}</strong>.
            Veuillez cliquer sur le lien qu'il contient pour activer votre compte TRADEIQ et commencer à journaliser.
          </p>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-slate-100 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-2.5 cursor-pointer mb-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-slate-100 font-mono">
              TRADEIQ
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Créer un compte de trading quantitatif
          </p>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="flex items-center my-4 gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            OU
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nom complet ou pseudonyme
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexandre Trader"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full pl-10 pr-10 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer ml-1"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
