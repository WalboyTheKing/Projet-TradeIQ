// ============================================================================
// RESET PASSWORD PAGE — TRADEIQ
// Integrated with Supabase Auth updateUser({ password })
// ============================================================================

import React, { useState } from 'react';
import { BarChart3, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess }) => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const res = await updatePassword(password);

    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090D14] flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-slate-100 font-mono">
              TRADEIQ
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Nouveau mot de passe
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Mot de passe mis à jour !
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant accéder à votre tableau de bord TRADEIQ.
            </p>
            <button
              type="button"
              onClick={onSuccess}
              className="w-full mt-4 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Accéder au Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nouveau mot de passe
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
                  placeholder="Minimum 6 caractères"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirmer le nouveau mot de passe
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
                  placeholder="Confirmez le mot de passe"
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
                  <span>Mise à jour...</span>
                </>
              ) : (
                <span>Définir le nouveau mot de passe</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
