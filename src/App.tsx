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
import { SettingsView } from './components/settings/SettingsView';
import { storageService } from './lib/storage';
import { Trade, Strategy, UserProfile } from './types/trade';

export default function App() {
  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState<boolean>(false);

  // State data
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [isDemo, setIsDemo] = useState<boolean>(storageService.isDemoMode());

  // Load data from persistence service
  const reloadData = useCallback(() => {
    setTrades(storageService.getTrades());
    setStrategies(storageService.getStrategies());
    setUserProfile(storageService.getUserProfile());
    setIsDemo(storageService.isDemoMode());
  }, []);

  useEffect(() => {
    // Initial load
    reloadData();

    // Check onboarding completion
    const onboardingDone = localStorage.getItem('tradeiq_onboarded');
    if (!onboardingDone) {
      // Optional: don't block directly unless user chooses, or set initial state
    }

    // Listen to storage changes
    const handleStorageChange = () => {
      reloadData();
    };
    window.addEventListener('tradeiq-data-changed', handleStorageChange);
    return () => window.removeEventListener('tradeiq-data-changed', handleStorageChange);
  }, [reloadData]);

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

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    storageService.saveUserProfile(updated);
    reloadData();
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

  // If user is previewing the marketing landing page
  if (showLanding) {
    return (
      <LandingPage
        onLaunchApp={() => setShowLanding(false)}
        onOpenOnboarding={() => {
          setShowLanding(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  // If onboarding is triggered
  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={(profileData) => {
          handleUpdateProfile(profileData);
          localStorage.setItem('tradeiq_onboarded', 'true');
          setShowOnboarding(false);
        }}
        onSkip={() => {
          localStorage.setItem('tradeiq_onboarded', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

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
        onOpenUpgrade={() => setCurrentTab('subscription')}
        onNavigateHome={() => setShowLanding(true)}
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
          onOpenUpgrade={() => setCurrentTab('subscription')}
          onShowLanding={() => setShowLanding(true)}
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
