import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Calendar, 
  ArrowRight, 
  Check, 
  Zap, 
  Terminal, 
  ChevronRight,
  Shield,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface LandingPageProps {
  onStartFree: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartFree, onLogin }) => {
  const features = [
    {
      title: 'Trade Journal',
      desc: 'Log trades with rich context: entry, exit, stop loss, R-multiple, session, timeframe, psychology emotions, and chart screenshots.',
      icon: Layers,
      highlight: 'Full Context Logging',
    },
    {
      title: 'Advanced Analytics',
      desc: 'Centralized mathematical formulas calculating Win Rate, Profit Factor, Expectancy, Max Drawdown, and statistical edge distributions.',
      icon: BarChart3,
      highlight: 'Rigorous Quant Formulas',
    },
    {
      title: 'Performance Tracking',
      desc: 'Interactive equity curves, daily/monthly P&L heatmaps, and long vs short side-by-side performance comparisons.',
      icon: TrendingUp,
      highlight: 'Equity & Drawdowns',
    },
    {
      title: 'AI Trade Review',
      desc: 'Objective historical trade auditing. Identify emotional biases, session leaks, and setup adherence without unrealistic profit promises.',
      icon: Sparkles,
      highlight: 'Auditing & Feedback',
    },
    {
      title: 'Risk Analysis',
      desc: 'Track risk per trade, average exposure, risk consistency score, and trigger statistical deviation alerts when position sizes drift.',
      icon: ShieldCheck,
      highlight: 'Capital Preservation',
    },
    {
      title: 'Audit-Ready Reports',
      desc: 'Generate executive summaries, export CSV, Excel and print-ready PDF reports for tax, prop firm verification, and mentor audits.',
      icon: FileText,
      highlight: 'CSV, Excel & PDF',
    },
  ];

  const faqs = [
    {
      q: 'Does TRADEIQ execute trades automatically or connect to brokers for trading?',
      a: 'No. Version 1 of TRADEIQ is strictly an analytics and trading journal platform. It does not execute trades or promise profits. You import your historical executions via CSV or log them manually to audit your process.',
    },
    {
      q: 'How does the AI Trade Review work?',
      a: 'Our AI model analyzes your past trade records (timing, stop loss adherence, emotions, session, and strategy). It identifies recurring operational weaknesses and risk drift. It will never provide trading signals or financial advice.',
    },
    {
      q: 'Can I test the platform with realistic data before importing my trades?',
      a: 'Yes! Once registered, TRADEIQ provides a sample institutional dataset so you can explore all quant dashboards, or switch immediately to clean live data with your own broker history.',
    },
    {
      q: 'Can I export my data or import from MetaTrader, TradingView, or proprietary brokers?',
      a: 'Yes. Our universal CSV/Excel importer provides dynamic column mapping allowing you to import trade histories from any broker or platform in seconds.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#090D14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              TIQ
            </div>
            <span className="font-extrabold tracking-wider text-lg font-mono text-slate-100">
              {APP_CONFIG.name}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Connexion
            </button>
            <button
              onClick={onStartFree}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all cursor-pointer"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            V1.0 LIVE • PROFESSIONAL QUANTITATIVE ANALYTICS
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Understand Your Trading. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Improve Your Process.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A professional trading analytics platform that turns your trading history into clear, actionable statistics. Stop guessing your edge—measure it with institutional precision.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-7 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-[0_0_25px_rgba(52,211,153,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Se connecter</span>
            </button>
          </div>

          <div className="mt-8 text-xs text-slate-400 font-mono">
            Supabase Auth sécurisé • Données 100% privées & chiffrées
          </div>

          {/* Hero Terminal Snapshot Graphic */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-[#0F172A]/80 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 px-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-400">tradeiq-terminal — 64.8% WIN RATE • 2.31 PROFIT FACTOR</span>
              </div>
              <span className="hidden sm:inline text-emerald-400">LIVE ENGINE READY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left p-2">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Win Rate</div>
                <div className="text-xl font-bold font-mono text-emerald-400">64.8%</div>
                <div className="text-[10px] text-emerald-500">+4.2% vs prev</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Net P&L</div>
                <div className="text-xl font-bold font-mono text-emerald-400">+$14,850.00</div>
                <div className="text-[10px] text-slate-400">45 Trades logged</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Profit Factor</div>
                <div className="text-xl font-bold font-mono text-slate-100">2.31</div>
                <div className="text-[10px] text-emerald-500">Institutional Grade</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Max Drawdown</div>
                <div className="text-xl font-bold font-mono text-rose-400">-3.8%</div>
                <div className="text-[10px] text-slate-400">Within 5% threshold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Complete Feature Suite
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-100 tracking-tight">
              Designed for serious traders who value execution clarity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800/80 bg-[#0F172A]/50 p-6 hover:border-slate-700/80 hover:bg-[#0F172A]/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 font-semibold mb-1">
                      {f.highlight}
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-slate-800/60 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Transparent Pricing
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-100 tracking-tight">
              Choose the tier that matches your trading volume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Free</h3>
                <p className="text-xs text-slate-400 mt-1">For beginners exploring trading journals.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-100">$0</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  {APP_CONFIG.plans.free.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-8 w-full py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-emerald-500/80 bg-[#0F172A] p-6 relative shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Pro</h3>
                <p className="text-xs text-slate-400 mt-1">For active traders refining their edge.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">$4</span>
                  <span className="text-xs text-slate-400">/month ($40/yr)</span>
                </div>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Payable with USDT (BSC)</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  {APP_CONFIG.plans.pro.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-8 w-full py-2.5 text-xs font-bold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md transition-colors"
              >
                Get Started with Pro
              </button>
            </div>

            {/* Premium */}
            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Premium</h3>
                <p className="text-xs text-slate-400 mt-1">For prop firm traders & professional desks.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-100">$9</span>
                  <span className="text-xs text-slate-400">/month ($90/yr)</span>
                </div>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Payable with USDT (BSC)</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  {APP_CONFIG.plans.premium.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-8 w-full py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
              >
                Choose Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              FAQ
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-100 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border border-slate-800/90 bg-[#0F172A]/60">
                <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#06080E] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              TIQ
            </div>
            <span className="font-bold text-slate-200 font-mono">{APP_CONFIG.name}</span>
            <span className="text-slate-400">© 2026. All rights reserved.</span>
          </div>

          <p className="text-center md:text-right max-w-xl text-[11px] text-slate-400 leading-normal">
            {APP_CONFIG.aiDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
};
