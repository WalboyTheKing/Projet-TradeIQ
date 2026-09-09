import React from 'react';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Calendar,
  BarChart2,
  TrendingUp,
  Target,
  Globe2,
  ShieldCheck,
  FileText,
  Settings,
  Sparkles,
  ArrowUpRight,
  LogOut,
  HelpCircle,
  Home,
  Coins,
  CalendarDays
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { UserProfile } from '../../types/trade';

export type NavTab = 
  | 'dashboard'
  | 'chart-analysis'
  | 'trade-analysis'
  | 'journal'
  | 'calendar'
  | 'economic-calendar'
  | 'statistics'
  | 'performance'
  | 'strategies'
  | 'markets'
  | 'risk'
  | 'ai-review'
  | 'reports'
  | 'billing'
  | 'settings';

interface SidebarProps {
  activeTab: string;
  onSelectTab?: (tab: any) => void;
  onTabChange?: (tab: any) => void;
  userProfile?: UserProfile | null;
  onOpenUpgrade?: () => void;
  onNavigateHome?: () => void;
  onSignOut?: () => void;
  isMobileOpen?: boolean;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  userProfile,
  onOpenUpgrade,
  onNavigateHome,
  onSignOut,
  isMobileOpen = false,
  isOpen = false,
  onCloseMobile,
  onClose,
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

  const effectiveMobileOpen = isOpen || isMobileOpen;

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chart-analysis', label: 'AI Chart Analysis', icon: Sparkles, badge: 'AI' },
    { id: 'trade-analysis', label: 'Trade Explorer', icon: Search },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'economic-calendar', label: 'Economic Calendar', icon: CalendarDays },
    { id: 'statistics', label: 'Statistics', icon: BarChart2 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'markets', label: 'Markets', icon: Globe2 },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldCheck },
    { id: 'ai-review', label: 'AI Review', icon: Sparkles, badge: 'AI' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'billing', label: 'Billing & USDT', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleItemClick = (id: string) => {
    if (onTabChange) onTabChange(id);
    if (onSelectTab) onSelectTab(id as NavTab);
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {effectiveMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-slate-800/80 bg-[#090D14] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          effectiveMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top App Identity */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              TIQ
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-slate-100 font-mono">
                {APP_CONFIG.name}
              </div>
              <div className="text-[10px] text-slate-400">Professional SaaS</div>
            </div>
          </div>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/50"
              title="Return to Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Terminal Views
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'risk' && activeTab === 'psychology') ||
              (item.id === 'ai-review' && activeTab === 'ai-analysis');
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {'badge' in item && item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Subscription & Profile Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2.5">
          {/* Plan card */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Subscription</span>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {profile.plan}
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              {profile.plan === 'free'
                ? '50 trades limit per account'
                : 'Unlimited trades & AI features enabled'}
            </div>

            {onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center justify-center gap-1 w-full py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors"
              >
                <span>Upgrade / Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
                {profile.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {profile.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {profile.email}
                </div>
              </div>
            </div>

            {onSignOut ? (
              <button
                onClick={onSignOut}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : onNavigateHome ? (
              <button
                onClick={onNavigateHome}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
                title="Return to Public Site"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
};
