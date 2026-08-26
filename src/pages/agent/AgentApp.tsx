import React, { useState, useEffect } from 'react';
import { useCryptoStore } from './store/useCryptoStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Tab Views
import { OverviewTab } from './components/dashboard/OverviewTab';
import { BotsManagerTab } from './components/bots/BotsManagerTab';
import { ExchangesTab } from './components/exchanges/ExchangesTab';
import { StrategyTesterTab } from './components/strategy/StrategyTesterTab';
import { LiveTradingTab } from './components/trading/LiveTradingTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { SettingsTab } from './components/settings/SettingsTab';
import AssistantChat from './components/dashboard/AssistantChat';

export const App: React.FC = () => {
  const { activeTab, simulateMarketTick } = useCryptoStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live real-time market simulator interval (updates live PnL and trade events)
  useEffect(() => {
    const interval = setInterval(() => {
      simulateMarketTick();
    }, 3500);

    return () => clearInterval(interval);
  }, [simulateMarketTick]);

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'bots':
        return <BotsManagerTab />;
      case 'exchanges':
        return <ExchangesTab />;
      case 'strategy':
        return <StrategyTesterTab />;
      case 'trading':
        return <LiveTradingTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'assistant':
        return <AssistantChat />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-jiade-bg dark:bg-crypto-dark text-jiade-textMain dark:text-gray-100 flex flex-col antialiased font-sans transition-colors">
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Sidebar */}
        <Sidebar 
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <Header 
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentTab()}
          </main>

        </div>

      </div>

      {/* Mobile Bottom Dock */}
      <MobileNav />
    </div>
  );
};

export default App;
