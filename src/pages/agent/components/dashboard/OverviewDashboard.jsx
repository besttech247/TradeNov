import React, { useState } from 'react';
import { TrendingUp, Award, Activity, ShieldAlert, ChevronRight, BarChart3 } from 'lucide-react';
import PortfolioSummary from './PortfolioSummary';

export default function OverviewDashboard({
  activeExchange,
  balances,
  pnlToday,
  pnlPercent,
  dailyTarget,
  currentProgress,
  targetLocked,
  setTargetLocked,
  activePositionsCount,
  activeBotsCount
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Mock data for cumulative growth chart
  const growthData = [
    { day: 'Mon', value: 24200 },
    { day: 'Tue', value: 24900 },
    { day: 'Wed', value: 24700 },
    { day: 'Thu', value: 25400 },
    { day: 'Fri', value: 25900 },
    { day: 'Sat', value: 26100 },
    { day: 'Sun', value: 26680 }
  ];

  // SVG Chart rendering helpers
  const width = 500;
  const height = 180;
  const padding = 30;
  const minVal = 23000;
  const maxVal = 27500;

  const getX = (index) => padding + (index * (width - padding * 2)) / (growthData.length - 1);
  const getY = (value) => height - padding - ((value - minVal) * (height - padding * 2)) / (maxVal - minVal);

  const pointsPath = growthData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' L ');
  const areaPath = `${pointsPath} L ${getX(growthData.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

  return (
    <div className="dashboard-grid-overview animate-slide-up">
      {/* 1. Quick Stats Row */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        
        {/* Stat 1: Today Profit */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-profit)', padding: '10px', borderRadius: '12px' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Daily Return</span>
            <span style={{ fontSize: '15px', fontWeight: '800' }} className={pnlToday >= 0 ? 'profit-text' : 'loss-text'}>
              {pnlToday >= 0 ? '+' : ''}${pnlToday.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Stat 2: Active Positions */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '10px', borderRadius: '12px' }}>
            <Activity size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Active Positions</span>
            <span style={{ fontSize: '15px', fontWeight: '800' }}>{activePositionsCount} Open</span>
          </div>
        </div>

        {/* Stat 3: Active Bots */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '10px', borderRadius: '12px' }}>
            <Award size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Running Bots</span>
            <span style={{ fontSize: '15px', fontWeight: '800' }}>{activeBotsCount} Active</span>
          </div>
        </div>

      </div>

      {/* 2. Interactive SVG Capital Growth Chart */}
      <div className="col-span-8 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Cumulative Capital Growth</h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
            <span>Weekly Target: $27,000</span>
          </div>
        </div>

        {/* Interactive SVG Rendering */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1={padding} y1={getY(24000)} x2={width - padding} y2={getY(24000)} stroke="var(--border-color)" strokeDasharray="4 4" />
            <line x1={padding} y1={getY(26000)} x2={width - padding} y2={getY(26000)} stroke="var(--border-color)" strokeDasharray="4 4" />

            {/* Area Fill */}
            <path
              d={`M ${getX(0)},${height - padding} L ${areaPath}`}
              fill="url(#chartGrad)"
              stroke="none"
            />

            {/* Sparkline Path */}
            <path
              d={`M ${pointsPath}`}
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="3"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Interactive Circles */}
            {growthData.map((d, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.value)}
                r={hoveredPoint === i ? 6 : 4}
                fill={hoveredPoint === i ? 'var(--accent-cyan)' : 'var(--bg-main)'}
                stroke="var(--accent-cyan)"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover tooltips */}
          {hoveredPoint !== null && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--accent-cyan)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              pointerEvents: 'none'
            }}>
              {growthData[hoveredPoint].day}: ${growthData[hoveredPoint].value.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* 3. Portfolio Summary panel (Allocated within dashboard layout) */}
      <div className="col-span-4">
        <PortfolioSummary
          activeExchange={activeExchange}
          balance={balances[activeExchange]}
          pnlToday={pnlToday}
          pnlPercent={pnlPercent}
          dailyTarget={dailyTarget}
          currentProgress={currentProgress}
          targetLocked={targetLocked}
          setTargetLocked={setTargetLocked}
        />
      </div>

      {/* 4. Asset Distribution Overview */}
      <div className="col-span-6 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Platform Capital Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(balances).map((ex) => {
            const sum = Object.values(balances).reduce((a, b) => a + b, 0);
            const percent = ((balances[ex] / sum) * 100).toFixed(1);
            return (
              <div key={ex}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>
                  <span>{ex}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>${balances[ex].toLocaleString()} ({percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: ex === 'Binance' ? 'var(--accent-cyan)' : ex === 'Bybit' ? 'var(--accent-profit)' : '#F59E0B',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Safe Area Shield and Warning status */}
      <div className="col-span-6 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-loss)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Risk Control & Auto-Safety</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your capital is monitored. If total losses hit 5.5% of combined balances, the global fallback system freezes all active API links.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-profit)' }}>System Health: 100% OK</span>
          <a href="#settings" style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
            Configure Limits <ChevronRight size={14} />
          </a>
        </div>
      </div>

    </div>
  );
}
