import React from 'react';
import { XCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function ActivePositions({ positions, onClosePosition }) {
  if (positions.length === 0) {
    return (
      <section className="glass-card animate-slide-up" style={{ textAlign: 'center', padding: '32px 16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active positions found.</p>
      </section>
    );
  }

  return (
    <section className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Active Positions</h3>
        <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
          {positions.length} Positions
        </span>
      </div>

      {/* 🖥️ Desktop View (Table Layout) */}
      <div className="desktop-only-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13px'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px 8px' }}>Symbol</th>
              <th style={{ padding: '10px 8px' }}>Side</th>
              <th style={{ padding: '10px 8px' }}>Entry Price</th>
              <th style={{ padding: '10px 8px' }}>Mark Price</th>
              <th style={{ padding: '10px 8px' }}>Size</th>
              <th style={{ padding: '10px 8px' }}>PnL (Unrealized)</th>
              <th style={{ padding: '10px 8px' }}>Bracket Status</th>
              <th style={{ padding: '10px 8px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const isProfit = pos.pnl >= 0;
              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid rgba(35, 45, 63, 0.3)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '700', color: '#FFF' }}>{pos.symbol}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      color: pos.side === 'BUY' ? 'var(--accent-profit)' : 'var(--accent-loss)',
                      fontWeight: '700',
                      background: pos.side === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {pos.side}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>${pos.entryPrice.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>${pos.markPrice.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{pos.size} {pos.symbol.replace('USDT', '')}</td>
                  <td style={{ padding: '12px 8px', fontWeight: '700' }} className={isProfit ? 'profit-text' : 'loss-text'}>
                    {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                    {pos.bracket ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-cyan)' }}>
                        <Target size={12} /> TP: {pos.bracket.takeProfit}% / SL: {pos.bracket.stopLoss}%
                      </span>
                    ) : 'None'}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => onClosePosition(pos.id)}
                      className="btn-danger"
                      style={{
                        minHeight: '32px',
                        padding: '0 8px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        color: 'var(--accent-loss)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile View (Card Layout) */}
      <div className="mobile-only-cards-wrapper" style={{ display: 'none', flexDirection: 'column', gap: '10px' }}>
        {positions.map((pos) => {
          const isProfit = pos.pnl >= 0;
          return (
            <div
              key={pos.id}
              style={{
                background: 'rgba(11, 14, 20, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#FFF' }}>{pos.symbol}</span>
                  <span style={{
                    color: pos.side === 'BUY' ? 'var(--accent-profit)' : 'var(--accent-loss)',
                    fontWeight: '700',
                    background: pos.side === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {pos.side}
                  </span>
                </div>
                
                {/* Instant Close Button */}
                <button
                  onClick={() => onClosePosition(pos.id)}
                  style={{
                    minHeight: '36px',
                    minWidth: '36px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(244, 63, 94, 0.1)',
                    color: 'var(--accent-loss)',
                    padding: 0
                  }}
                  title="Close Position"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Card Body Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}>
                <div>Size: <span style={{ color: '#FFF', fontWeight: '600' }}>{pos.size}</span></div>
                <div>Entry: <span style={{ color: '#FFF', fontWeight: '600' }}>${pos.entryPrice.toLocaleString()}</span></div>
                <div>Mark: <span style={{ color: '#FFF', fontWeight: '600' }}>${pos.markPrice.toLocaleString()}</span></div>
                <div>
                  PnL: <span className={isProfit ? 'profit-text' : 'loss-text'} style={{ fontWeight: '700' }}>
                    {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                  </span>
                </div>
              </div>

              {pos.bracket && (
                <div style={{
                  background: 'rgba(21, 27, 38, 0.5)',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Target size={10} /> TP: {pos.bracket.takeProfit}% | SL: {pos.bracket.stopLoss}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Styled Responsive overrides using standard inline styles and style tag inside react */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-only-table-wrapper {
            display: none !important;
          }
          .mobile-only-cards-wrapper {
            display: flex !important;
          }
        }
      `}</style>
    </section>
  );
}
