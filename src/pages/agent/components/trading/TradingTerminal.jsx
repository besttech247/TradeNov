import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Settings } from 'lucide-react';
import ManualOrderBox from './ManualOrderBox';
import ActivePositions from '../positions/ActivePositions';

export default function TradingTerminal({
  activeExchange,
  balance,
  onExecuteOrder,
  positions,
  onClosePosition
}) {
  const [timeframe, setTimeframe] = useState('15m');
  const [livePrice, setLivePrice] = useState(59840.00);
  const [priceChange, setPriceChange] = useState(1.48);
  const [orderBook, setOrderBook] = useState({
    asks: [
      { price: 59880.0, size: 0.42, total: 0.42, percent: 30 },
      { price: 59870.0, size: 1.15, total: 1.57, percent: 75 },
      { price: 59860.0, size: 0.85, total: 2.42, percent: 55 },
      { price: 59850.0, size: 0.38, total: 2.80, percent: 25 }
    ],
    bids: [
      { price: 59830.0, size: 0.72, total: 0.72, percent: 45 },
      { price: 59820.0, size: 0.54, total: 1.26, percent: 35 },
      { price: 59810.0, size: 1.82, total: 3.08, percent: 90 },
      { price: 59800.0, size: 0.65, total: 3.73, percent: 40 }
    ]
  });

  // Simulating live price fluctuations and order book modifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate live price
      const tick = (Math.random() - 0.49) * 20;
      const newPrice = Math.max(1000, livePrice + tick);
      setLivePrice(parseFloat(newPrice.toFixed(2)));

      // Shift orderbook values slightly to look alive
      setOrderBook((prev) => {
        const updateRow = (row) => {
          return row.map((item) => {
            const sizeChange = (Math.random() - 0.5) * 0.1;
            const size = Math.max(0.01, item.size + sizeChange);
            return {
              ...item,
              size: parseFloat(size.toFixed(2)),
              percent: Math.min(100, Math.max(5, item.percent + (Math.random() - 0.5) * 10))
            };
          });
        };
        return {
          asks: updateRow(prev.asks),
          bids: updateRow(prev.bids)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [livePrice]);

  return (
    <div className="dashboard-grid-overview animate-slide-up">
      {/* 1. Terminal Asset Header Info */}
      <div className="col-span-12 glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>BTC / USDT</span>
          <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
            Perpetual
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Live Price</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-profit)' }}>
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>24h Change</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-profit)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowUpRight size={14} /> +{priceChange}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }} className="terminal-header-hide">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>24h High</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFF' }}>$60,420.00</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }} className="terminal-header-hide">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>24h Low</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFF' }}>$58,150.00</span>
        </div>
      </div>

      {/* 2. Interactive SVG Candlestick Chart */}
      <div className="col-span-8 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '340px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['1m', '5m', '15m', '1h', '1d'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                style={{
                  minHeight: '28px',
                  minWidth: '38px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: timeframe === t ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: timeframe === t ? 'var(--bg-main)' : 'var(--text-secondary)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Index Feed: Binance Live</span>
        </div>

        {/* Mock Candlestick Drawing (SVG) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(11, 14, 20, 0.4)', position: 'relative' }}>
          <svg width="100%" height="220" style={{ overflow: 'visible', padding: '10px' }}>
            {/* Horizontal Grid lines */}
            <line x1="0" y1="50" x2="100%" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="110" x2="100%" y2="110" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="170" x2="100%" y2="170" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Simulated Candlesticks */}
            {[
              { x: 30, o: 120, c: 90, h: 80, l: 140, green: true },
              { x: 70, o: 90, c: 110, h: 70, l: 120, green: false },
              { x: 110, o: 110, c: 80, h: 60, l: 130, green: true },
              { x: 150, o: 80, c: 100, h: 70, l: 110, green: false },
              { x: 190, o: 100, c: 60, h: 50, l: 120, green: true },
              { x: 230, o: 60, c: 110, h: 50, l: 130, green: false },
              { x: 270, o: 110, c: 90, h: 80, l: 140, green: true },
              { x: 310, o: 90, c: 70, h: 60, l: 100, green: true },
              { x: 350, o: 70, c: 110, h: 65, l: 125, green: false },
              { x: 390, o: 110, c: 80, h: 70, l: 130, green: true },
              { x: 430, o: 80, c: 75, h: 60, l: 95, green: true }
            ].map((c, i) => (
              <g key={i}>
                {/* Wick shadow */}
                <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.green ? 'var(--accent-profit)' : 'var(--accent-loss)'} strokeWidth="2" />
                {/* Body */}
                <rect
                  x={c.x - 6}
                  y={c.green ? c.c : c.o}
                  width="12"
                  height={Math.max(4, Math.abs(c.c - c.o))}
                  fill={c.green ? 'var(--accent-profit)' : 'var(--accent-loss)'}
                  rx="1"
                />
              </g>
            ))}

            {/* Current Price Moving Line */}
            <line x1="0" y1="80" x2="100%" y2="80" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="3 3" />
            <text x="90%" y="75" fill="var(--accent-cyan)" fontSize="10" fontWeight="bold">${livePrice}</text>
          </svg>
        </div>
      </div>

      {/* 3. Live Order Book (Binance/Boltz Style) */}
      <div className="col-span-4 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Live Order Book</h3>
        
        {/* Asks (Sell Orders) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', paddingBottom: '6px' }}>
            <span>Price (USDT)</span>
            <span>Size (BTC)</span>
            <span>Total</span>
          </div>

          {orderBook.asks.map((ask, i) => (
            <div key={i} className="order-book-row">
              <div className="depth-bar-red" style={{ width: `${ask.percent}%` }}></div>
              <span className="order-book-cell loss-text" style={{ fontWeight: '700' }}>${ask.price.toFixed(1)}</span>
              <span className="order-book-cell">{ask.size.toFixed(3)}</span>
              <span className="order-book-cell" style={{ color: 'var(--text-muted)' }}>{ask.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Current Mid Spread Banner */}
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'var(--border-color)',
          borderRadius: '8px',
          fontWeight: '800',
          fontSize: '14px',
          color: '#FFF',
          margin: '4px 0'
        }}>
          ${livePrice}
        </div>

        {/* Bids (Buy Orders) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {orderBook.bids.map((bid, i) => (
            <div key={i} className="order-book-row">
              <div className="depth-bar-green" style={{ width: `${bid.percent}%` }}></div>
              <span className="order-book-cell profit-text" style={{ fontWeight: '700' }}>${bid.price.toFixed(1)}</span>
              <span className="order-book-cell">{bid.size.toFixed(3)}</span>
              <span className="order-book-cell" style={{ color: 'var(--text-muted)' }}>{bid.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Instant manual trading panel */}
      <div className="col-span-4">
        <ManualOrderBox
          activeExchange={activeExchange}
          balance={balance}
          onExecuteOrder={onExecuteOrder}
        />
      </div>

      {/* 5. Active positions list below */}
      <div className="col-span-8">
        <ActivePositions
          positions={positions}
          onClosePosition={onClosePosition}
        />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .terminal-header-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
