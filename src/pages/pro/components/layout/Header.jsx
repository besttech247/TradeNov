import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Radio, Wallet, PanelLeftClose, PanelLeftOpen, Sun, Moon, Eye, EyeOff, Timer, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { lang, toggleLanguage, theme, toggleTheme, t, activeScreen, priceSource, isFetchingPrices, overviewMetrics, isSidebarCollapsed, toggleSidebar } = useApp();
  const { user, logout } = useAuth();

  const [showBalance, setShowBalance] = useState(() => localStorage.getItem('show_balance') !== 'false');
  const [countdown, setCountdown] = useState(30);

  const isDark = theme === 'dark';
  const isRtl = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('show_balance', showBalance);
  }, [showBalance]);

  useEffect(() => {
    if (isFetchingPrices) {
      setCountdown(30);
    } else {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFetchingPrices]);

  const getScreenTitle = () => {
    if (activeScreen === 'overview') return t('overviewTitle');
    if (activeScreen === 'exchange-setup') return t('exchangeSetupTitle');
    if (activeScreen === 'strategy-factory') return t('strategyFactoryTitle');
    if (activeScreen === 'coin-portfolio') return t('coinPortfolioTitle');
    if (activeScreen === 'trade-entry') return t('tradeEntryTitle');
    if (activeScreen === 'market-prices') return t('marketPricesTitle');
    if (activeScreen === 'short-term') return t('shortTermTitle');
    if (activeScreen === 'long-term') return t('longTermTitle');
    if (activeScreen === 'strategy-comparison') return t('comparisonTitle');
    if (activeScreen.startsWith('strategy-')) return t('navDynamicStrategy');
    if (activeScreen === 'security-preview') return t('securityPreviewTitle');
    if (activeScreen === 'wallet') return isRtl ? 'المحفظة والتحويلات' : 'Wallet';
    if (activeScreen === 'billing') return isRtl ? 'الاشتراك والفواتير' : 'Billing';
    if (activeScreen === 'affiliate') return isRtl ? 'التسويق بالعمولة' : 'Affiliate';
    if (activeScreen === 'coupons-management') return isRtl ? 'إدارة الكوبونات' : 'Coupons';
    if (activeScreen === 'users-management') return isRtl ? 'إدارة المستخدمين' : 'Users Management';
    if (activeScreen === 'system-logs') return isRtl ? 'سجل النظام' : 'System Logs';
    return t('appTitle');
  };

  return (
    <header 
      className={`h-16 md:h-20 border-b backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-950/85 border-white/10 shadow-lg shadow-cyan-950/10' 
          : 'bg-white/90 border-slate-200/80 shadow-md shadow-slate-200/40 text-slate-900'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Left Section: Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-4 truncate min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className={`p-2.5 rounded-xl border transition-all duration-200 shrink-0 shadow-xs active:scale-95 ${
            isDark 
              ? 'bg-slate-900/80 border-white/10 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40' 
              : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600'
          }`}
          title={isSidebarCollapsed ? 'Expand Sidebar / إظهار القائمة' : 'Collapse Sidebar / إخفاء القائمة'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <div className="flex items-center gap-2 truncate min-w-0">
          <h2 className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {getScreenTitle()}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            V4.0
          </span>
        </div>
      </div>

      {/* Right Section: Live Ticker, Portfolio, Quick Toggles & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Portfolio Value Summary Badge */}
        <div 
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
            overviewMetrics.hasNegativeCash 
              ? isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
              : isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
          title={overviewMetrics.hasNegativeCash ? `⚠️ Unlogged Deposit: $${overviewMetrics.unloggedDepositAmount.toLocaleString()}` : ''}
        >
          <Wallet className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
            overviewMetrics.hasNegativeCash ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')
          }`} />
          <div className="flex items-center gap-1">
            <span className={isDark ? 'text-slate-400 hidden xl:inline' : 'text-slate-600 hidden xl:inline'}>{t('portfolioSummaryLabel')}</span>
            <span className={`font-mono text-xs sm:text-sm font-black ${
              overviewMetrics.hasNegativeCash ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-emerald-400' : 'text-emerald-700')
            }`} dir="ltr">
              {showBalance 
                ? `$${overviewMetrics.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '••••••••'}
            </span>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className={`p-1 rounded-lg transition-colors ${
              overviewMetrics.hasNegativeCash 
                ? isDark ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-amber-100 text-amber-700'
                : isDark ? 'hover:bg-emerald-500/20 text-emerald-400' : 'hover:bg-emerald-100 text-emerald-700'
            }`}
            title="Toggle Balance Visibility"
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Controls Capsule (Theme & Language) */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-slate-100 border-slate-200/90 shadow-2xs'}`}>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-all ${
              isDark ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-slate-200/80'
            }`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className={`h-4 w-px mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`}></div>

          <button
            onClick={toggleLanguage}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-sans uppercase text-[11px] font-extrabold">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>

        {/* User Profile & Logout Section */}
        <div className="flex items-center gap-1.5 border-r dark:border-white/10 border-slate-200 pr-1.5 sm:pr-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="font-sans truncate max-w-[100px]">{user?.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-all duration-200 active:scale-95 shrink-0"
            title="Logout / تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}

