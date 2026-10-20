import React from 'react';

interface VisualProps {
  id: string;
  className?: string;
}

export const LearningVisual: React.FC<VisualProps> = ({ id, className = '' }) => {
  switch (id) {
    // ------------------------------------------------------------------------
    // COVERS FOR MODULE CARDS
    // ------------------------------------------------------------------------
    case 'smc_cover':
      return (
        <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-900" />
          <svg viewBox="0 0 400 160" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="bullCandle" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="bearCandle" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <path d="M 0 40 L 400 40 M 0 80 L 400 80 M 0 120 L 400 120" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 80 0 L 80 160 M 160 0 L 160 160 M 240 0 L 240 160 M 320 0 L 320 160" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

            {/* FVG Highlight Zone */}
            <rect x="140" y="55" width="130" height="35" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" rx="3" />
            <text x="146" y="70" fill="#34D399" fontSize="9" fontFamily="monospace" fontWeight="bold">FAIR VALUE GAP (FVG)</text>

            {/* Candlesticks */}
            {/* C1 Bearish */}
            <line x1="60" y1="30" x2="60" y2="110" stroke="#EF4444" strokeWidth="1.5" />
            <rect x="52" y="45" width="16" height="50" fill="url(#bearCandle)" rx="1.5" />

            {/* C2 Strong Bullish (displacement) */}
            <line x1="120" y1="20" x2="120" y2="135" stroke="#10B981" strokeWidth="1.5" />
            <rect x="112" y="35" width="16" height="85" fill="url(#bullCandle)" rx="1.5" />

            {/* C3 Continuation Bullish */}
            <line x1="180" y1="15" x2="180" y2="95" stroke="#10B981" strokeWidth="1.5" />
            <rect x="172" y="25" width="16" height="50" fill="url(#bullCandle)" rx="1.5" />

            {/* C4 Re-test in FVG */}
            <line x1="240" y1="45" x2="240" y2="115" stroke="#EF4444" strokeWidth="1.5" />
            <rect x="232" y="55" width="16" height="35" fill="url(#bearCandle)" rx="1.5" />

            {/* BOS Line */}
            <line x1="120" y1="20" x2="350" y2="20" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="280" y="10" width="60" height="18" fill="#064E3B" rx="3" />
            <text x="286" y="23" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold">BOS CONFIRMÉ</text>

            {/* C5 Expansion */}
            <line x1="300" y1="5" x2="300" y2="75" stroke="#10B981" strokeWidth="1.5" />
            <rect x="292" y="10" width="16" height="50" fill="url(#bullCandle)" rx="1.5" />
          </svg>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SMC & LIQUIDITÉ
            </span>
          </div>
        </div>
      );

    case 'prop_cover':
      return (
        <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-slate-950 to-slate-900" />
          <svg viewBox="0 0 400 160" className="w-full h-full object-cover">
            {/* Grid */}
            <path d="M 0 30 L 400 30 M 0 80 L 400 80 M 0 130 L 400 130" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

            {/* Profit Target Line */}
            <line x1="0" y1="35" x2="400" y2="35" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="15" y="28" fill="#60A5FA" fontSize="10" fontFamily="monospace" fontWeight="bold">OBJECTIF +8,000 $ (PHASE 1)</text>

            {/* Initial Capital Line */}
            <line x1="0" y1="80" x2="400" y2="80" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
            <text x="15" y="75" fill="#94A3B8" fontSize="9" fontFamily="monospace">CAPITAL DÉPART 100,000 $</text>

            {/* Max Daily DD Limit */}
            <line x1="0" y1="130" x2="400" y2="130" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="15" y="145" fill="#F87171" fontSize="10" fontFamily="monospace" fontWeight="bold">MAX DAILY DRAWDOWN : 95,000 $ (-5%)</text>

            {/* Equity Curve */}
            <path
              d="M 20 80 Q 70 85 110 75 T 180 70 T 230 55 T 280 62 T 330 42 T 380 32"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />
            {/* Shaded buffer under curve */}
            <path
              d="M 20 80 Q 70 85 110 75 T 180 70 T 230 55 T 280 62 T 330 42 T 380 32 L 380 130 L 20 130 Z"
              fill="#38BDF8"
              fillOpacity="0.06"
            />

            {/* Target Passed Badge */}
            <circle cx="380" cy="32" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <rect x="290" y="4" width="95" height="18" fill="#1E3A8A" rx="4" />
            <text x="297" y="16" fill="#93C5FD" fontSize="9" fontFamily="monospace" fontWeight="bold">PHASE VALIDÉE ✓</text>
          </svg>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              PROP FIRMS SURVIVAL
            </span>
          </div>
        </div>
      );

    case 'psy_cover':
      return (
        <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-slate-950 to-slate-900" />
          <svg viewBox="0 0 400 160" className="w-full h-full object-cover">
            {/* Emotional cycle loop representation */}
            <defs>
              <linearGradient id="psyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            {/* Curve */}
            <path
              d="M 30 110 C 80 40, 140 20, 190 70 C 240 120, 290 140, 360 85"
              fill="none"
              stroke="url(#psyGrad)"
              strokeWidth="3"
            />

            {/* Key Nodes */}
            <circle cx="130" cy="30" r="5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
            <rect x="85" y="12" width="90" height="16" fill="#451A03" rx="3" />
            <text x="92" y="24" fill="#FCD34D" fontSize="8" fontFamily="monospace" fontWeight="bold">EUPHORIE / FOMO</text>

            <circle cx="280" cy="130" r="5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.5" />
            <rect x="230" y="138" width="100" height="16" fill="#450A0A" rx="3" />
            <text x="237" y="150" fill="#FCA5A5" fontSize="8" fontFamily="monospace" fontWeight="bold">REVENGE TRADING</text>

            {/* Discipline Shield Box */}
            <rect x="280" y="45" width="105" height="24" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1" rx="4" />
            <text x="288" y="61" fill="#C7D2FE" fontSize="9" fontFamily="monospace" fontWeight="bold">CIRCUIT COUPE-FEU</text>
          </svg>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              DISCIPLINE & AUDIT
            </span>
          </div>
        </div>
      );

    case 'risk_cover':
      return (
        <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900" />
          <svg viewBox="0 0 400 160" className="w-full h-full object-cover">
            {/* Grid */}
            <path d="M 0 40 L 400 40 M 0 80 L 400 80 M 0 120 L 400 120" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

            {/* Asymmetry formula */}
            <rect x="40" y="20" width="320" height="40" fill="#1C1917" stroke="#F59E0B" strokeWidth="1" rx="6" />
            <text x="60" y="45" fill="#FDE68A" fontSize="13" fontFamily="monospace" fontWeight="bold">
              E = (Win% × Avg Win) - (Loss% × Avg Loss)
            </text>

            {/* Bar charts comparing 40% vs 80% */}
            {/* Model A: 40% Win with 2.5R */}
            <rect x="70" y="75" width="45" height="65" fill="#10B981" rx="3" />
            <text x="73" y="105" fill="#ECFDF5" fontSize="10" fontFamily="monospace" fontWeight="bold">+2.5R</text>
            <text x="65" y="152" fill="#6EE7B7" fontSize="9" fontFamily="monospace">40% Win (E = +40$)</text>

            {/* Model B: 85% Win with -10R disaster loss */}
            <rect x="260" y="75" width="30" height="25" fill="#10B981" rx="2" />
            <rect x="295" y="75" width="30" height="65" fill="#EF4444" rx="2" />
            <text x="250" y="152" fill="#FCA5A5" fontSize="9" fontFamily="monospace">85% Win (E = -32.50$)</text>
          </svg>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ESPÉRANCE MATHÉMATIQUE
            </span>
          </div>
        </div>
      );

    // ------------------------------------------------------------------------
    // LESSON DIAGRAMS
    // ------------------------------------------------------------------------
    case 'smc_structure_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-emerald-400 mb-2 flex items-center justify-between">
            <span>FIGURE 1.1 : STRUCTURE DE MARCHÉ (BOS vs CHoCH & FVG)</span>
            <span className="text-[10px] text-slate-500">MÉTHODOLOGIE QUANTITATIVE SMC</span>
          </div>
          <svg viewBox="0 0 600 240" className="w-full h-auto bg-slate-900/60 rounded-lg">
            {/* Background grid */}
            <line x1="0" y1="60" x2="600" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#1E293B" strokeDasharray="3 3" />

            {/* FVG Zone */}
            <rect x="240" y="80" width="160" height="50" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" rx="4" />
            <text x="250" y="105" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold">FAIR VALUE GAP (FVG)</text>
            <text x="250" y="122" fill="#A7F3D0" fontSize="9" fontFamily="sans-serif">Déséquilibre non-recouvert entre C1 et C3</text>

            {/* Swing Line */}
            <path d="M 40 180 L 120 70 L 180 130 L 290 40 L 350 100 L 460 30 L 520 160" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* BOS 1 */}
            <line x1="120" y1="70" x2="300" y2="70" stroke="#10B981" strokeWidth="1.5" />
            <rect x="200" y="58" width="80" height="18" fill="#064E3B" rx="3" />
            <text x="208" y="71" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">BOS (Continuation)</text>

            {/* Higher High & Higher Low annotations */}
            <text x="110" y="60" fill="#94A3B8" fontSize="10" fontFamily="monospace">Swing High</text>
            <text x="165" y="148" fill="#94A3B8" fontSize="10" fontFamily="monospace">Higher Low (HL)</text>

            {/* CHoCH at the end */}
            <line x1="350" y1="100" x2="560" y2="100" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="440" y="88" width="95" height="18" fill="#7F1D1D" rx="3" />
            <text x="446" y="101" fill="#FCA5A5" fontSize="10" fontFamily="monospace" fontWeight="bold">CHoCH (Rupture HL)</text>

            {/* Candles representation */}
            {/* Candle 1 (Bearish) */}
            <line x1="220" y1="90" x2="220" y2="160" stroke="#EF4444" strokeWidth="2" />
            <rect x="212" y="100" width="16" height="45" fill="#EF4444" rx="2" />

            {/* Candle 2 (Huge Displacement Bull) */}
            <line x1="260" y1="45" x2="260" y2="155" stroke="#10B981" strokeWidth="2" />
            <rect x="252" y="55" width="16" height="85" fill="#10B981" rx="2" />

            {/* Candle 3 (Extension Bull) */}
            <line x1="300" y1="35" x2="300" y2="90" stroke="#10B981" strokeWidth="2" />
            <rect x="292" y="40" width="16" height="35" fill="#10B981" rx="2" />

            {/* Invalidation Counter-Example Notice */}
            <rect x="30" y="195" width="540" height="32" fill="#0F172A" stroke="#334155" rx="4" />
            <text x="40" y="215" fill="#CBD5E1" fontSize="10" fontFamily="sans-serif">
              ⚠️ <tspan fill="#F59E0B" fontWeight="bold">Rappel scientifique :</tspan> Un FVG n'est jamais un support garanti. Si la rupture intervient sur news NFP/FOMC, la zone est invalidée.
            </text>
          </svg>
        </div>
      );

    case 'smc_liquidity_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-emerald-400 mb-2 flex items-center justify-between">
            <span>FIGURE 1.2 : BALAYAGE DE LIQUIDITÉ & EQUAL HIGHS (EQH)</span>
            <span className="text-[10px] text-slate-500">BUY-SIDE VS SELL-SIDE</span>
          </div>
          <svg viewBox="0 0 600 220" className="w-full h-auto bg-slate-900/60 rounded-lg">
            {/* Resistance line with Equal Highs */}
            <line x1="80" y1="70" x2="520" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
            <text x="90" y="60" fill="#FCD34D" fontSize="11" fontFamily="monospace" fontWeight="bold">
              EQUAL HIGHS (EQH) — NID DE BUY-SIDE LIQUIDITY (BSL)
            </text>

            {/* High 1 */}
            <line x1="160" y1="50" x2="160" y2="150" stroke="#10B981" strokeWidth="1.5" />
            <rect x="152" y="70" width="16" height="50" fill="#10B981" rx="2" />

            {/* High 2 */}
            <line x1="280" y1="50" x2="280" y2="160" stroke="#10B981" strokeWidth="1.5" />
            <rect x="272" y="70" width="16" height="60" fill="#10B981" rx="2" />

            {/* The Liquidity Sweep Candle (Mèche agressive) */}
            <line x1="400" y1="20" x2="400" y2="170" stroke="#EF4444" strokeWidth="2.5" />
            <rect x="392" y="75" width="16" height="75" fill="#EF4444" rx="2" />

            {/* Annotation Arrow on Sweep */}
            <path d="M 400 15 L 400 45" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow)" />
            <rect x="420" y="25" width="160" height="30" fill="#7F1D1D" rx="4" />
            <text x="428" y="44" fill="#FEE2E2" fontSize="10" fontFamily="monospace" fontWeight="bold">
              SWEEP : DÉCLENCHEMENT DES STOPS
            </text>

            {/* Subsequent drop */}
            <line x1="450" y1="100" x2="450" y2="190" stroke="#EF4444" strokeWidth="2" />
            <rect x="442" y="110" width="16" height="70" fill="#EF4444" rx="2" />
          </svg>
        </div>
      );

    case 'prop_drawdown_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-blue-400 mb-2 flex items-center justify-between">
            <span>FIGURE 2.1 : SEUILS CRITIQUES DU DRAWDOWN (DAILY VS TRAILING)</span>
            <span className="text-[10px] text-slate-500">SIMULATION FTMO / PROP FIRM</span>
          </div>
          <svg viewBox="0 0 600 240" className="w-full h-auto bg-slate-900/60 rounded-lg">
            {/* Levels */}
            <line x1="40" y1="40" x2="560" y2="40" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="50" y="32" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold">
              OBJECTIF DE PROFIT : +10,000 $ (110,000 $)
            </text>

            <line x1="40" y1="110" x2="560" y2="110" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
            <text x="50" y="102" fill="#94A3B8" fontSize="10" fontFamily="monospace">
              SOLDE INITIAL : 100,000 $
            </text>

            <line x1="40" y1="170" x2="560" y2="170" stroke="#EF4444" strokeWidth="2" />
            <rect x="420" y="158" width="135" height="22" fill="#7F1D1D" rx="3" />
            <text x="426" y="173" fill="#FEE2E2" fontSize="9" fontFamily="monospace" fontWeight="bold">
              MAX DRAWDOWN GLOBAL (-10%)
            </text>

            {/* Trailing line */}
            <path d="M 60 170 L 220 170 L 360 145 L 540 145" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
            <text x="240" y="162" fill="#FCD34D" fontSize="9" fontFamily="monospace">
              Trailing DD remonté suite aux profits
            </text>

            {/* Equity Path */}
            <path
              d="M 60 110 L 120 120 L 170 100 L 230 135 L 300 90 L 360 70 L 420 85 L 500 50 L 540 40"
              stroke="#38BDF8"
              strokeWidth="3"
              fill="none"
            />

            {/* Safe zone label */}
            <rect x="40" y="195" width="520" height="32" fill="#0F172A" stroke="#1E293B" rx="4" />
            <text x="50" y="215" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
              💡 <tspan fill="#38BDF8" fontWeight="bold">Règle d'or :</tspan> En calibrant votre risque à 0.5% max par trade, vous disposez d'un coussin de 10 pertes d'affilée avant de toucher le Daily Drawdown de 5%.
            </text>
          </svg>
        </div>
      );

    case 'psy_emotional_cycle_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-purple-400 mb-2 flex items-center justify-between">
            <span>FIGURE 3.1 : LA SPIRALE ÉMOTIONNELLE DU TRADER PARTICULIER</span>
            <span className="text-[10px] text-slate-500">BIAS & PSYCHOLOGIE QUANTITATIVE</span>
          </div>
          <svg viewBox="0 0 600 230" className="w-full h-auto bg-slate-900/60 rounded-lg">
            {/* The emotional trajectory */}
            <path
              d="M 50 140 C 120 80, 180 30, 240 40 C 300 50, 340 160, 420 180 C 480 190, 520 140, 560 120"
              stroke="#A855F7"
              strokeWidth="3"
              fill="none"
            />

            {/* Points and callouts */}
            {/* Peak: Hubris / FOMO */}
            <circle cx="240" cy="40" r="6" fill="#F59E0B" />
            <rect x="180" y="10" width="120" height="22" fill="#78350F" rx="4" />
            <text x="188" y="25" fill="#FDE68A" fontSize="10" fontFamily="monospace" fontWeight="bold">
              1. EUPHORIE / SUR-LEVIER
            </text>

            {/* Drop: Denial */}
            <circle cx="330" cy="120" r="5" fill="#EF4444" />
            <text x="345" y="115" fill="#FCA5A5" fontSize="10" fontFamily="monospace">
              2. Déplacement du Stop Loss ("Ça va remonter")
            </text>

            {/* Bottom: Revenge */}
            <circle cx="420" cy="180" r="6" fill="#DC2626" />
            <rect x="360" y="195" width="140" height="22" fill="#991B1B" rx="4" />
            <text x="368" y="210" fill="#FEE2E2" fontSize="10" fontFamily="monospace" fontWeight="bold">
              3. REVENGE TRADING FATAL
            </text>

            {/* Breaker Intervention */}
            <line x1="390" y1="130" x2="390" y2="210" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
            <rect x="440" y="60" width="140" height="40" fill="#064E3B" stroke="#10B981" strokeWidth="1" rx="5" />
            <text x="448" y="77" fill="#A7F3D0" fontSize="9" fontFamily="monospace" fontWeight="bold">
              INTERVENTION TRADEIQ
            </text>
            <text x="448" y="91" fill="#6EE7B7" fontSize="8" fontFamily="sans-serif">
              Circuit-breaker après 2 pertes
            </text>
          </svg>
        </div>
      );

    case 'risk_expectancy_matrix_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-amber-400 mb-2 flex items-center justify-between">
            <span>FIGURE 4.1 : MATRICE DE VIABILITÉ STATISTIQUE (WIN RATE VS RATIO R)</span>
            <span className="text-[10px] text-slate-500">ESPÉRANCE MATHÉMATIQUE E</span>
          </div>
          <svg viewBox="0 0 600 230" className="w-full h-auto bg-slate-900/60 rounded-lg">
            {/* Columns header */}
            <text x="120" y="30" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">Ratio 1:1 R</text>
            <text x="240" y="30" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">Ratio 1:1.5 R</text>
            <text x="370" y="30" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">Ratio 1:2 R</text>
            <text x="490" y="30" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">Ratio 1:3 R</text>

            {/* Row 30% */}
            <text x="30" y="70" fill="#CBD5E1" fontSize="11" fontFamily="monospace" fontWeight="bold">30% Win</text>
            <rect x="110" y="52" width="90" height="28" fill="#450A0A" rx="4" />
            <text x="128" y="70" fill="#FCA5A5" fontSize="10" fontFamily="monospace">E = -0.40R</text>

            <rect x="230" y="52" width="90" height="28" fill="#450A0A" rx="4" />
            <text x="248" y="70" fill="#FCA5A5" fontSize="10" fontFamily="monospace">E = -0.25R</text>

            <rect x="360" y="52" width="90" height="28" fill="#450A0A" rx="4" />
            <text x="378" y="70" fill="#FCA5A5" fontSize="10" fontFamily="monospace">E = -0.10R</text>

            <rect x="480" y="52" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="1" rx="4" />
            <text x="495" y="70" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +0.20R ✓</text>

            {/* Row 40% */}
            <text x="30" y="115" fill="#CBD5E1" fontSize="11" fontFamily="monospace" fontWeight="bold">40% Win</text>
            <rect x="110" y="97" width="90" height="28" fill="#450A0A" rx="4" />
            <text x="128" y="115" fill="#FCA5A5" fontSize="10" fontFamily="monospace">E = -0.20R</text>

            <rect x="230" y="97" width="90" height="28" fill="#1C1917" rx="4" />
            <text x="248" y="115" fill="#FDE68A" fontSize="10" fontFamily="monospace">E = 0.00R</text>

            <rect x="360" y="97" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="1" rx="4" />
            <text x="375" y="115" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +0.20R ✓</text>

            <rect x="480" y="97" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" rx="4" />
            <text x="495" y="115" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +0.60R ★</text>

            {/* Row 50% */}
            <text x="30" y="160" fill="#CBD5E1" fontSize="11" fontFamily="monospace" fontWeight="bold">50% Win</text>
            <rect x="110" y="142" width="90" height="28" fill="#1C1917" rx="4" />
            <text x="128" y="160" fill="#FDE68A" fontSize="10" fontFamily="monospace">E = 0.00R</text>

            <rect x="230" y="142" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="1" rx="4" />
            <text x="245" y="160" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +0.25R ✓</text>

            <rect x="360" y="142" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" rx="4" />
            <text x="375" y="160" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +0.50R ★</text>

            <rect x="480" y="142" width="90" height="28" fill="#064E3B" stroke="#10B981" strokeWidth="2" rx="4" />
            <text x="495" y="160" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">E = +1.00R 👑</text>

            {/* Bottom note */}
            <rect x="30" y="185" width="540" height="32" fill="#0F172A" stroke="#1E293B" rx="4" />
            <text x="40" y="205" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
              💡 Dès que votre ratio moyen dépasse 1:2 R, même un taux de réussite modeste de 40% génère une espérance très profitable.
            </text>
          </svg>
        </div>
      );

    case 'risk_drawdown_recovery_diagram':
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
          <div className="text-xs font-mono font-bold text-amber-400 mb-2 flex items-center justify-between">
            <span>FIGURE 4.2 : L'ASYMÉTRIE DESTRUCTIVE DES PERTES</span>
            <span className="text-[10px] text-slate-500">PROBABILITÉ DE RUINE</span>
          </div>
          <svg viewBox="0 0 600 200" className="w-full h-auto bg-slate-900/60 rounded-lg">
            <line x1="50" y1="160" x2="560" y2="160" stroke="#334155" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="50" y2="160" stroke="#334155" strokeWidth="1.5" />

            {/* Asymmetry bars */}
            {/* -10% -> +11% */}
            <rect x="90" y="135" width="40" height="25" fill="#3B82F6" rx="2" />
            <text x="85" y="175" fill="#94A3B8" fontSize="9" fontFamily="monospace">-10% DD</text>
            <text x="85" y="125" fill="#93C5FD" fontSize="9" fontFamily="monospace">+11.1% req.</text>

            {/* -20% -> +25% */}
            <rect x="190" y="115" width="40" height="45" fill="#10B981" rx="2" />
            <text x="185" y="175" fill="#94A3B8" fontSize="9" fontFamily="monospace">-20% DD</text>
            <text x="185" y="105" fill="#6EE7B7" fontSize="9" fontFamily="monospace">+25.0% req.</text>

            {/* -30% -> +43% */}
            <rect x="290" y="90" width="40" height="70" fill="#F59E0B" rx="2" />
            <text x="285" y="175" fill="#94A3B8" fontSize="9" fontFamily="monospace">-30% DD</text>
            <text x="285" y="80" fill="#FCD34D" fontSize="9" fontFamily="monospace">+42.9% req.</text>

            {/* -50% -> +100% */}
            <rect x="390" y="55" width="40" height="105" fill="#EF4444" rx="2" />
            <text x="385" y="175" fill="#FCA5A5" fontSize="9" fontFamily="monospace" fontWeight="bold">-50% DD</text>
            <text x="380" y="45" fill="#F87171" fontSize="9" fontFamily="monospace" fontWeight="bold">+100% REQUIS !</text>

            {/* -80% -> +400% */}
            <rect x="490" y="25" width="40" height="135" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1" rx="2" />
            <text x="485" y="175" fill="#EF4444" fontSize="9" fontFamily="monospace" fontWeight="bold">-80% DD</text>
            <text x="475" y="18" fill="#FCA5A5" fontSize="9" fontFamily="monospace" fontWeight="bold">+400% (Zone Ruine)</text>
          </svg>
        </div>
      );

    default:
      // Generic fallback diagram
      return (
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 my-4 text-center">
          <div className="text-xs font-mono text-slate-400 py-6">
            Graphique annoté TRADEIQ — Modèle d'analyse probabiliste
          </div>
        </div>
      );
  }
};
