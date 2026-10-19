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
  const [selectedDomain, setSelectedDomain] = useState<'vercel' | 'custom'>('vercel');
  
  const referralCode = userProfile?.id ? userProfile.id.slice(0, 8) : 'WL-TRADER';

  // Compute active production origin safely
  const activeOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://projet-tradeiq.vercel.app';
  const isVercelHost = activeOrigin.includes('vercel.app');
  
  const vercelDomainUrl = isVercelHost ? activeOrigin : 'https://projet-tradeiq.vercel.app';
  const customDomainUrl = 'https://tradeiq.io';

  const currentBaseUrl = selectedDomain === 'vercel' ? vercelDomainUrl : customDomainUrl;
  const referralLink = `${currentBaseUrl}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Rejoins TRADEIQ, la plateforme de journal de trading quantitatif et d'analyse de marché par IA :`;

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`,
      '_blank'
    );
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
          <div className="text-2xl font-bold font-mono text-white mt-1">0</div>
          <div className="text-[10px] text-slate-500 mt-1">Aucun trader pour l'instant</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Taux de Commission</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">30%</div>
          <div className="text-[10px] text-slate-500 mt-1">Palier Standard Partenaire</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Gains Totaux (USDT)</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">0.00 USDT</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Paiement dès 20 USDT</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Clics sur le Lien</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">0</div>
          <div className="text-[10px] text-slate-500 mt-1">En attente de vos premiers partages</div>
        </div>
      </div>

      {/* Link Generator */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Votre Lien de Parrainage Unique</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Partagez ce lien avec vos traders, sur Telegram, YouTube ou Twitter/X. Un cookie de 60 jours attribue automatiquement le trader à votre compte.
            </p>
          </div>

          {/* Domain selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedDomain('vercel')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDomain === 'vercel'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vercel (SSL Validé ✓)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDomain === 'custom'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              tradeiq.io
            </button>
          </div>
        </div>

        {/* Link input + Copy button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 select-all truncate">
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

        {/* Quick Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500 mr-1">Partage rapide :</span>
          
          <button
            type="button"
            onClick={shareTelegram}
            className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Telegram</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={shareTwitter}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>X (Twitter)</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={shareWhatsApp}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>WhatsApp</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* SSL Status Indicator & Cloudflare Guide */}
        {selectedDomain === 'vercel' ? (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-emerald-200">Lien 100% opérationnel :</strong> Ce lien pointe directement sur le domaine Vercel officiel hébergeant TradeIQ avec certificat SSL Let's Encrypt automatique valide. Aucun risque d'erreur 526 pour vos affiliés.
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2.5">
            <span className="text-amber-400 text-base leading-none mt-0.5">⚠️</span>
            <div className="space-y-1.5 leading-relaxed">
              <div>
                <strong className="font-semibold text-amber-200">Attention — Erreur Cloudflare 526 sur tradeiq.io :</strong> Cloudflare n'arrive pas à valider le certificat SSL du serveur d'origine.
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono">
                Solution Cloudflare : Tableau de bord Cloudflare &gt; SSL/TLS &gt; changez le mode de « Full (strict) » vers « Full » (ou utilisez le lien Vercel ci-dessus).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
