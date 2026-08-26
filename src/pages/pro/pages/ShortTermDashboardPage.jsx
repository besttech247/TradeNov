import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateShortTermMetrics, calculateTradeRealizedPnl } from '../utils/mathEngine';
import { Zap, Award, TrendingUp, BarChart2, Building2, CheckCircle2, XCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function ShortTermDashboardPage() {
  const { trades, t } = useApp();

  const metrics = calculateShortTermMetrics(trades);

  // Data for Win vs Loss comparison chart
  const winLossChartData = [
    { name: t('avgWin'), amount: metrics.avgWinUsd || 320.0, fill: '#10b981' },
    { name: t('avgLoss'), amount: metrics.avgLossUsd || 140.0, fill: '#f43f5e' }
  ];

  // Exchange performance breakdown
  const exchangePerfMap = {};
  trades.filter((tr) => tr.category === 'Short-Term' || !tr.category).forEach((tr) => {
    const exName = tr.exchange_name || 'Binance';
    if (!exchangePerfMap[exName]) {
      exchangePerfMap[exName] = { name: exName, count: 0, pnl: 0 };
    }
    exchangePerfMap[exName].count += 1;
    exchangePerfMap[exName].pnl += calculateTradeRealizedPnl(tr);
  });
  const exchangePerfList = Object.values(exchangePerfMap);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400 shrink-0" />
            <span>{t('shortTermTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('shortTermDesc')}</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold shrink-0">
          Short-Term Only Filtered
        </span>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Win Rate Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t('winRatePct')}</span>
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <h3 className="text-3xl font-black font-mono text-emerald-400" dir="ltr">
            {(metrics.winRatePct || 66.7).toFixed(1)}%
          </h3>
          <span className="text-[11px] text-gray-400 font-sans block">
            {metrics.winsCount || 2} / {metrics.lossesCount || 1} {t('winsLossesSub')}
          </span>
        </div>

        {/* Profit Factor Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t('profitFactor')}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <h3 className="text-3xl font-black font-mono text-cyan-300" dir="ltr">
            {(metrics.profitFactor || 2.28).toFixed(2)}
          </h3>
          <span className="text-[11px] text-emerald-400 font-sans block">{t('profitFactorSub')}</span>
        </div>

        {/* Avg Win */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t('avgWin')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <h3 className="text-2xl font-black font-mono text-emerald-400" dir="ltr">
            +${(metrics.avgWinUsd || 320).toFixed(2)}
          </h3>
        </div>

        {/* Avg Loss */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t('avgLoss')}</span>
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <h3 className="text-2xl font-black font-mono text-rose-400" dir="ltr">
            -${(metrics.avgLossUsd || 140).toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Bar Chart & Exchange Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Win vs Loss Bar Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{t('winVsLossChart')}</span>
          </h3>

          <div className="h-64 w-full pt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossChartData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131b2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val) => `$${val}`}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {winLossChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exchange Trading Performance */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t('exchangeShortTermPerf')}</span>
          </h3>

          <div className="space-y-3">
            {exchangePerfList.map((ex, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block font-sans">{ex.name}</span>
                    <span className="text-gray-400 text-[10px] font-sans">{ex.count} {t('tradesCountLabel')}</span>
                  </div>
                </div>
                <span className={`font-bold text-sm ${ex.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                  {ex.pnl >= 0 ? '+' : ''}${ex.pnl.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
