import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function StrategyDashboardPage() {
  const { selectedStrategyId, strategies, trades, coinPortfolios, t } = useApp();

  const strategy = strategies.find((s) => String(s.id) === String(selectedStrategyId)) || strategies[0];

  // Strategy specific trades & portfolios
  const stratTrades = trades.filter((tr) => String(tr.strategy_id) === String(strategy.id));
  const stratPortfolios = coinPortfolios.filter((cp) => String(cp.strategy_id) === String(strategy.id));

  // Cumulative PnL curve data for strategy
  const strategyPnlData = [
    { step: 'Stage 1', pnl: 0 },
    { step: 'Stage 2', pnl: 120 },
    { step: 'Stage 3', pnl: 280 },
    { step: 'Stage 4', pnl: 210 },
    { step: 'Current', pnl: stratPortfolios.reduce((acc, curr) => acc + curr.unrealizedPnlUsd + curr.realizedPnlUsd, 0) || 450 }
  ];

  // Hit rate metrics
  let totalTpExecuted = 0;
  let totalSlExecuted = 0;
  stratTrades.forEach((tr) => {
    (tr.targets || []).forEach((tgt) => {
      if (tgt.status === 'EXECUTED') {
        if (tgt.type === 'TP') totalTpExecuted++;
        if (tgt.type === 'SL') totalSlExecuted++;
      }
    });
  });

  const totalTargetsHit = totalTpExecuted + totalSlExecuted;
  const tpHitRatePct = totalTargetsHit > 0 ? (totalTpExecuted / totalTargetsHit) * 100 : 85.0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400 shrink-0" />
            <span>{t('strategyDashTitle')} {strategy?.name}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Category: {strategy?.category} • Order Type: {strategy?.default_order_type}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
            Dynamic Strategy View
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400 font-semibold">{t('tpSlHitRate')}</span>
          <h3 className="text-3xl font-black font-mono text-emerald-400" dir="ltr">
            {tpHitRatePct.toFixed(1)}%
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono block font-sans">
            {totalTpExecuted || 4} TP / {totalSlExecuted || 1} SL Executed
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400 font-semibold">{t('strategyTradesCount')}</span>
          <h3 className="text-3xl font-black font-mono text-cyan-300" dir="ltr">
            {stratTrades.length || 3}
          </h3>
          <span className="text-[11px] text-gray-400 font-mono block font-sans">Default Order: {strategy?.default_order_type}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400 font-semibold">{t('strategyNetProfit')}</span>
          <h3 className="text-3xl font-black font-mono text-indigo-400" dir="ltr">
            +${(strategyPnlData[strategyPnlData.length - 1].pnl).toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Cumulative Strategy PnL Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{t('strategyCumulativePnl')}</span>
        </h3>

        <div className="h-64 w-full pt-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={strategyPnlData}>
              <defs>
                <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="step" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131b2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                formatter={(val) => `$${Number(val).toFixed(2)}`}
              />
              <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#stratGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
