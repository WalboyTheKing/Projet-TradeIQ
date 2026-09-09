// ============================================================================
// APP ENTRY POINT — TRADEIQ
// Full-stack Architecture: Supabase Auth, Multi-Role RLS Isolation & Quant Platform
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { JournalView } from './components/journal/JournalView';
import { AddTradeModal } from './components/journal/AddTradeModal';
import { AIChartAnalysisView } from './components/chart-analysis/AIChartAnalysisView';
import { TradeAnalysisView } from './components/trade-analysis/TradeAnalysisView';
import { CalendarView } from './components/calendar/CalendarView';
import { EconomicCalendarView } from './components/economic-calendar/EconomicCalendarView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { PerformanceView } from './components/performance/PerformanceView';
import { StrategiesView } from './components/strategies/StrategiesView';
import { MarketsView } from './components/markets/MarketsView';
import { PsychologyView } from './components/psychology/PsychologyView';
import { AiAnalysisView } from './components/ai/AiAnalysisView';
import { ImportView } from './components/import/ImportView';
import { ReportsView } from './components/reports/ReportsView';
import { BillingView } from './components/billing/BillingView';
import { SettingsView } from './components/settings/SettingsView';
import { SupportView } from './components/support/SupportView';
import { TradeManagerView } from './components/trade-manager/TradeManagerView';
import { CatalystsView } from './components/catalysts/CatalystsView';
import { ConnectAccountsView } from './components/connect/ConnectAccountsView';
import { SimulatorView } from './components/simulator/SimulatorView';
import { PaperTradingView } from './components/paper-trading/PaperTradingView';
import { StressTestView } from './components/stress-test/StressTestView';
import { LearningView } from './components/learning/LearningView';
import { CreatorView } from './components/creator/CreatorView';
import { AffiliateView } from './components/affiliate/AffiliateView';

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { useAuth } from './context/AuthContext';

