import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Factory,
  Coins,
  PlusCircle,
  BarChart3,
  Zap,
  Gem,
  Target,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  LineChart,
  History,
  Globe,
  ShieldAlert,
  Users,
  Wallet,
  CreditCard,
  Megaphone,
  Tag,
  Activity,
  Briefcase,
  PieChart,
  Settings,
  Shield,
  Database,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';

export default function Sidebar() {
  const { activeScreen, setActiveScreen, setSelectedStrategyId, strategies, t, lang, isSidebarCollapsed, toggleSidebar, activeWorkspace, setActiveWorkspace, platformMode } = useApp();
  const { user } = useAuth();
  const isRtl = lang === 'ar';
  
  // Keep only dashboards open by default
  const [expandedGroups, setExpandedGroups] = useState({ dashboards: true });

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStrategyClick = (stratId) => {
    setSelectedStrategyId(stratId);
    setActiveScreen(`strategy-${stratId}`);
  };

  // Reports Group Items (Strategy Comparison + Dynamic Strategy Dashboards + Short/Long Term)
  const reportsItems = [
    { id: 'strategy-comparison', label: t('navStrategyComparison'), icon: LineChart, onClick: () => setActiveScreen('strategy-comparison') },
    { id: 'short-term', label: t('navShortTerm'), icon: Zap, onClick: () => setActiveScreen('short-term') },
    { id: 'long-term', label: t('navLongTerm'), icon: Gem, onClick: () => setActiveScreen('long-term') },
  ];
  
  strategies.forEach(strat => {
    // Only show strategy if it matches the current workspace, or if strategy doesn't have market_type yet
    if ((strat.market_type || 'crypto') === activeWorkspace) {
      reportsItems.push({
        id: `strategy-${strat.id}`,
        label: strat.name,
        icon: Target,
        isStrategy: true,
        category: strat.category,
        onClick: () => handleStrategyClick(strat.id)
      });
    }
  });

  // Common Settings & Admin Group
  const settingsGroup = {
    id: 'settings',
    title: isRtl ? 'الإعدادات والأمان' : 'Settings & Security',
    icon: Settings,
    items: [
      { id: 'profile', label: isRtl ? 'الملف الشخصي' : 'Profile', icon: User, onClick: () => setActiveScreen('profile') },
      { id: 'mexc-keys', label: isRtl ? 'مفاتيح المنصات (API)' : 'API Keys', icon: ShieldCheck, onClick: () => setActiveScreen('mexc-keys') },
      { id: 'security-preview', label: t('navSecurityPreview'), icon: ShieldCheck, onClick: () => setActiveScreen('security-preview') },
      { id: 'billing', label: isRtl ? 'الاشتراك والفواتير' : 'Billing', icon: CreditCard, onClick: () => setActiveScreen('billing') },
      { id: 'affiliate', label: isRtl ? 'التسويق بالعمولة' : 'Affiliate', icon: Megaphone, onClick: () => setActiveScreen('affiliate') },
    ]
  };

  const adminGroup = user?.is_superadmin ? {
    id: 'admin',
    title: isRtl ? 'الإدارة' : 'Admin',
    icon: Shield,
    items: [
      { id: 'users-management', label: isRtl ? 'إدارة المستخدمين' : 'Users Mgt', icon: Users, onClick: () => setActiveScreen('users-management') },
      { id: 'waitlist-management', label: isRtl ? 'قائمة الانتظار' : 'Waitlist', icon: Mail, onClick: () => setActiveScreen('waitlist-management') },
      { id: 'coupons-management', label: isRtl ? 'إدارة الكوبونات' : 'Coupons', icon: Tag, onClick: () => setActiveScreen('coupons-management') },
      { id: 'system-logs', label: isRtl ? 'سجل النظام (Admin)' : 'System Logs', icon: ShieldAlert, onClick: () => setActiveScreen('system-logs') },
    ]
  } : null;

  // Crypto Mode Groups
  const cryptoNavGroups = [
    {
      id: 'dashboards',
      title: isRtl ? 'مركز التداول 🪙' : 'Crypto Hub',
      icon: Activity,
      items: [
        { id: 'overview', label: isRtl ? 'نظرة عامة' : 'Overview', icon: BarChart3, onClick: () => setActiveScreen('overview') },
        { id: 'market-prices', label: isRtl ? 'أسعار السوق الحية' : 'Live Markets', icon: Globe, onClick: () => setActiveScreen('market-prices') },
        { id: 'mexc-terminal', label: isRtl ? 'منصة التداول (MEXC)' : 'MEXC Terminal', icon: Activity, onClick: () => setActiveScreen('mexc-terminal') },
        { id: 'trade-entry', label: isRtl ? 'صفقة جديدة' : 'New Trade', icon: PlusCircle, highlight: true, onClick: () => setActiveScreen('trade-entry') },
        { id: 'coin-portfolio', label: isRtl ? 'إدارة الصفقات' : 'Manage Trades', icon: Briefcase, onClick: () => setActiveScreen('coin-portfolio') },
        { id: 'trade-history', label: isRtl ? 'سجل الصفقات' : 'Trades History', icon: History, onClick: () => setActiveScreen('trade-history') },
      ]
    },
    {
      id: 'assets',
      title: isRtl ? 'الأرصدة والمحافظ' : 'Balances & Wallets',
      icon: Wallet,
      items: [
        { id: 'exchange-setup', label: isRtl ? 'مركز الأرصدة (منصات ومحافظ)' : 'Balances Hub (Exchanges)', icon: Building2, onClick: () => setActiveScreen('exchange-setup') },
        { id: 'wallet', label: isRtl ? 'التحويلات' : 'Transfers', icon: ArrowRight, onClick: () => setActiveScreen('wallet') },
      ]
    },
    {
      id: 'planning',
      title: isRtl ? 'خطط واستثمار' : 'Plans & Investment',
      icon: Target,
      items: [
        { id: 'strategy-factory', label: isRtl ? 'مركز الاستراتيجيات' : 'Strategies Center', icon: Factory, onClick: () => setActiveScreen('strategy-factory') },
        { id: 'notifications', label: isRtl ? 'الإشعارات والتنبيهات (قريباً)' : 'Alerts (Soon)', icon: Zap, onClick: () => {} },
      ]
    },
    {
      id: 'reports',
      title: isRtl ? 'أرقام وتقارير' : 'Numbers & Reports',
      icon: LineChart,
      items: reportsItems
    },
    settingsGroup,
    ...(adminGroup ? [adminGroup] : [])
  ];

  // Metals Mode Groups
  const metalsNavGroups = [
    {
      id: 'dashboards',
      title: isRtl ? 'مركز الذهب 🥇' : 'Gold Hub 🥇',
      icon: Gem,
      items: [
        { id: 'metals-market', label: isRtl ? 'سوق الذهب والمعادن' : 'Gold & Metals Market', icon: Globe, onClick: () => setActiveScreen('metals-market') },
        { id: 'metals-inventory', label: isRtl ? 'مخزن الذهب' : 'Gold Vault', icon: Database, onClick: () => setActiveScreen('metals-inventory') },
        { id: 'metal-trade-entry', label: isRtl ? 'صفقة جديدة' : 'New Transaction', icon: PlusCircle, highlight: true, onClick: () => setActiveScreen('metal-trade-entry') },
        { id: 'metals-trades', label: isRtl ? 'إدارة الصفقات والسجل' : 'Manage & History', icon: History, onClick: () => setActiveScreen('metals-trades') },
      ]
    },
    {
      id: 'assets',
      title: isRtl ? 'الأرصدة والمخازن' : 'Balances & Vaults',
      icon: ShieldCheck,
      items: [
        { id: 'exchange-setup', label: isRtl ? 'مركز الأرصدة (الخزائن والتجار)' : 'Balances Hub (Vaults)', icon: Building2, onClick: () => setActiveScreen('exchange-setup') },
        { id: 'transfers', label: isRtl ? 'التحويلات' : 'Transfers', icon: ArrowRight, onClick: () => setActiveScreen('wallet') },
      ]
    },
    {
      id: 'planning',
      title: isRtl ? 'خطط واستثمار' : 'Plans & Investment',
      icon: Target,
      items: [
        { id: 'strategy-factory', label: isRtl ? 'مركز الاستراتيجيات' : 'Strategies Center', icon: Factory, onClick: () => setActiveScreen('strategy-factory') },
        { id: 'notifications', label: isRtl ? 'الإشعارات والتنبيهات (قريباً)' : 'Alerts (Soon)', icon: Zap, onClick: () => {} },
      ]
    },
    {
      id: 'reports',
      title: isRtl ? 'أرقام وتقارير' : 'Numbers & Reports',
      icon: LineChart,
      items: reportsItems
    },
    settingsGroup,
    ...(adminGroup ? [adminGroup] : [])
  ];

  const activeGroups = activeWorkspace === 'metals' ? metalsNavGroups : cryptoNavGroups;

  return (
    <>
      {/* Mobile Backdrop overlay when expanded */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={`glass-panel flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out
          fixed md:sticky top-0 z-40 
          ${isSidebarCollapsed 
            ? (isRtl ? 'translate-x-full md:translate-x-0 md:w-20' : '-translate-x-full md:translate-x-0 md:w-20') 
            : 'w-72 translate-x-0'
          }
          ${isRtl ? 'border-l border-white/10 right-0' : 'border-r border-white/10 left-0'}
        `}
      >
        {/* Top Header & Brand */}
        <div className={`p-4 border-b border-white/10 flex flex-col gap-2 shrink-0 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                activeWorkspace === 'metals' 
                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-600 shadow-amber-500/20'
                : 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-cyan-500/20'
              }`}>
                {activeWorkspace === 'metals' ? <Gem className="w-6 h-6 text-white" /> : <Coins className="w-6 h-6 text-white" />}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold text-white tracking-wide leading-tight truncate">
                    {activeWorkspace === 'metals' ? (lang === 'ar' ? 'مركز الذهب' : 'Gold Hub') : t('appTitle')}
                  </h1>
                  <p className={`text-[11px] font-mono tracking-wider mt-0.5 truncate ${activeWorkspace === 'metals' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {activeWorkspace === 'metals' ? (lang === 'ar' ? 'إدارة الثروات المعدنية' : 'Precious Metals') : t('appVersion')}
                  </p>
                </div>
              )}
            </div>

            {/* Internal Toggle Button */}
            {!isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Collapse Sidebar"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Strict Spot Only Banner */}
          {!isSidebarCollapsed ? (
            <div className={`mt-2 px-3 py-1.5 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold ${
              activeWorkspace === 'metals' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping shrink-0 ${activeWorkspace === 'metals' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              <span className="truncate">{activeWorkspace === 'metals' ? (lang === 'ar' ? 'شراء مادي حقيقي' : 'Physical Spot') : t('spotOnlyBadge')}</span>
            </div>
          ) : (
            <div className={`mt-1 w-2 h-2 rounded-full animate-ping ${activeWorkspace === 'metals' ? 'bg-amber-400' : 'bg-cyan-400'}`} title={t('spotOnlyBadge')}></div>
          )}

          {/* Workspace Toggle Header */}
          {platformMode === 'both' && (
          <div className="mt-4 flex bg-black/40 p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setActiveWorkspace('crypto'); setActiveScreen('overview'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                activeWorkspace === 'crypto' 
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
              title={lang === 'ar' ? 'مركز الكريبتو' : 'Crypto Hub'}
            >
              <Coins className="w-4 h-4" />
              {!isSidebarCollapsed && (lang === 'ar' ? 'كريبتو' : 'Crypto')}
            </button>
            <button
              onClick={() => { setActiveWorkspace('metals'); setActiveScreen('metals-market'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                activeWorkspace === 'metals' 
                ? 'bg-amber-500/20 text-amber-300 shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
              title={lang === 'ar' ? 'مركز الذهب' : 'Gold Hub'}
            >
              <Gem className="w-4 h-4" />
              {!isSidebarCollapsed && (lang === 'ar' ? 'ذهب' : 'Gold')}
            </button>
          </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {activeGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.id} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <GroupIcon className={`w-4 h-4 ${activeWorkspace === 'metals' ? 'text-amber-500' : 'text-cyan-500'}`} />
                      <span>{group.title}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedGroups[group.id] === true ? (isRtl ? '-rotate-90' : 'rotate-90') : ''
                      }`} 
                    />
                  </button>
                ) : (
                  <div className="h-2"></div>
                )}
                
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${(!isSidebarCollapsed && !expandedGroups[group.id]) ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onClick();
                          if (window.innerWidth < 768 && !isSidebarCollapsed) {
                            toggleSidebar();
                          }
                        }}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                        } rounded-xl text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? item.isStrategy 
                                ? (activeWorkspace === 'metals' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold')
                                : (activeWorkspace === 'metals' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10 font-bold' : 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-bold')
                            : item.highlight
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? (item.isStrategy ? (activeWorkspace === 'metals' ? 'text-amber-400' : 'text-indigo-400') : (activeWorkspace === 'metals' ? 'text-amber-400' : 'text-cyan-400')) : item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                          {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        
                        {!isSidebarCollapsed && item.highlight && (
                          <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-black font-extrabold rounded-full shrink-0 animate-pulse">
                            NEW
                          </span>
                        )}

                        {!isSidebarCollapsed && item.isStrategy && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            item.category === 'Short-Term' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {item.category === 'Short-Term' ? 'ST' : 'LT'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Build Version / Timestamp */}
        <div className="p-2 border-t border-white/5 mt-auto text-center">
          <p className="text-xs text-gray-500 font-mono tracking-wide opacity-60 hover:opacity-100 transition-opacity">
            {typeof __BUILD_DATE__ !== 'undefined' ? `v${__BUILD_DATE__}` : 'DEV'}
          </p>
        </div>
      </aside>
    </>
  );
}
