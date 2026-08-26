import React from 'react';
import { Home, Zap, Bot, Wallet, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'trading', label: 'Trading Terminal', icon: Zap },
    { id: 'bots', label: 'Bots Hub', icon: Bot },
    { id: 'wallet', label: 'Wallet & Assets', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Maestro<span style={{ color: 'var(--text-primary)' }}>X</span>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Platform v1.5.0
      </div>
    </aside>
  );
}
