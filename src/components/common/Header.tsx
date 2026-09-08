import React from 'react';
import { 
  BarChart3, 
  Plus, 
  Upload, 
  Sparkles, 
  Layers, 
  User, 
  Menu,
  ShieldAlert,
  Flame,
  LogOut
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { UserProfile } from '../../types/trade';

interface HeaderProps {
  isDemoMode?: boolean;
  isDemo?: boolean;
  onToggleDemoMode?: (isDemo: boolean) => void;
  onToggleDemo?: (isDemo: boolean) => void;
  onOpenAddTrade?: () => void;
  onOpenImport?: () => void;
  onOpenUpgrade?: () => void;
  onShowLanding?: () => void;
  onSignOut?: () => void;
  userProfile?: UserProfile | null;
  onToggleMobileMenu?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDemoMode,
  isDemo,
  onToggleDemoMode,
  onToggleDemo,
  onOpenAddTrade,
  onOpenImport,
  onOpenUpgrade,
  onShowLanding,
  onSignOut,
  userProfile,
  onToggleMobileMenu,
  onToggleMobileSidebar,
}) => {
  const profile: UserProfile = {
    id: userProfile?.id || '',
    name: userProfile?.name || 'Trader',
    email: userProfile?.email || '',
    currency: userProfile?.currency || 'USD',
    currencySymbol: userProfile?.currencySymbol || '$',
    timezone: userProfile?.timezone || 'UTC',
    defaultRiskUnit: userProfile?.defaultRiskUnit || '%',
    defaultRiskValue: userProfile?.defaultRiskValue || 1.0,
    initialCapital: userProfile?.initialCapital || 10000,
    plan: userProfile?.plan || 'free',
    favoriteMarkets: userProfile?.favoriteMarkets || ['Forex', 'Crypto', 'Indices'],
    onboardingCompleted: userProfile?.onboardingCompleted ?? false,
    subscriptionTier: userProfile?.subscriptionTier || 'STARTER',
  };

  const currentDemoStatus = isDemoMode !== undefined ? isDemoMode : isDemo ?? false;
  const toggleDemo = (val: boolean) => {
    if (onToggleDemoMode) onToggleDemoMode(val);
    if (onToggleDemo) onToggleDemo(val);
  };
  const toggleMobile = onToggleMobileSidebar || onToggleMobileMenu;
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#090D14]/90 backdrop-blur-md px-4 lg:px-6 py-3">
      {/* Left branding & mobile toggle */}
      <div className="flex items-center gap-3">
        {toggleMobile && (
          <button
            onClick={toggleMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-slate-100 font-mono">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Quantitative Trading Journal
            </span>
          </div>
        </div>
      </div>

      {/* Center: Demo Data Switcher & Alert */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-1">
          <button
            onClick={() => toggleDemo(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              currentDemoStatus
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${currentDemoStatus ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
              DEMO DATA
            </span>
          </button>

          <button
            onClick={() => toggleDemo(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !currentDemoStatus
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${!currentDemoStatus ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              LIVE DATA
            </span>
          </button>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {onOpenImport && (
          <button
            onClick={onOpenImport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/80 rounded-lg transition-colors"
            title="Import CSV or Excel"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import</span>
          </button>
        )}

        {onOpenAddTrade && (
          <button
            onClick={onOpenAddTrade}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Add Trade</span>
          </button>
        )}

        {onOpenUpgrade && (
          <button
            onClick={onOpenUpgrade}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{profile.plan} Plan</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-800 text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            {profile.name?.charAt(0) || 'U'}
          </div>
          <span className="text-slate-300 font-medium">{profile.name}</span>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer ml-1"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
