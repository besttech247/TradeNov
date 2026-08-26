import React from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { NavigationTab } from '../../types';
import { LayoutDashboard, Bot, Key, ArrowLeftRight, LineChart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useCryptoStore();

  const mobileTabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'bots', label: 'البوتات', icon: Bot },
    { id: 'exchanges', label: 'المنصات', icon: Key },
    { id: 'trading', label: 'التداول', icon: ArrowLeftRight },
    { id: 'analytics', label: 'التقارير', icon: LineChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-crypto-dark/95 backdrop-blur-md border-t border-jiade-border dark:border-crypto-border px-2 py-2 lg:hidden shadow-lg dark:shadow-none">
      <div className="flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
