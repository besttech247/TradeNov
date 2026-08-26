import React, { useState } from 'react';
import { Play, Pause, Settings, DollarSign, Percent } from 'lucide-react';

export default function BotCardsGrid({ bots, onToggleBot, onUpdateTarget }) {
  const [editingBotId, setEditingBotId] = useState(null);
  const [tempTarget, setTempTarget] = useState('');

  const handleEditClick = (bot) => {
    setEditingBotId(bot.id);
    setTempTarget(bot.target.toString());
  };

  const handleSaveClick = (botId) => {
    onUpdateTarget(botId, parseFloat(tempTarget) || 0);
    setEditingBotId(null);
  };

  return (
    <section className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItem: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Trading Bots Manager</h3>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bots.length} Configured</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        width: '100%'
      }}>
        {bots.map((bot) => {
          const isRunning = bot.status === 'active';
          const isProfit = bot.pnl >= 0;

          return (
            <div
              key={bot.id}
              style={{
                background: 'rgba(11, 14, 20, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Bot Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>{bot.name}</h4>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{bot.strategy}</span>
                </div>
                <span className={`status-badge ${isRunning ? 'active' : 'paused'}`}>
                  {bot.status}
                </span>
              </div>

              {/* Stats & PnL */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(21, 27, 38, 0.4)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(35, 45, 63, 0.5)'
              }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Bot PnL</span>
                  <span style={{ fontSize: '14px', fontWeight: '700' }} className={isProfit ? 'profit-text' : 'loss-text'}>
                    {isProfit ? '+' : ''}${bot.pnl.toFixed(2)} ({isProfit ? '+' : ''}{bot.pnlPercent.toFixed(2)}%)
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Daily Target</span>
                  
                  {editingBotId === bot.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <input
                        type="number"
                        value={tempTarget}
                        onChange={(e) => setTempTarget(e.target.value)}
                        style={{
                          width: '60px',
                          height: '28px',
                          fontSize: '12px !important',
                          padding: '2px 4px',
                          textAlign: 'center'
                        }}
                      />
                      <button
                        onClick={() => handleSaveClick(bot.id)}
                        style={{
                          minHeight: '28px',
                          minWidth: '36px',
                          padding: '0 8px',
                          background: 'var(--accent-cyan)',
                          color: 'var(--bg-main)',
                          fontSize: '11px'
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ${bot.target}
                      </span>
                      <button
                        onClick={() => handleEditClick(bot)}
                        style={{
                          minWidth: '24px',
                          minHeight: '24px',
                          padding: 0,
                          background: 'transparent',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <Settings size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bot Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onToggleBot(bot.id)}
                  style={{
                    flex: 1,
                    minHeight: '38px',
                    background: isRunning ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isRunning ? 'var(--accent-loss)' : 'var(--accent-profit)',
                    border: `1px solid ${isRunning ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  {isRunning ? (
                    <>
                      <Pause size={14} /> Pause Bot
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Run Bot
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
