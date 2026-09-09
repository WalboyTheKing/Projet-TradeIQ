import React, { useState } from 'react';
import {
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Share2,
  CheckCircle2,
  Send,
  Shield,
  Star
} from 'lucide-react';
import { UserProfile } from '../../types/trade';

interface CreatorViewProps {
  userProfile?: UserProfile | null;
}

export const CreatorView: React.FC<CreatorViewProps> = ({ userProfile }) => {
  const [submitted, setSubmitted] = useState(false);
  const [handle, setHandle] = useState('');
  const [specialty, setSpecialty] = useState('Forex & SMC');
  const [experienceYears, setExperienceYears] = useState('3-5 ans');
  const [pitch, setPitch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Programme Créateur & Mentorat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Become a Creator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Partagez vos stratégies vérifiées, vos revues de trades et monétisez votre savoir-faire auprès de la communauté TRADEIQ.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs font-mono text-purple-300">
          <Star className="w-4 h-4 text-purple-400" />
          <span>70% Partage de Revenus</span>
        </div>
      </div>

      {/* Grid: Creator Benefits + Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Perks */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white">Pourquoi devenir Créateur TRADEIQ ?</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Badge Créateur Vérifié</div>
                  <p className="text-slate-400 leading-relaxed mt-0.5">
                    Affichage certifié de votre historique de trades et de votre taux de réussite vérifié sur la blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Monétisation de vos Playbooks</div>
                  <p className="text-slate-400 leading-relaxed mt-0.5">
                    Proposez vos règles de trading et analyses chartistes à vos abonnés avec un partage de 70% des revenus payés en USDT.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Audience Internationale Ciblée</div>
                  <p className="text-slate-400 leading-relaxed mt-0.5">
                    Mettez en avant vos revues de marché auprès de milliers de traders sérieux recherchant la discipline et la rentabilité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Application */}
        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4">Postuler au Programme Créateur</h2>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="font-bold text-base">Candidature reçue avec succès !</div>
                <p className="text-xs text-slate-300">
                  Notre équipe de sélection examinera vos statistiques et vous répondra par email sous 48h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Pseudo / Nom Public de Créateur</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Ex: @SMC_Master_Fx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1.5">Spécialité</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Forex & SMC">Forex & SMC</option>
                      <option value="Futures & Indices">Futures & Indices</option>
                      <option value="Crypto Swing">Crypto Swing</option>
                      <option value="Scalping">Scalping M1/M5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1.5">Expérience</label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1-2 ans">1 - 2 ans</option>
                      <option value="3-5 ans">3 - 5 ans</option>
                      <option value="+5 ans">+ 5 ans</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Lien Track Record ou Profil (TradingView, Myfxbook, X/Twitter)</label>
                  <input
                    type="text"
                    placeholder="https://myfxbook.com/members/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Pourquoi souhaitez-vous créer sur TRADEIQ ?</label>
                  <textarea
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Parlez-nous de votre style de trading et de la valeur que vous apporterez..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer ma candidature Créateur</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
