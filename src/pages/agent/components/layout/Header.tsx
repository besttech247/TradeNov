import React from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { 
  Bell, 
  RefreshCw, 
  Zap, 
  Menu,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    mode, 
    theme, 
    toggleTheme, 
    exchanges, 
    bots, 
    simulateMarketTick, 
    soundAlertsEnabled, 
    toggleSoundAlerts 
  } = useCryptoStore();

  const activeBots = bots.filter(b => b.mode === mode && b.status === 'active');
  const connectedExchanges = exchanges.filter(e => e.isConnected);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-crypto-dark/95 backdrop-blur-md border-b border-jiade-border dark:border-crypto-border px-4 lg:px-8 py-3 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-4">
        
        {/* Mobile menu trigger & title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 border border-blue-500/30 flex items-center justify-center bg-crypto-dark">
              <img src="/tradenov-logo.svg" alt="Tradenov Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-bold text-jiade-textMain dark:text-white tracking-wide flex items-center gap-2">
                <span>TRADENOV PRO</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hidden sm:inline-block">
                  MEXC Sniper Terminal
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Active Status Badge */}
          <div className="hidden md:flex items-center gap-3 text-xs bg-jiade-cardSub dark:bg-crypto-card px-3 py-1.5 rounded-xl border border-jiade-border dark:border-crypto-border">
            <div className="flex items-center gap-1.5 text-jiade-textMuted dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>المنصات: <strong className="text-jiade-textMain dark:text-white">{connectedExchanges.length}</strong></span>
            </div>
            <span className="text-jiade-border dark:text-crypto-border">|</span>
            <div className="flex items-center gap-1.5 text-jiade-textMuted dark:text-gray-300">
              <span>البوتات النشطة: <strong className="text-emerald-600 dark:text-emerald-400">{activeBots.length}</strong></span>
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSoundAlerts}
            title={soundAlertsEnabled ? 'تنبيهات الأصوات مفعلة' : 'الأصوات مكتومة'}
            className="p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-card hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-xl transition-all shadow-sm"
          >
            {soundAlertsEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح (Light Mode)' : 'التبديل إلى الوضع الداكن (Dark Mode)'}
            className="p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-card hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-xl transition-all shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Trigger simulator */}
          <button 
            onClick={simulateMarketTick}
            title="تحديث البيانات فورياً"
            className="p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-card hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification Button */}
          <button className="relative p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-card hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-xl transition-all shadow-sm">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2 border-r border-jiade-border dark:border-crypto-border pr-3 mr-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              M
            </div>
          </div>
        </div>

      </div>

      {/* Demo Mode Banner Warning */}
      {mode === 'demo' && (
        <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
          <span>أنت الآن في **النظام التجريبي (Paper Trading)** - جميع التداولات وهمية لا تؤثر على أموالك الحقيقية.</span>
        </div>
      )}
    </header>
  );
};
