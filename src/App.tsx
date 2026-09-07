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

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { useAuth } from './context/AuthContext';

import { storageService } from './lib/storage';
import { Trade, Strategy, UserProfile } from './types/trade';
import { Loader2, BarChart3 } from 'lucide-react';

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

  // Load data from persistence service
  const reloadData = useCallback(() => {
    setTrades(storageService.getTrades());
    setStrategies(storageService.getStrategies());
    setIsDemo(storageService.isDemoMode());
  }, []);

  useEffect(() => {
    reloadData();

    // Listen to storage changes
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

  // Handlers
  const handleSaveTrade = (tradeData: Omit<Trade, 'id' | 'created_at'>) => {
    storageService.addTrade(tradeData);
    reloadData();
  };

  const handleDeleteTrade = (id: string) => {
    storageService.deleteTrade(id);
    reloadData();
  };

  const handleAddStrategy = (stratData: Omit<Strategy, 'id' | 'created_at'>) => {
    storageService.addStrategy(stratData);
    reloadData();
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

  const handleResetDemoData = () => {
    storageService.resetDemoData();
    reloadData();
  };

  const handleToggleDemo = () => {
    storageService.setDemoMode(!isDemo);
    reloadData();
  };

  const handleImportTrades = (newTrades: Omit<Trade, 'id' | 'created_at'>[]) => {
    newTrades.forEach((t) => storageService.addTrade(t));
    reloadData();
  };

  const handleSignOut = async () => {
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

  // 7. If user is NOT authenticated and hasn't explicitly chosen demo mode, show Login or Landing
  if (!user && !isDemo) {
    if (showLanding) {
      return (
        <LandingPage
          onLogin={() => navigateTo('/login', 'login')}
          onStartFree={() => navigateTo('/register', 'register')}
          onViewDemo={() => {
            storageService.setDemoMode(true);
            setIsDemo(true);
            setShowLanding(false);
            navigateTo('/dashboard', null);
          }}
        />
      );
    }

    // Default to LoginPage for private application access
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

  // 8. If landing page is explicitly requested while in demo
  if (showLanding) {
    return (
      <LandingPage
        onLogin={() => navigateTo('/login', 'login')}
        onStartFree={() => navigateTo('/register', 'register')}
        onViewDemo={() => {
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

  // 10. Authenticated Application Workspace
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
        userProfile={userProfile}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenUpgrade={() => setCurrentTab('billing')}
        onNavigateHome={() => setShowLanding(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          userProfile={userProfile}
          isDemo={isDemo}
          isDemoMode={isDemo}
          onToggleDemoMode={(val) => {
            storageService.setDemoMode(val);
            setIsDemo(val);
          }}
          onToggleDemo={(val) => {
            storageService.setDemoMode(val);
            setIsDemo(val);
          }}
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
                userProfile={userProfile}
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
              <AIChartAnalysisView userProfile={userProfile} />
            )}

            {currentTab === 'trade-analysis' && (
              <TradeAnalysisView
                trades={trades}
                onOpenAddTrade={() => setIsAddTradeOpen(true)}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView trades={trades} onDeleteTrade={handleDeleteTrade} />
            )}

            {currentTab === 'statistics' && (
              <StatisticsView trades={trades} userProfile={userProfile} />
            )}

            {currentTab === 'performance' && (
              <PerformanceView trades={trades} userProfile={userProfile} />
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
              <AiAnalysisView trades={trades} userProfile={userProfile} />
            )}

            {currentTab === 'import' && (
              <ImportView existingTrades={trades} onImportTrades={handleImportTrades} />
            )}

            {currentTab === 'reports' && (
              <ReportsView trades={trades} userProfile={userProfile} />
            )}

            {currentTab === 'billing' && (
              <BillingView
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {(currentTab === 'settings' || currentTab === 'subscription') && (
              <SettingsView
                userProfile={userProfile}
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
