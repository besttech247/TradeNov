import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { NavigationTab } from '../../types';
import { 
  MessageSquareText,
  LayoutDashboard, 
  Bot, 
  ArrowLeftRight, 
  BrainCircuit, 
  LineChart, 
  Settings, 
  Key,
  ShieldCheck,
  FlaskConical,
  ChevronLeft,
  PieChart,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { PanicModal } from '../modals/PanicModal';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, mode, setMode } = useCryptoStore();
  const [isPanicOpen, setIsPanicOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
    { id: 'bots', label: 'إدارة البوتات', icon: Bot, badge: 'نشط' },
    { id: 'assistant', label: 'المساعد الذكي', icon: MessageSquareText },
    { id: 'exchanges', label: 'المنصات و APIs', icon: Key },
    { id: 'strategy', label: 'اختبار الاستراتيجيات', icon: BrainCircuit },
    { id: 'trading', label: 'التداول المباشر', icon: ArrowLeftRight },
    { id: 'analytics', label: 'التحليلات والتقارير', icon: LineChart },
    { id: 'settings', label: 'الإعدادات والأمان', icon: Settings },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 right-0 z-50 h-screen w-64 bg-white dark:bg-crypto-dark border-l border-jiade-border dark:border-crypto-border
        flex flex-col justify-between transition-colors duration-300 shadow-sm dark:shadow-none
        ${isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 space-y-4">
          {/* Logo Brand */}
          <div className="flex items-center justify-between pb-3 border-b border-jiade-border dark:border-crypto-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 border border-blue-500/30 flex items-center justify-center bg-crypto-dark">
                <img src="/tradenov-logo.svg" alt="Tradenov Pro Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-extrabold text-jiade-textMain dark:text-white tracking-wider text-base">TRADENOV PRO</h2>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">قناصة التداول الآلي 🎯</p>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Mode Switcher inside Sidebar (Live vs Demo) */}
          <div className="bg-jiade-cardSub dark:bg-crypto-card p-2 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-inner">
            <div className="text-[10px] font-extrabold text-jiade-textMuted dark:text-gray-400 px-1 pb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>وضع النظام</span>
              <span className={`w-2 h-2 rounded-full ${mode === 'real' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setMode('demo')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'demo'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>تجريبي</span>
              </button>

              <button
                onClick={() => setMode('real')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'real'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>حقيقي</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[11px] font-bold text-jiade-textMuted dark:text-gray-400 uppercase tracking-wider px-3 mb-2">القائمة الرئيسية</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition-all
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm' 
                      : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200 hover:bg-jiade-cardSub dark:hover:bg-crypto-card'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-jiade-textMuted dark:text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Emergency Panic Button & Status in Sidebar */}
        <div className="p-3 m-3 space-y-2">
          
          {/* Panic Emergency Button inside Sidebar */}
          <button
            onClick={() => setIsPanicOpen(true)}
            className="w-full p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center justify-between font-bold text-xs transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-500/20 group-hover:scale-110 transition-transform" />
              <span>زر الطوارئ والإغلاق</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-extrabold">Panic</span>
          </button>

          {/* Connection Security Note */}
          <div className="p-3 border border-jiade-border dark:border-crypto-border rounded-xl bg-jiade-cardSub dark:bg-crypto-card shadow-sm dark:shadow-none text-right">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${mode === 'real' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] font-bold text-jiade-textMain dark:text-gray-200">
                {mode === 'real' ? 'حساب حقيقي متصل' : 'بيئة تجريبية آمنة'}
              </span>
            </div>
            <p className="text-[10px] text-jiade-textMuted dark:text-gray-400 font-medium">
              مفاتيح الـ API مشفرة بالكامل لمنصة MEXC.
            </p>
          </div>

        </div>
      </aside>

      {/* Panic Modal Component */}
      <PanicModal 
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
      />
    </>
  );
};
