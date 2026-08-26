import React from 'react';
import { Home, Zap, Bot, Wallet, Settings } from 'lucide-react';

export default function BottomNavBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'trading', label: 'Trade', icon: Zap },
    { id: 'bots', label: 'Bots', icon: Bot },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bottom-nav-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              minWidth: 'auto',
              minHeight: 'auto',
              padding: '6px 0',
              flex: 1
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '9px', marginTop: '2px' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
