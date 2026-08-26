import React, { useState } from 'react';
import { Key, Shield, Sun, Moon, ToggleLeft, HelpCircle } from 'lucide-react';

export default function SettingsPanel({ theme, toggleTheme }) {
  const [saveStatus, setSaveStatus] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState(5.5);
  const [leverageCap, setLeverageCap] = useState(20);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    setSaveStatus('Saving keys securely...');
    setTimeout(() => {
      setSaveStatus('API Keys Updated & Encrypted! (Mock)');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="dashboard-grid-overview animate-slide-up">
      {/* Title Header */}
      <div className="col-span-12">
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Platform Configuration</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure system limits, theme options, and exchange API keys.</p>
      </div>

      {/* 1. API Keys Connection Hub */}
      <div className="col-span-8 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Exchange API Settings</h3>
        </div>
        <form onSubmit={handleSaveKeys} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Binance API */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Binance API Key</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Binance API Secret</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* MEXC API */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>MEXC API Key</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>MEXC API Secret</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Bybit API */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Bybit API Key</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Bybit API Secret</span>
              <input type="password" value="••••••••••••••••••••••••" readOnly style={{ height: '38px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-profit)' }}>{saveStatus}</span>
            <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px' }}>
              Save Keys
            </button>
          </div>
        </form>
      </div>

      {/* 2. Platform Limits & Controls */}
      <div className="col-span-4 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Safety Parameters</h3>
        </div>

        {/* Max Drawdown Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
            <span>Max Drawdown Limit</span>
            <span style={{ color: 'var(--accent-loss)' }}>{maxDrawdown}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={maxDrawdown}
            onChange={(e) => setMaxDrawdown(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', background: 'var(--border-color)', outline: 'none' }}
          />
        </div>

        {/* Leverage Cap Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
            <span>Global Leverage Cap</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{leverageCap}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverageCap}
            onChange={(e) => setLeverageCap(parseInt(e.target.value))}
            style={{ width: '100%', height: '6px', background: 'var(--border-color)', outline: 'none' }}
          />
        </div>

        {/* Theme select button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>Switch Theme</span>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ height: '36px', gap: '8px', padding: '0 12px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} /> Light Theme
              </>
            ) : (
              <>
                <Moon size={14} /> Dark Theme
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Diagnostic Panel */}
      <div className="col-span-12 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800' }}>System Diagnostics</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          background: 'rgba(11, 14, 20, 0.4)',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <div>Core Engine Status: <span style={{ color: 'var(--accent-profit)' }}>Active</span></div>
          <div>UI Version: 1.5.0-Release</div>
          <div>Compiler Platform: Vite React JS</div>
          <div>Vite Host Port: localhost:5173</div>
          <div>Safe Area Insets Detection: <span style={{ color: 'var(--accent-cyan)' }}>Enabled</span></div>
          <div>System Build Date: {buildDate}</div>
        </div>
      </div>

    </div>
  );
}
