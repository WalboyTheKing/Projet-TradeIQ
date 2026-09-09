import React, { useState } from 'react';
import {
  Percent,
  Gift,
  Copy,
  CheckCircle2,
  Users,
  Coins,
  ArrowUpRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { UserProfile } from '../../types/trade';

interface AffiliateViewProps {
  userProfile?: UserProfile | null;
}

export const AffiliateView: React.FC<AffiliateViewProps> = ({ userProfile }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = userProfile?.id ? userProfile.id.slice(0, 8) : 'WL-TRADER';
  const referralLink = `https://tradeiq.io/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Percent className="w-4 h-4" />
            <span>Programme d'Affiliation & Partenaires</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Affiliate Program
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gagnez 30% à 40% de commissions récurrentes à vie sur chaque abonnement Pro et Elite recommandé.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-mono text-emerald-300">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Paiements Mensuels en USDT (BSC)</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Traders Référés</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">18</div>
          <div className="text-[10px] text-slate-500 mt-1">12 inscrits actifs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Taux de Commission</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">35%</div>
          <div className="text-[10px] text-slate-500 mt-1">Palier Silver Partenaire</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Gains Totaux (USDT)</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">184.50 USDT</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-1">Paiement automatique le 1er</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Clics sur le Lien</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">342</div>
          <div className="text-[10px] text-slate-500 mt-1">Taux de conversion : 5.2%</div>
        </div>
      </div>

      {/* Link Generator */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Votre Lien de Parrainage Unique</h2>
        <p className="text-xs text-slate-400">
          Partagez ce lien avec vos amis traders, sur votre chaîne YouTube, Telegram, ou Twitter/X. Un cookie de 60 jours attribue automatiquement le trader à votre compte.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 truncate">
            {referralLink}
          </div>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier mon lien</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
