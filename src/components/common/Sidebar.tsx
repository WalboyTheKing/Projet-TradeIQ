import React from 'react';
import {
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  CalendarDays,
  Flame,
  Link2,
  PlayCircle,
  WalletCards,
  Sparkles,
  BookOpen,
  Activity,
  Target,
  GraduationCap,
  History,
  Crown,
  Users,
  Percent,
  HelpCircle,
  ArrowUpRight,
  LogOut,
  Home
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { UserProfile } from '../../types/trade';

export type NavTab = 
  | 'dashboard'
  | 'trade-analysis'
  | 'chart-analysis'
  | 'trade-manager'
  | 'economic-calendar'
  | 'catalysts'
  | 'connect-accounts'
  | 'simulator'
  | 'paper-trading'
  | 'trading-feedback'
  | 'ai-review'
  | 'journal'
  | 'stress-test'
  | 'strategies'
  | 'learning'
  | 'trade-history'
  | 'plans'
  | 'billing'
  | 'creator'
  | 'affiliate'
  | 'support'
  | 'settings'
  | 'calendar'
  | 'statistics'
  | 'performance'
  | 'markets'
  | 'risk'
  | 'reports';

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

interface NavGroup {
  family: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
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
    name: userProfile?.name && userProfile.name !== 'Trader' ? userProfile.name : 'Waliou Labouda',
    email: userProfile?.email || 'walioulabouda2@gmail.com',
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

  // Tier-adaptive badge for Paper Trading: FREE for free users, PRO for pro, BETA for premium & admin
  const paperTradingBadge =
    userProfile?.role === 'admin'
      ? 'BETA'
      : userProfile?.plan === 'premium'
      ? 'BETA'
      : userProfile?.plan === 'pro'
      ? 'PRO'
      : 'FREE';

  // Family groups exactly as requested:
  const navGroups: NavGroup[] = [
    {
      family: 'Trade',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trade-analysis', label: 'Trade Analysis', icon: Search },
        { id: 'trade-manager', label: 'Trade Manager', icon: SlidersHorizontal },
        { id: 'economic-calendar', label: 'Economic Calendar', icon: CalendarDays },
        { id: 'catalysts', label: 'Catalysts', icon: Flame },
        { id: 'connect-accounts', label: 'Connect Accounts', icon: Link2 },
        { id: 'simulator', label: 'Simulator', icon: PlayCircle },
      ],
    },
    {
      family: 'Pro',
      items: [
        { id: 'paper-trading', label: 'Paper Trading', icon: WalletCards, badge: paperTradingBadge },
        { id: 'trading-feedback', label: 'Trading Feedback', icon: Sparkles, badge: 'AI' },
        { id: 'journal', label: 'Trade Journal', icon: BookOpen },
        { id: 'stress-test', label: 'Stress Test', icon: Activity },
      ],
    },
    {
      family: 'Beta',
      items: [
        { id: 'strategies', label: 'Strategy Builder', icon: Target, badge: 'BETA' },
      ],
    },
    {
      family: 'Learn',
      items: [
        { id: 'learning', label: 'Learning', icon: GraduationCap },
      ],
    },
    {
      family: 'Journal',
      items: [
        { id: 'trade-history', label: 'Trade History', icon: History },
      ],
    },
    {
      family: 'Account',
      items: [
        { id: 'billing', label: 'Plans', icon: Crown },
        { id: 'creator', label: 'Become a Creator', icon: Users },
        { id: 'affiliate', label: 'Affiliate Program', icon: Percent },
        { id: 'support', label: 'Support', icon: HelpCircle },
      ],
    },
  ];

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
              <div className="text-[10px] text-slate-400 font-mono">Institutional Terminal</div>
            </div>
          </div>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/50 transition-colors"
              title="Return to Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Families */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.family} className="space-y-1">
              {/* Category Header */}
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                {group.family}
              </div>

              {/* Items in Family */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.id ||
                    (item.id === 'trading-feedback' && (activeTab === 'ai-review' || activeTab === 'ai-analysis')) ||
                    (item.id === 'billing' && activeTab === 'plans') ||
                    (item.id === 'connect-accounts' && activeTab === 'import') ||
                    (item.id === 'trade-history' && activeTab === 'reports');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`group flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
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

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            item.badge === 'PRO'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.badge === 'FREE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.badge === 'BETA' || item.badge === 'PREMIUM'
                              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                              : item.badge === 'AI'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Subscription & WL Profile Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2.5">
          {/* Plan card */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/90 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Access Status</span>
              {userProfile?.role === 'admin' ? (
                <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 font-mono">
                  ADMIN
                </span>
              ) : (
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-mono">
                  {profile.plan}
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-400">
              {userProfile?.role === 'admin'
                ? 'Full Access • All Features & Quotas Unlocked'
                : profile.plan === 'free'
                ? '50 trades limit • Free Tier'
                : 'Unlimited trades & AI features enabled'}
            </div>

            {userProfile?.role !== 'admin' && onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center justify-center gap-1 w-full py-1 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <span>Upgrade / Plans</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* User profile row: WL / Waliou Labouda / walioulabouda2@gmail.com */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/30 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-sm font-mono">
                {profile.name
                  ? profile.name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'WL'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                  <span className="truncate">{profile.name}</span>
                  {userProfile?.role === 'admin' && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
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
