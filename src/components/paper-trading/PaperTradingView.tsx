import React, { useState } from 'react';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface PaperPosition {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  time: string;
}

export const PaperTradingView: React.FC = () => {
  const [balance, setBalance] = useState<number>(100000);
  const [symbol, setSymbol] = useState<string>('EUR/USD');
  const [lots, setLots] = useState<number>(1.0);
  const [positions, setPositions] = useState<PaperPosition[]>([
    {
      id: 'p-1',
      symbol: 'XAU/USD',
      type: 'BUY',
      lots: 2.0,
      openPrice: 2480.50,
      currentPrice: 2492.20,
      pnl: 2340.00,
      time: '14:22 UTC',
    },
    {
      id: 'p-2',
      symbol: 'NAS100',
      type: 'SELL',
      lots: 1.0,
      openPrice: 19850.00,
      currentPrice: 19780.00,
      pnl: 700.00,
      time: '15:05 UTC',
    }
  ]);

  const openPosition = (type: 'BUY' | 'SELL') => {
    const currentPrice = symbol === 'EUR/USD' ? 1.0850 : symbol === 'XAU/USD' ? 2490.00 : 19800.00;
    const newPos: PaperPosition = {
      id: `p-${Date.now()}`,
      symbol,
      type,
      lots,
      openPrice: currentPrice,
      currentPrice,
      pnl: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
    };
    setPositions([newPos, ...positions]);
  };

  const closePosition = (id: string) => {
    const target = positions.find(p => p.id === id);
    if (target) {
      setBalance(prev => prev + target.pnl);
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <WalletCards className="w-4 h-4" />
            <span>Exécution Virtuelle PRO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Paper Trading
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exécutez vos ordres en conditions réelles avec un compte démo institutionnel de 100 000 $.
          </p>
        </div>

        {/* Balance Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 self-start sm:self-auto font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Capitaux Propres</div>
            <div className="text-lg font-bold text-white">${(balance + totalUnrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">P&L Latent</div>
            <div className={`text-lg font-bold ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? `+$${totalUnrealizedPnl.toFixed(2)}` : `-$${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Order Entry */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="text-xs font-bold text-white mb-4 uppercase font-mono tracking-wider">Passation d'Ordre Immédiate</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Symbole</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="EUR/USD">EUR/USD</option>
              <option value="XAU/USD">XAU/USD (Gold)</option>
              <option value="NAS100">NAS100 (Nasdaq)</option>
              <option value="BTC/USDT">BTC/USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Volume (Lots)</label>
            <input
              type="number"
              step="0.1"
              value={lots}
              onChange={(e) => setLots(parseFloat(e.target.value) || 0.1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <button
              onClick={() => openPosition('BUY')}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              <span>ACHAT (BUY)</span>
            </button>

            <button
              onClick={() => openPosition('SELL')}
              className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <TrendingDown className="w-4 h-4" />
              <span>VENTE (SELL)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Positions Ouvertes ({positions.length})</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                <th className="p-3">Symbole</th>
                <th className="p-3">Type</th>
                <th className="p-3">Volume</th>
                <th className="p-3">Prix d'Entrée</th>
                <th className="p-3">Prix Actuel</th>
                <th className="p-3">P&L Latent</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    Aucune position ouverte. Passez un ordre ci-dessus.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold text-white">{pos.symbol}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{pos.lots} lots</td>
                    <td className="p-3 text-slate-400">${pos.openPrice.toFixed(2)}</td>
                    <td className="p-3 text-slate-200">${pos.currentPrice.toFixed(2)}</td>
                    <td className={`p-3 font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Clôturer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
