import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BarChart3, Wallet, DollarSign, PieChart as PieChartIcon, TrendingUp, ShieldAlert, Coins } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';



export default function OverviewDashboardPage() {
  const { overviewMetrics, coinPortfolios, theme, t } = useApp();
  const [allocationMode, setAllocationMode] = useState('coin'); // 'coin' | 'exchange' | 'category'


  const isLight = theme === 'light';

  // Sample historical equity curve data
  const equityData = [
    { date: 'Day 1', equity: 30000 },
    { date: 'Day 2', equity: 31200 },
    { date: 'Day 3', equity: 32500 },
    { date: 'Day 4', equity: 31800 },
    { date: 'Day 5', equity: 34100 },
    { date: 'Day 6', equity: 33800 },
    { date: 'Today', equity: overviewMetrics.totalPortfolioValue }
  ];

  // Colors for pie chart
  const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#3b82f6'];

  // Prepare allocation pie chart data based on mode
  const getAllocationData = () => {
    if (allocationMode === 'coin') {
      return coinPortfolios.map((item) => ({
        name: item.symbol,
        value: Math.max(0, item.currentValue)
      }));
    } else if (allocationMode === 'exchange') {
      const exMap = {};
      coinPortfolios.forEach((item) => {
        exMap[item.exchange_name] = (exMap[item.exchange_name] || 0) + item.currentValue;
      });
      return Object.entries(exMap).map(([name, value]) => ({ name, value }));
    } else {
      const catMap = {};
      coinPortfolios.forEach((item) => {
        catMap[item.category] = (catMap[item.category] || 0) + item.currentValue;
      });
      return Object.entries(catMap).map(([name, value]) => ({ name, value }));
    }
  };

  const allocationData = getAllocationData();

  // Max drawdown mockup calculation
  const maxDrawdownPct = 4.2;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>{t('overviewTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('overviewDesc')}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Real-time Portfolio Intelligence
          </span>
        </div>
      </div>

      {/* Top Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Card 1: Total Portfolio Value */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold">{t('totalPortfolioValue')}</span>
            <h3 className="text-2xl font-black font-mono mt-1" dir="ltr">
              ${overviewMetrics.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1" dir="ltr">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>{t('totalReturnBadge')}</span>
          </div>
        </div>

        {/* Card 2: Liquidity Distribution */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t('cashVsInvested')}</span>
            <PieChartIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className={overviewMetrics.hasNegativeCash ? "text-amber-400" : "text-cyan-300"}>
                {t('cashAvailable')}: {overviewMetrics.cashPct.toFixed(1)}%
              </span>
              <span className="text-amber-300">{t('investedCapital')}: {overviewMetrics.investedPct.toFixed(1)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex" dir="ltr">
              <div style={{ width: `${overviewMetrics.cashPct}%` }} className={`${overviewMetrics.hasNegativeCash ? 'bg-amber-400' : 'bg-cyan-400'} h-full`}></div>
              <div style={{ width: `${overviewMetrics.investedPct}%` }} className="bg-amber-400 h-full"></div>
            </div>
            {overviewMetrics.hasNegativeCash && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                <span>⚠️ عجز نقدي بقيمة ${overviewMetrics.unloggedDepositAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Total Fees Deducted Counter */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold">{t('totalFeesCounter')}</span>
            <h3 className="text-2xl font-black font-mono text-purple-400 mt-1" dir="ltr">
              ${overviewMetrics.totalFeesPaidUsd.toFixed(2)}
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-sans block">{t('allExchangesSub')}</span>
        </div>

        {/* Card 4: Max Drawdown Gauge */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold">{t('maxDrawdownGauge')}</span>
            <h3 className="text-2xl font-black font-mono text-rose-400 mt-1" dir="ltr">
              -{maxDrawdownPct}%
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-sans block">{t('drawdownSafeSub')}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Equity Curve Line Chart */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{t('cumulativeEquityCurve')}</span>
            </h3>
            <span className="text-xs font-sans text-gray-400">{t('equityCurveSub')}</span>
          </div>

          <div className="h-72 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} />
                <YAxis stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#131b2e',
                    color: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="lg:col-span-4 glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('allocationTitle')}</span>
            </h3>

            {/* Toggle Mode Buttons */}
            <div className="flex rounded-lg bg-black/10 dark:bg-black/40 p-1 border border-white/10 text-[10px] font-sans">
              <button
                onClick={() => setAllocationMode('coin')}
                className={`px-2 py-0.5 rounded ${allocationMode === 'coin' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400'}`}
              >
                {t('allocationByCoin')}
              </button>
              <button
                onClick={() => setAllocationMode('exchange')}
                className={`px-2 py-0.5 rounded ${allocationMode === 'exchange' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400'}`}
              >
                {t('allocationByExchange')}
              </button>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#131b2e',
                    color: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                  formatter={(val) => `$${Number(val).toFixed(2)}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
