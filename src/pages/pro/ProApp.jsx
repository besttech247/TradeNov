import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import './index.css';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import WelcomeOnboarding from './components/WelcomeOnboarding';

import ExchangeSetupPage from './pages/ExchangeSetupPage';
import StrategyFactoryPage from './pages/StrategyFactoryPage';
import CoinPortfolioPage from './pages/CoinPortfolioPage';
import TradeEntryPage from './pages/TradeEntryPage';
import TradesHistoryPage from './pages/TradesHistoryPage';
import OverviewDashboardPage from './pages/OverviewDashboardPage';
import MarketPricesPage from './pages/MarketPricesPage';
import ShortTermDashboardPage from './pages/ShortTermDashboardPage';
import LongTermDashboardPage from './pages/LongTermDashboardPage';
import StrategyComparisonPage from './pages/StrategyComparisonPage';
import StrategyDashboardPage from './pages/StrategyDashboardPage';
import SecurityPreviewPage from './pages/SecurityPreviewPage';
import SystemLogsPage from './pages/SystemLogsPage';
import UsersManagementPage from './pages/UsersManagementPage';
import WaitlistManagementPage from './pages/admin/WaitlistManagementPage';
import WalletPage from './pages/WalletPage';
import BillingPage from './pages/BillingPage';
import AffiliateDashboard from './pages/AffiliateDashboard';
import CouponsManagementPage from './pages/CouponsManagementPage';
import ProfilePage from './pages/ProfilePage';
import MexcTerminalPage from './MexcTerminalPage';
import KeysPage from './KeysPage';

// Gold Hub
import MetalsMarketPage from './pages/MetalsMarketPage';
import MetalsInventoryPage from './pages/MetalsInventoryPage';
import MetalsTradesPage from './pages/MetalsTradesPage';
import MetalTradeEntryPage from './pages/MetalTradeEntryPage';

import { ErrorBoundary } from './components/ErrorBoundary';

function PrivateAppWrapper() {
  const { 
    activeScreen, 
    lang 
  } = useApp();

  const [showOnboarding, setShowOnboarding] = React.useState(() => !localStorage.getItem('onboarding_complete_v4'));

  const renderScreen = () => {
    if (activeScreen === 'exchange-setup') return <ExchangeSetupPage />;
    if (activeScreen === 'strategy-factory') return <StrategyFactoryPage />;
    if (activeScreen === 'coin-portfolio') return <CoinPortfolioPage />;
    if (activeScreen === 'trade-entry') return <TradeEntryPage />;
    if (activeScreen === 'trade-history') return <TradesHistoryPage />;
    if (activeScreen === 'market-prices') return <MarketPricesPage />;
    if (activeScreen === 'wallet') return <WalletPage />;
    if (activeScreen === 'billing') return <BillingPage />;
    if (activeScreen === 'affiliate') return <AffiliateDashboard />;
    if (activeScreen === 'coupons-management') return <CouponsManagementPage />;
    if (activeScreen === 'system-logs') return <SystemLogsPage />;
    if (activeScreen === 'users-management') return <UsersManagementPage />;
    if (activeScreen === 'waitlist-management') return <WaitlistManagementPage />;
    if (activeScreen === 'overview') return <OverviewDashboardPage />;
    if (activeScreen === 'short-term') return <ShortTermDashboardPage />;
    if (activeScreen === 'long-term') return <LongTermDashboardPage />;
    if (activeScreen === 'strategy-comparison') return <StrategyComparisonPage />;
    if (activeScreen.startsWith('strategy-')) return <StrategyDashboardPage />;
    if (activeScreen === 'security-preview') return <SecurityPreviewPage />;
    if (activeScreen === 'profile') return <ProfilePage />;
    if (activeScreen === 'mexc-terminal') return <MexcTerminalPage />;
    if (activeScreen === 'mexc-keys') return <KeysPage />;
    
    // Gold Hub
    if (activeScreen === 'metals-market') return <MetalsMarketPage />;
    if (activeScreen === 'metals-inventory') return <MetalsInventoryPage />;
    if (activeScreen === 'metals-trades') return <MetalsTradesPage />;
    if (activeScreen === 'metal-trade-entry') return <MetalTradeEntryPage />;
    
    return <OverviewDashboardPage />;
  };

  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
      {showOnboarding && <WelcomeOnboarding onComplete={() => setShowOnboarding(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            {renderScreen()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function ProApp() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/*" element={
            <ErrorBoundary>
              <PrivateAppWrapper />
            </ErrorBoundary>
          } />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}
