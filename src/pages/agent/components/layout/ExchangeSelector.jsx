import React from 'react';

export default function ExchangeSelector({ activeExchange, setActiveExchange, balances }) {
  const exchanges = [
    { id: 'MEXC', label: 'MEXC' },
    { id: 'Binance', label: 'Binance' },
    { id: 'Bybit', label: 'Bybit' }
  ];

  return (
    <div style={{
      display: 'flex',
      background: 'rgba(11, 14, 20, 0.8)',
      padding: '4px',
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
      gap: '4px'
    }}>
      {exchanges.map((ex) => {
        const isActive = activeExchange === ex.id;
        const balance = balances[ex.id] || 0;

        return (
          <button
            key={ex.id}
            onClick={() => setActiveExchange(ex.id)}
            style={{
              padding: '6px 12px',
              minHeight: '36px',
              minWidth: '70px',
              borderRadius: '8px',
              border: 'none',
              background: isActive ? 'var(--accent-cyan)' : 'transparent',
              color: isActive ? 'var(--bg-main)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: '700'
            }}
          >
            <span style={{ fontSize: '11px' }}>{ex.label}</span>
            <span style={{
              fontSize: '9px',
              opacity: 0.8,
              marginTop: '1px',
              fontWeight: '500'
            }}>
              ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
