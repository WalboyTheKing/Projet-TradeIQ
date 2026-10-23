import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Check, 
  Layers,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface LandingPageProps {
  onStartFree: () => void;
  onLogin: () => void;
  onExploreDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartFree, onLogin, onExploreDemo }) => {
  const features = [
    {
      title: 'Trade Journal',
      desc: 'Journalisez chaque position avec contexte complet : entrées, sorties, stop-loss, R-multiple, session, émotion et captures graphiques.',
      icon: Layers,
      highlight: 'Journal Détaillé',
    },
    {
      title: 'Analytics Quantitatifs',
      desc: 'Formules mathématiques certifiées : Win Rate, Profit Factor, Expectancy, Max Drawdown et distribution statistique de votre avantage.',
      icon: BarChart3,
      highlight: 'Formules Rigoureuses',
    },
    {
      title: 'Suivi de Performance',
      desc: 'Courbes de capital interactives, cartes thermiques de P&L journalier/mensuel et comparaisons directes positions Long vs Short.',
      icon: TrendingUp,
      highlight: 'Courbes & Drawdown',
    },
    {
      title: 'Revue de Trade IA',
      desc: 'Audit objectif de vos positions passées. Détection des dérives émotionnelles, fuites par session et respect des configurations.',
      icon: Sparkles,
      highlight: 'Audit & Feedback',
    },
    {
      title: 'Analyse du Risque',
      desc: 'Mesure du risque par trade, exposition moyenne, score de constance du risque et alertes statistiques en cas de déviation.',
      icon: ShieldCheck,
      highlight: 'Protection du Capital',
    },
    {
      title: 'Rapports Prêts pour Audit',
      desc: 'Synthèses exécutives, export CSV, Excel et rapports PDF imprimables pour déclarations fiscales, prop firms ou mentorat.',
      icon: FileText,
      highlight: 'CSV, Excel & PDF',
    },
  ];

  const faqs = [
    {
      q: 'TRADEIQ exécute-t-il des ordres automatiquement ou promet-il des gains ?',
      a: 'Non. TRADEIQ est exclusivement une plateforme analytique et un journal quantitatif. Il n\'exécute aucun trade et ne formule aucune promesse financière. Vous importez vos historiques ou enregistrez vos trades pour auditer votre discipline avec précision.',
    },
    {
      q: 'Comment fonctionne la revue de trades assistée par IA ?',
      a: 'L\'algorithme analyse vos données passées (timing, respect du stop loss, émotions, session et stratégie). Il met en évidence vos faiblesses opérationnelles récurrentes sans jamais émettre de signaux d\'investissement.',
    },
    {
      q: 'Puis-je tester la plateforme avant d\'importer mes trades personnels ?',
      a: 'Oui ! Vous pouvez explorer instantanément l\'application avec le Mode Démo pour manipuler tous les graphiques institutionnels avant de créer votre compte.',
    },
    {
      q: 'Puis-je installer l\'application sur mon téléphone Android ou mon iPhone ?',
      a: 'Absolument ! TRADEIQ est une Progressive Web App (PWA) certifiée. Vous pouvez l\'ajouter directement sur l\'écran d\'accueil de votre iPhone, iPad ou Android pour profiter d\'une application plein écran rapide et fluide.',
    },
    {
      q: 'Puis-je importer mes trades depuis MetaTrader, TradingView ou d\'autres courtiers ?',
      a: 'Oui. Le module d\'import universel CSV / Excel permet de mapper dynamiquement les colonnes de n\'importe quel courtier en quelques secondes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden w-full max-w-full">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#090D14]/90 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs sm:text-sm shadow-sm">
              TIQ
            </div>
            <span className="font-extrabold tracking-wider text-base sm:text-lg font-mono text-slate-100">
              {APP_CONFIG.name}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-slate-200 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Header install button only visible on sm+ to prevent header crowding on small mobile */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>
            <button
              onClick={onLogin}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Connexion
            </button>
            <button
              onClick={onStartFree}
              className="px-3 sm:px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 lg:pt-24 pb-12 sm:pb-20 overflow-hidden border-b border-slate-800/60 w-full">
        {/* Ambient radial glow & technical grid strictly contained to avoid horizontal scroll */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[260px] sm:h-[400px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs font-mono text-emerald-400 mb-5 sm:mb-6 max-w-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">V1.0 LIVE • QUANTITATIVE ANALYTICS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight max-w-4xl mx-auto leading-[1.18] sm:leading-tight">
            Comprenez Vos Trades. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Perfectionnez Votre Process.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-1 sm:px-0">
            Plateforme professionnelle d'analyse quantitative et de journal de trading. Transformez votre historique en statistiques rigoureuses et éliminez les biais émotionnels.
          </p>

          {/* CTA Actions: Clean, structured & mobile-optimized */}
          <div className="mt-6 sm:mt-8 max-w-md mx-auto flex flex-col items-center gap-3">
            {/* Primary Action Button */}
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto min-w-[240px] px-7 py-3.5 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-[0_0_25px_rgba(52,211,153,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Action Row */}
            <div className="w-full flex items-center justify-center gap-2.5">
              <button
                onClick={onLogin}
                className="flex-1 sm:flex-none sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Se connecter</span>
              </button>

              {onExploreDemo && (
                <button
                  onClick={onExploreDemo}
                  className="flex-1 sm:flex-none sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Démo</span>
                </button>
              )}
            </div>

            {/* PWA Mobile install prompt: Prominently featured on mobile, perfectly integrated */}
            <div className="w-full sm:w-auto pt-1">
              <PWAInstallButton
                variant="landing"
                className="w-full sm:w-auto justify-center"
              />
            </div>
          </div>

          <div className="mt-6 text-[11px] sm:text-xs text-slate-500 font-mono">
            Supabase Auth • Données 100% privées & chiffrées • Compatible PWA Mobile
          </div>

          {/* Hero Terminal Snapshot Graphic */}
          <div className="mt-8 sm:mt-12 max-w-5xl mx-auto rounded-xl sm:rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-2 sm:p-3 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5 px-2 text-[11px] sm:text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
                <span className="ml-1 sm:ml-2 text-slate-400 truncate">tradeiq-terminal — 64.8% WIN RATE • 2.31 PF</span>
              </div>
              <span className="hidden sm:inline text-emerald-400 text-[11px] shrink-0 font-semibold font-mono">LIVE ENGINE READY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left p-1 sm:p-2">
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/90 border border-slate-800/90">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Win Rate</div>
                <div className="text-base sm:text-xl font-bold font-mono text-emerald-400 truncate">64.8%</div>
                <div className="text-[9px] sm:text-[10px] text-emerald-500 font-mono truncate">+4.2% vs prev</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/90 border border-slate-800/90">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Net P&L</div>
                <div className="text-base sm:text-xl font-bold font-mono text-emerald-400 truncate">+$14,850.00</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">45 Trades logged</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/90 border border-slate-800/90">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Profit Factor</div>
                <div className="text-base sm:text-xl font-bold font-mono text-slate-100 truncate">2.31</div>
                <div className="text-[9px] sm:text-[10px] text-emerald-500 font-mono truncate">Institutional Grade</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/90 border border-slate-800/90">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Max Drawdown</div>
                <div className="text-base sm:text-xl font-bold font-mono text-rose-400 truncate">-3.8%</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">&lt; 5% Threshold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-12 sm:py-20 border-b border-slate-800/60 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Suite Fonctionnelle Complète
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Conçu pour les traders exigeants qui valorisent la rigueur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800/80 bg-[#0F172A]/50 p-4 sm:p-6 hover:border-slate-700/80 hover:bg-[#0F172A]/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5 sm:mb-4">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-semibold mb-1">
                      {f.highlight}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1.5 sm:mb-2">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 border-b border-slate-800/60 bg-slate-900/20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Tarifs Clairs & Sans Engagement
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Choisissez la formule adaptée à votre volume de trading
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">Free</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Gratuit
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Découverte et premiers trades</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-100">$0</span>
                  <span className="text-xs text-slate-400">/mois</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  {APP_CONFIG.plans.free.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 sm:mt-8 w-full py-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer active:scale-98"
              >
                Démarrer Gratuitement
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-emerald-500/80 bg-[#0F172A] p-5 sm:p-6 relative shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                Recommandé
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">Pro</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Populaire
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Traders actifs & réguliers</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">$5</span>
                  <span className="text-xs text-slate-400">/mois ($50/an)</span>
                </div>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Payable en USDT (BSC / Crypto)</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-200">
                  {APP_CONFIG.plans.pro.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 sm:mt-8 w-full py-2.5 text-xs font-bold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md transition-colors cursor-pointer active:scale-98"
              >
                Passer en Pro
              </button>
            </div>

            {/* Premium */}
            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">Premium</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Elite Trader
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Usage institutionnel & prop firm</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-100">$12</span>
                  <span className="text-xs text-slate-400">/mois ($120/an)</span>
                </div>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Payable en USDT (BSC / Crypto)</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  {APP_CONFIG.plans.premium.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 sm:mt-8 w-full py-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer active:scale-98"
              >
                Choisir Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-20 border-b border-slate-800/60 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              FAQ
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Questions Fréquentes
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-xl border border-slate-800/90 bg-[#0F172A]/60">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 mb-1.5 sm:mb-2 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 pb-14 sm:pb-12 bg-[#06080E] text-slate-400 text-xs w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              TIQ
            </div>
            <span className="font-bold text-slate-200 font-mono">{APP_CONFIG.name}</span>
            <span className="text-slate-500">© 2026. Tous droits réservés.</span>
          </div>

          <p className="text-center md:text-right max-w-xl text-[11px] text-slate-500 leading-normal">
            {APP_CONFIG.aiDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
};
