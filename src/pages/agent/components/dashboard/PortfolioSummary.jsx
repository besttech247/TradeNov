import React, { useState } from 'react';
import { Target, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';

export default function PortfolioSummary({
  activeExchange,
  balance,
  pnlToday,
  pnlPercent,
  dailyTarget,
  currentProgress,
  targetLocked,
  setTargetLocked
}) {
  const progressPercent = Math.min(100, Math.max(0, (currentProgress / dailyTarget) * 100));
  const isProfit = pnlToday >= 0;

  return (
    <section className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Portfolio & PnL Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activeExchange} Active Balance</span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0 0 0' }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PnL Today</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
            {isProfit ? <TrendingUp size={16} className="profit-text" /> : <TrendingDown size={16} className="loss-text" />}
            <span style={{ fontSize: '18px', fontWeight: '700' }} className={isProfit ? 'profit-text' : 'loss-text'}>
              {isProfit ? '+' : ''}${pnlToday.toFixed(2)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Daily Target Progress</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            ${currentProgress.toFixed(0)} / ${dailyTarget.toFixed(0)} ({progressPercent.toFixed(0)}%)
          </span>
        </div>

        {/* Progress bar line */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(35, 45, 63, 0.4)',
          borderRadius: '5px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          position: 'relative'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--accent-cyan), ${progressPercent >= 100 ? 'var(--accent-profit)' : 'rgba(56, 189, 248, 0.8)'})`,
            boxShadow: '0 0 8px var(--accent-cyan-glow)',
            borderRadius: '5px',
            transition: 'width 0.5s ease-out'
          }}></div>
        </div>
      </div>

      {/* Target Protection Auto Lock */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(11, 14, 20, 0.4)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} style={{ color: targetLocked ? 'var(--accent-profit)' : 'var(--text-secondary)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>Protected Target Auto-Lock</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Closes positions & stops bots if daily target is hit</div>
          </div>
        </div>
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
          <input
            type="checkbox"
            checked={targetLocked}
            onChange={(e) => setTargetLocked(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0, left: 0, right: 0, bottom: 0,
            background: targetLocked ? 'var(--accent-profit)' : 'var(--border-color)',
            transition: '.3s',
            borderRadius: '24px',
            boxShadow: targetLocked ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '18px', width: '18px',
              left: targetLocked ? '24px' : '3px',
              bottom: '3px',
              background: 'white',
              transition: '.3s',
              borderRadius: '50%'
            }}></span>
          </span>
        </label>
      </div>
    </section>
  );
}
