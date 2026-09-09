import React, { useState } from 'react';
import {
  Link2,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Server,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Lock,
  Plus
} from 'lucide-react';
import { UserProfile, Trade } from '../../types/trade';

interface ConnectAccountsViewProps {
  userProfile?: UserProfile | null;
  onOpenImport?: () => void;
}

interface BrokerConnector {
  id: string;
  name: string;
  category: 'Forex / CFD' | 'Futures' | 'Crypto';
  status: 'supported' | 'live_sync' | 'coming_soon';
  description: string;
  supportedFormats: string[];
}

const BROKERS: BrokerConnector[] = [
  {
    id: 'mt5',
    name: 'MetaTrader 5 (MT5)',
    category: 'Forex / CFD',
    status: 'supported',
    description: 'Compatible avec tous les brokers et Prop Firms (FTMO, FundedNext, IC Markets, Pepperstone).',
    supportedFormats: ['HTML Report', 'CSV Statement', 'XML History'],
  },
  {
    id: 'mt4',
    name: 'MetaTrader 4 (MT4)',
    category: 'Forex / CFD',
    status: 'supported',
    description: 'La référence historique du trading algorithmique et manuel sur le Forex.',
    supportedFormats: ['Detailed Statement HTML', 'CSV Export'],
  },
  {
    id: 'ctrader',
    name: 'cTrader',
    category: 'Forex / CFD',
    status: 'supported',
    description: 'Plateforme ECN moderne avec exécution milliseconde et export direct CSV.',
    supportedFormats: ['cTrader CSV', 'Performance Statement'],
  },
  {
    id: 'tradovate',
    name: 'Tradovate / NinjaTrader',
    category: 'Futures',
    status: 'supported',
    description: 'Trading sur indices CME Futures (ES, NQ, YM, CL) pour Apex & Topstep.',
    supportedFormats: ['Fill History CSV', 'Tradovate Orders'],
  },
  {
    id: 'binance',
    name: 'Binance / Bybit Futures',
    category: 'Crypto',
    status: 'supported',
    description: 'Contrats perpétuels et Spot crypto avec export d\'historique d\'ordres.',
    supportedFormats: ['Trades Export CSV', 'Order History'],
  },
];

export const ConnectAccountsView: React.FC<ConnectAccountsViewProps> = ({
  userProfile,
  onOpenImport
}) => {
  const [selectedBroker, setSelectedBroker] = useState<string>('mt5');
  const [activeTab, setActiveTab] = useState<'brokers' | 'api_sync'>('brokers');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Link2 className="w-4 h-4" />
            <span>Passerelles de Comptes & Brokers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Connect Accounts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Synchronisez vos comptes réels, vos challenges Prop Firms et vos portefeuilles en toute sécurité.
          </p>
        </div>

        {onOpenImport && (
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Importer un Fichier CSV / Excel</span>
          </button>
        )}
      </div>

      {/* Security Pledge Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start sm:items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-0.5">
          <span className="font-bold text-white">Sécurité Maximale & Lecture Seule : </span>
          TRADEIQ ne demande jamais vos accès de trading actifs ni vos droits de retrait. Seul l'historique d'exécution est importé et anonymisé.
        </div>
      </div>

      {/* Grid of Supported Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {BROKERS.map((broker) => (
          <div
            key={broker.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800">
                  {broker.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prêt à l'import
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-1.5">{broker.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{broker.description}</p>

              <div className="space-y-1.5 mb-5">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Formats supportés :</div>
                <div className="flex flex-wrap gap-1.5">
                  {broker.supportedFormats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenImport}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Déposer le relevé</span>
            </button>
          </div>
        ))}

        {/* Custom Prop Firm Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Prop Firm Sync
              </span>
            </div>

            <h2 className="text-base font-bold text-white mb-1.5">FTMO & FundedNext</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Exportez directement le rapport de votre métrique Prop Firm pour vérifier la conformité avec les règles de perte maximale.
            </p>
          </div>

          <button
            onClick={onOpenImport}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>Importer mon Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
