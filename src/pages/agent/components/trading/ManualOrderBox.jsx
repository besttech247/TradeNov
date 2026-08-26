import React, { useState } from 'react';
import { DollarSign, ShieldAlert, ArrowDownUp } from 'lucide-react';

export default function ManualOrderBox({ activeExchange, balance, onExecuteOrder }) {
  const [allocation, setAllocation] = useState(25); // default 25%
  const [useBracket, setUseBracket] = useState(false);
  const [takeProfit, setTakeProfit] = useState(2.0); // 2%
  const [stopLoss, setStopLoss] = useState(1.0); // 1%
  const [useTrailing, setUseTrailing] = useState(false);
  const [trailingDistance, setTrailingDistance] = useState(0.5); // 0.5%
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [orderAmount, setOrderAmount] = useState('');

  // Calculate quick amount based on allocation percentage
  const handlePercentClick = (pct) => {
    setAllocation(pct);
    const amount = (balance * (pct / 100)).toFixed(2);
    setOrderAmount(amount);
  };

  const handleOrder = (side) => {
    const finalAmount = parseFloat(orderAmount) || 0;
    if (finalAmount <= 0) {
      alert("Please enter a valid order amount!");
      return;
    }
    if (finalAmount > balance) {
      alert("Amount exceeds active balance!");
      return;
    }

    onExecuteOrder({
      symbol,
      side,
      amount: finalAmount,
      allocationPercent: allocation,
      bracket: useBracket ? {
        takeProfit,
        stopLoss,
        trailing: useTrailing ? trailingDistance : null
      } : null
    });
  };

  return (
    <section className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Instant Manual Trading
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
          {activeExchange} Active
        </span>
      </div>

      {/* Symbol & Amount Inputs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Trading Pair</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ width: '100%', height: '44px' }}
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="LINKUSDT">LINK/USDT</option>
          </select>
        </div>
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Order Size (USD)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>$</span>
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', paddingLeft: '24px', height: '44px' }}
            />
          </div>
        </div>
      </div>

      {/* Quick Allocations */}
      <div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          Quick Capital Allocation
        </span>
        <div className="quick-trade-grid">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              className={`btn-allocation ${allocation === pct ? 'active' : ''}`}
              onClick={() => handlePercentClick(pct)}
              style={{ height: '36px', minWidth: 'auto', minHeight: 'auto' }}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Auto-Bracket System */}
      <div style={{
        background: 'rgba(11, 14, 20, 0.4)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ color: useBracket ? 'var(--accent-cyan)' : 'var(--text-secondary)' }} />
            <span style={{ fontSize: '12px', fontWeight: '700' }}>Auto-Bracket (TP/SL)</span>
          </div>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px' }}>
            <input
              type="checkbox"
              checked={useBracket}
              onChange={(e) => setUseBracket(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0, left: 0, right: 0, bottom: 0,
              background: useBracket ? 'var(--accent-cyan)' : 'var(--border-color)',
              transition: '.3s',
              borderRadius: '20px'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '14px', width: '14px',
                left: useBracket ? '21px' : '3px',
                bottom: '3px',
                background: 'white',
                transition: '.3s',
                borderRadius: '50%'
              }}></span>
            </span>
          </label>
        </div>

        {useBracket && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(35, 45, 63, 0.5)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Take Profit %</span>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', height: '36px', padding: '6px 8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Stop Loss %</span>
                <input
                  type="number"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', height: '36px', padding: '6px 8px', marginTop: '4px' }}
                />
              </div>
            </div>

            {/* Trailing Stop Option */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enable Trailing Stop</span>
              <input
                type="checkbox"
                checked={useTrailing}
                onChange={(e) => setUseTrailing(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
            </div>

            {useTrailing && (
              <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trailing Distance %</span>
                <input
                  type="number"
                  step="0.05"
                  value={trailingDistance}
                  onChange={(e) => setTrailingDistance(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', height: '36px', padding: '6px 8px' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buy & Sell Execute Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={() => handleOrder('BUY')}
          className="btn-buy"
          style={{ flex: 1, height: '48px', fontSize: '15px' }}
        >
          Market BUY
        </button>
        <button
          onClick={() => handleOrder('SELL')}
          className="btn-sell"
          style={{ flex: 1, height: '48px', fontSize: '15px' }}
        >
          Market SELL
        </button>
      </div>
    </section>
  );
}
