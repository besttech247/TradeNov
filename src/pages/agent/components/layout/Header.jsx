import React, { useState } from 'react';
import { Bell, Sun, Moon, Search, User, CheckCircle2, ShieldAlert } from 'lucide-react';
import ExchangeSelector from './ExchangeSelector';

export default function Header({
  activeExchange,
  setActiveExchange,
  balances,
  combinedBalance,
  theme,
  toggleTheme
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const mockNotifications = [
    { id: 1, type: 'success', text: 'Binance API connected successfully', time: '2m ago' },
    { id: 2, type: 'warning', text: 'Daily profit target close to 80%', time: '15m ago' },
    { id: 3, type: 'error', text: 'SOL Momentum bot safety limit triggered', time: '1h ago' }
  ];

  return (
    <header className="glass-card" style={{
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      padding: '14px 24px',
      marginBottom: '20px',
      position: 'relative'
    }}>
      {/* Search Input (Desktop) */}
      <div className="header-search-container" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '240px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search coin, bot, order..."
          style={{
            paddingLeft: '36px',
            height: '38px',
            fontSize: '13px !important',
            width: '100%'
          }}
        />
      </div>

      {/* Combined Capital Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
          Combined Capital
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            ${combinedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700' }}>USD</span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        {/* Exchange Selector */}
        <ExchangeSelector
          activeExchange={activeExchange}
          setActiveExchange={setActiveExchange}
          balances={balances}
        />

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          style={{
            minWidth: '38px',
            minHeight: '38px',
            width: '38px',
            height: '38px',
            background: 'var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '50%',
            padding: 0
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              minWidth: '38px',
              minHeight: '38px',
              width: '38px',
              height: '38px',
              background: 'var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              padding: 0,
              position: 'relative'
            }}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-loss)'
            }}></span>
          </button>

          {showNotifications && (
            <div className="glass-card animate-slide-up" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '280px',
              zIndex: 1002,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card-solid)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                System Alerts
              </div>
              {mockNotifications.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11px' }}>
                  {item.type === 'success' ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--accent-profit)', flexShrink: 0 }} />
                  ) : (
                    <ShieldAlert size={14} style={{ color: item.type === 'warning' ? '#F59E0B' : 'var(--accent-loss)', flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.text}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--border-color)',
          padding: '4px 12px 4px 6px',
          borderRadius: '24px',
          height: '38px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: '800',
            fontSize: '12px'
          }}>
            M
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }} className="header-username">
            Admin
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .header-search-container, .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