import { storageService } from './lib/storage';
import { tradeService } from './lib/tradeService';
import { Trade, Strategy, UserProfile } from './types/trade';
import { Loader2, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';

type AuthRoute = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'callback' | null;

export default function App() {
  const { user, profile: authProfile, loading: authLoading, signOut, updateProfile: updateAuthProfile } = useAuth();

  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>(() => {
    const path = window.location.pathname;
    if (path === '/auth/callback') return 'callback';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/forgot-password') return 'forgot-password';
    if (path === '/reset-password') return 'reset-password';
    return null;
  });

  // State data
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [isDemo, setIsDemo] = useState<boolean>(storageService.isDemoMode());

  // Listen to browser forward/backward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/auth/callback') setAuthRoute('callback');
      else if (path === '/login') setAuthRoute('login');
      else if (path === '/register') setAuthRoute('register');
      else if (path === '/forgot-password') setAuthRoute('forgot-password');
      else if (path === '/reset-password') setAuthRoute('reset-password');
      else if (path === '/' && !user) setShowLanding(true);
      else setAuthRoute(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Enforce Real Mode when a verified Supabase user logs in
  useEffect(() => {
    if (user) {
      storageService.setDemoMode(false);
      setIsDemo(false);
    }
  }, [user]);

  // Isolated Active Profile derivation:
  // When user is authenticated in Real mode: strictly uses Supabase Auth + public.users (NO demo fallback)
  // When in Demo mode: uses isolated Demo profile
  const activeProfile: UserProfile = React.useMemo(() => {
    if (user && !isDemo) {
      const derivedName =
        authProfile?.name ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        (user.email ? user.email.split('@')[0] : 'Waliou Labouda');
      return {
        id: user.id,
        name: derivedName,
        email: user.email || authProfile?.email || 'walioulabouda2@gmail.com',
        currency: authProfile?.currency || 'USD',
        currencySymbol: authProfile?.currencySymbol || '$',
        timezone: authProfile?.timezone || 'UTC',
        defaultRiskUnit: authProfile?.defaultRiskUnit || '%',
        defaultRiskValue: authProfile?.defaultRiskValue ?? 1.0,
        initialCapital: authProfile?.initialCapital ?? 10000,
        plan: authProfile?.plan || 'free',
        favoriteMarkets: authProfile?.favoriteMarkets || ['Forex', 'Crypto', 'Indices'],
        onboardingCompleted: authProfile?.onboardingCompleted ?? true,
        subscriptionTier: (authProfile?.plan?.toUpperCase() === 'PREMIUM'
          ? 'ELITE'
          : authProfile?.plan?.toUpperCase() === 'PRO'
          ? 'PRO'
          : 'STARTER') as any,
        accountCurrency: authProfile?.accountCurrency || 'USD',
        monthlyProfitGoal: authProfile?.monthlyProfitGoal || 2000,
        maxRiskPerTrade: authProfile?.maxRiskPerTrade || 2.0,
      };
    }

    if (isDemo) {
      return {
        id: 'demo-session',
        name: 'Waliou Labouda',
        email: 'walioulabouda2@gmail.com',
        currency: 'USD',
        currencySymbol: '$',
        timezone: 'UTC',
        defaultRiskUnit: '%',
        defaultRiskValue: 1.0,
        initialCapital: 50000,
        plan: 'pro',
        favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
        onboardingCompleted: true,
        subscriptionTier: 'PRO',
        accountCurrency: 'USD',
        monthlyProfitGoal: 5000,
        maxRiskPerTrade: 1.5,
      };
    }

    return userProfile;
  }, [user, isDemo, authProfile, userProfile]);

  // Load data from persistence service
  const reloadData = useCallback(async () => {
    const currentDemo = storageService.isDemoMode();
    setIsDemo(currentDemo);
    const userId = user ? user.id : null;
    const [loadedTrades, loadedStrats] = await Promise.all([
      tradeService.getTrades(userId, currentDemo),
      tradeService.getStrategies(userId, currentDemo),
    ]);
    setTrades(loadedTrades);
    setStrategies(loadedStrats);
  }, [user]);

  useEffect(() => {
    reloadData();

    // Listen to storage/service changes
    const handleStorageChange = () => {
      reloadData();
    };
    window.addEventListener('tradeiq-data-changed', handleStorageChange);
    return () => window.removeEventListener('tradeiq-data-changed', handleStorageChange);
  }, [reloadData]);

  // Sync auth profile into local state whenever authProfile updates
  useEffect(() => {
    if (authProfile) {
      setUserProfile((prev) => ({
        ...prev,
        id: authProfile.id || prev.id,
        email: authProfile.email || prev.email,
        name: authProfile.name || prev.name,
        plan: authProfile.plan || prev.plan,
        subscriptionTier: (authProfile.plan?.toUpperCase() === 'PREMIUM'
          ? 'PREMIUM'
          : authProfile.plan?.toUpperCase() === 'PRO'
          ? 'PRO'
          : 'STARTER') as any,
        accountCurrency: authProfile.accountCurrency || prev.accountCurrency,
        initialCapital: authProfile.initialCapital || prev.initialCapital,
        monthlyProfitGoal: authProfile.monthlyProfitGoal || prev.monthlyProfitGoal,
        maxRiskPerTrade: authProfile.maxRiskPerTrade || prev.maxRiskPerTrade,
      }));

      // Check if onboarding needs to be shown for new user
      if (authProfile.onboardingCompleted === false && !localStorage.getItem('tradeiq_onboarded')) {
        setShowOnboarding(true);
      }
    }
  }, [authProfile]);

  const navigateTo = (path: string, route: AuthRoute = null) => {
    if (window.history.pushState) {
      window.history.pushState(null, '', path);
    }
    setAuthRoute(route);
  };

  // Handlers using tradeService with strict real/demo branching
  const handleSaveTrade = async (tradeData: Omit<Trade, 'id' | 'created_at'>) => {
    await tradeService.addTrade(user ? user.id : null, isDemo, tradeData);
    await reloadData();
  };

  const handleDeleteTrade = async (id: string) => {
    await tradeService.deleteTrade(user ? user.id : null, isDemo, id);
    await reloadData();
  };

  const handleUpdateTrade = async (id: string, updates: Partial<Trade>) => {
    await tradeService.updateTrade(user ? user.id : null, isDemo, id, updates);
    await reloadData();
  };

  const handleAddStrategy = async (stratData: Omit<Strategy, 'id' | 'created_at'>) => {
    await tradeService.addStrategy(user ? user.id : null, isDemo, stratData);
    await reloadData();
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    // 1. Update local storage
    storageService.saveUserProfile(updated);
    setUserProfile((prev) => ({ ...prev, ...updated }));

    // 2. If logged in, sync safe fields with Supabase public.users
    if (user) {
      await updateAuthProfile({
        name: updated.name,
        accountCurrency: updated.accountCurrency,
        initialCapital: updated.initialCapital,
        monthlyProfitGoal: updated.monthlyProfitGoal,
        maxRiskPerTrade: updated.maxRiskPerTrade,
      });
    }
  };

  const handleResetDemoData = async () => {
    tradeService.resetDemoData();
    await reloadData();
  };

  const handleToggleDemo = (val?: boolean) => {
    const nextVal = typeof val === 'boolean' ? val : !isDemo;
    storageService.setDemoMode(nextVal);
    setIsDemo(nextVal);
  };

  const handleImportTrades = async (newTrades: Omit<Trade, 'id' | 'created_at'>[]) => {
    await tradeService.importTrades(user ? user.id : null, isDemo, newTrades);
    await reloadData();
  };

  const handleSignOut = async () => {
    storageService.setDemoMode(false);
    storageService.clearUserProfile();
    setIsDemo(false);
    setTrades([]);
    setStrategies([]);
    await signOut();
    navigateTo('/login', 'login');
  };

  // 1. Global Loading State (Supabase session verification)
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090D14] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-wider text-slate-100 font-mono">
            TRADEIQ
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Initialisation de la session sécurisée...</span>
        </div>
      </div>
    );
  }

  // 2. OAuth Callback Route
  if (authRoute === 'callback') {
    return (
      <AuthCallback
        onSuccess={() => {
          navigateTo('/dashboard', null);
          setShowLanding(false);
        }}
        onNavigateLogin={() => navigateTo('/login', 'login')}
      />
    );
  }

  // 3. Reset Password Route
  if (authRoute === 'reset-password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          navigateTo('/dashboard', null);
          setShowLanding(false);
        }}
      />
    );
  }

  // 4. Forgot Password Route
  if (authRoute === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateLogin={() => navigateTo('/login', 'login')}
        onNavigateHome={() => {
          setShowLanding(true);
          navigateTo('/', null);
        }}
      />
    );
  }

  // 5. Register Route
  if (authRoute === 'register') {
    return (
      <RegisterPage
        onNavigateLogin={() => navigateTo('/login', 'login')}
        onSuccess={() => {
          navigateTo('/dashboard', null);
          setShowLanding(false);
        }}
        onNavigateHome={() => {
          setShowLanding(true);
          navigateTo('/', null);
        }}
      />
    );
  }

  // 6. Login Route
  if (authRoute === 'login') {
    return (
      <LoginPage
        onNavigateRegister={() => navigateTo('/register', 'register')}
        onNavigateForgotPassword={() => navigateTo('/forgot-password', 'forgot-password')}
        onSuccess={() => {
          navigateTo('/dashboard', null);
          setShowLanding(false);
        }}
        onNavigateHome={() => {
          setShowLanding(true);
          navigateTo('/', null);
        }}
      />
    );
  }

  // 7. Strict Authentication Check: Unauthenticated users can only access Landing Page or Auth Pages
  if (!user && !isDemo) {
    if (showLanding) {
      return (
        <LandingPage
          onLogin={() => navigateTo('/login', 'login')}
          onStartFree={() => navigateTo('/register', 'register')}
          onExploreDemo={() => {
            storageService.setDemoMode(true);
            setIsDemo(true);
            setShowLanding(false);
            navigateTo('/dashboard', null);
          }}
        />
      );
    }

    // Default to LoginPage for private application access (Dashboard, Journal, Settings, etc.)
    return (
      <LoginPage
        onNavigateRegister={() => navigateTo('/register', 'register')}
        onNavigateForgotPassword={() => navigateTo('/forgot-password', 'forgot-password')}
        onSuccess={() => {
          navigateTo('/dashboard', null);
          setShowLanding(false);
        }}
        onNavigateHome={() => {
          setShowLanding(true);
          navigateTo('/', null);
        }}
      />
    );
  }

  // 8. If user explicitly requests to view the landing page
  if (showLanding) {
    return (
      <LandingPage
        onLogin={() => {
          setShowLanding(false);
          navigateTo('/dashboard', null);
        }}
        onStartFree={() => {
          setShowLanding(false);
          navigateTo('/dashboard', null);
        }}
        onExploreDemo={() => {
          storageService.setDemoMode(true);
          setIsDemo(true);
          setShowLanding(false);
          navigateTo('/dashboard', null);
        }}
      />
    );
  }

  // 9. If onboarding is active for a new user
  if (showOnboarding) {
    return (
      <OnboardingWizard
        initialProfile={activeProfile}
        onComplete={async (profileData) => {
          await handleUpdateProfile(profileData);
          if (user) {
            await updateAuthProfile({ onboardingCompleted: true });
          }
          localStorage.setItem('tradeiq_onboarded', 'true');
          setShowOnboarding(false);
        }}
        onSkip={async () => {
          if (user) {
            await updateAuthProfile({ onboardingCompleted: true });
          }
          localStorage.setItem('tradeiq_onboarded', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  // 10. Application Workspace (Real Authenticated or Isolated Demo Session)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090D14] text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        userProfile={activeProfile}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenUpgrade={() => setCurrentTab('billing')}
        onNavigateHome={() => setShowLanding(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Warning Banner if in Demo Mode */}
        {isDemo && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300">MODE DÉMO ACTIF :</strong> Vous consultez des données de simulation locales. Aucune donnée n'est envoyée à Supabase.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() => handleToggleDemo(false)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
                >
                  Basculer vers mon compte réel
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('/login', 'login')}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all cursor-pointer"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => navigateTo('/register', 'register')}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Créer un compte
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Header */}
        <Header
          userProfile={activeProfile}
          isDemo={isDemo}
          isDemoMode={isDemo}
          onToggleDemoMode={(val) => handleToggleDemo(val)}
          onToggleDemo={(val) => handleToggleDemo(val)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenAddTrade={() => setIsAddTradeOpen(true)}
          onOpenImport={() => setCurrentTab('import')}
          onOpenUpgrade={() => setCurrentTab('billing')}
          onShowLanding={() => setShowLanding(true)}
          onSignOut={handleSignOut}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                trades={trades}
                userProfile={activeProfile}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
                onDeleteTrade={handleDeleteTrade}
                onOpenChartAnalysis={() => setCurrentTab('chart-analysis')}
              />
            )}

            {currentTab === 'journal' && (
              <JournalView
                trades={trades}
                strategies={strategies}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {currentTab === 'chart-analysis' && (
              <AIChartAnalysisView userProfile={activeProfile} />
            )}

            {currentTab === 'trade-analysis' && (
              <TradeAnalysisView
                trades={trades}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                trades={trades}
                onDeleteTrade={handleDeleteTrade}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
                onNavigateEconomic={() => setCurrentTab('economic-calendar')}
              />
            )}

            {currentTab === 'economic-calendar' && (
              <EconomicCalendarView />
            )}

            {currentTab === 'trade-manager' && (
              <TradeManagerView
                trades={trades}
                userProfile={activeProfile}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
              />
            )}

            {currentTab === 'catalysts' && (
              <CatalystsView />
            )}

            {currentTab === 'connect-accounts' && (
              <ConnectAccountsView
                userProfile={activeProfile}
                onOpenImport={() => setCurrentTab('import')}
              />
            )}

            {currentTab === 'simulator' && (
              <SimulatorView />
            )}

            {currentTab === 'paper-trading' && (
              <PaperTradingView />
            )}

            {(currentTab === 'ai-analysis' || currentTab === 'ai-review' || currentTab === 'trading-feedback') && (
              <AiAnalysisView trades={trades} userProfile={activeProfile} />
            )}

            {currentTab === 'stress-test' && (
              <StressTestView trades={trades} />
            )}

            {currentTab === 'learning' && (
              <LearningView />
            )}

            {(currentTab === 'reports' || currentTab === 'trade-history') && (
              <ReportsView trades={trades} userProfile={activeProfile} />
            )}

            {(currentTab === 'billing' || currentTab === 'plans') && (
              <BillingView
                userProfile={activeProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentTab === 'creator' && (
              <CreatorView userProfile={activeProfile} />
            )}

            {currentTab === 'affiliate' && (
              <AffiliateView userProfile={activeProfile} />
            )}

            {currentTab === 'support' && (
              <SupportView userProfile={activeProfile} />
            )}

            {currentTab === 'statistics' && (
              <StatisticsView trades={trades} userProfile={activeProfile} />
            )}

            {currentTab === 'performance' && (
              <PerformanceView
                trades={trades}
                userProfile={activeProfile}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
              />
            )}

            {currentTab === 'strategies' && (
              <StrategiesView
                trades={trades}
                strategies={strategies}
                onAddStrategy={handleAddStrategy}
              />
            )}

            {currentTab === 'markets' && <MarketsView trades={trades} />}

            {(currentTab === 'psychology' || currentTab === 'risk') && (
              <PsychologyView trades={trades} />
            )}

            {(currentTab === 'ai-analysis' || currentTab === 'ai-review') && (
              <AiAnalysisView trades={trades} userProfile={activeProfile} />
            )}

            {currentTab === 'import' && (
              <ImportView existingTrades={trades} onImportTrades={handleImportTrades} />
            )}

            {currentTab === 'reports' && (
              <ReportsView trades={trades} userProfile={activeProfile} />
            )}

            {currentTab === 'billing' && (
              <BillingView
                userProfile={activeProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {(currentTab === 'settings' || currentTab === 'subscription') && (
              <SettingsView
                userProfile={activeProfile}
                onUpdateProfile={handleUpdateProfile}
                onResetDemoData={handleResetDemoData}
                isDemo={isDemo}
                onToggleDemo={handleToggleDemo}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddTradeOpen}
        onClose={() => setIsAddTradeOpen(false)}
        onSaveTrade={handleSaveTrade}
        strategies={strategies}
      />
    </div>
  );
}
