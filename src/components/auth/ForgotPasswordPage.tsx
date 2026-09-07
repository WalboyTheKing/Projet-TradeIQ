// ============================================================================
// FORGOT PASSWORD PAGE — TRADEIQ
// Integrated with Supabase Auth resetPasswordForEmail
// ============================================================================

import React, { useState } from 'react';
import { BarChart3, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateHome?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await resetPasswordForEmail(email);

    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccessSent(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-6">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-2.5 cursor-pointer mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-slate-100 font-mono">
              TRADEIQ
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Récupération de mot de passe
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Instructions envoyées
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si un compte existe pour l'adresse <strong className="text-slate-200">{email}</strong>,
              vous recevrez un email contenant le lien sécurisé pour définir un nouveau mot de passe.
            </p>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full mt-4 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Saisissez l'adresse email associée à votre compte TRADEIQ. Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
            </p>

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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Envoyer le lien de réinitialisation</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la connexion</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
