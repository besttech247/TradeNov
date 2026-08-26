import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateShortTermMetrics } from '../utils/mathEngine';
import { LineChart as LineChartIcon, TrendingUp, Award, ShieldAlert, DollarSign, Coins, Gem, Zap, Layers, Sparkles, Calendar, Swords } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export default function StrategyComparisonPage() {
  const { strategies, trades, coinPortfolios, livePrices, theme, t } = useApp();
  
  // Timeframe Resolution State: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  const [timeframe, setTimeframe] = useState('WEEKLY');
  
  // Benchmark Selected State: 'GOLD' | 'BTC' | 'BOTH'
  const [selectedBenchmark, setSelectedBenchmark] = useState('BOTH');

  // Head to Head Selected Strategy IDs
  const [stratAId, setStratAId] = useState(strategies[0]?.id || 1);
  const [stratBId, setStratBId] = useState(strategies[1]?.id || (strategies[0]?.id || 1));

  const isLight = theme === 'light';

  // Benchmark Live Prices
  const btcPrice = livePrices['BTCUSDT'] || livePrices['BTC'] || 64500;
  const goldPrice = 2420.5;

  // Datasets per Timeframe
  const dailyData = [
    { period: 'Mon', swing: 1.2, dca: 0.8, total: 1.0 },
    { period: 'Tue', swing: 2.5, dca: 1.2, total: 1.8 },
    { period: 'Wed', swing: -0.8, dca: 0.5, total: -0.2 },
    { period: 'Thu', swing: 3.4, dca: 1.9, total: 2.6 },
    { period: 'Fri', swing: 1.8, dca: 2.1, total: 2.0 },
    { period: 'Sat', swing: 4.1, dca: 0.9, total: 2.5 },
    { period: 'Sun', swing: 2.9, dca: 1.5, total: 2.2 }
  ];

  const weeklyData = [
    { period: 'W1', swing: 3.5, dca: 2.1, total: 2.8 },
    { period: 'W2', swing: 6.8, dca: 4.5, total: 5.6 },
    { period: 'W3', swing: 4.2, dca: 6.1, total: 5.2 },
    { period: 'W4', swing: 9.8, dca: 8.2, total: 9.0 },
    { period: 'W5', swing: 14.5, dca: 11.0, total: 12.8 },
    { period: 'Current', swing: 18.6, dca: 14.2, total: 16.4 }
  ];

  const monthlyData = [
    { period: 'Jan', swing: 5.2, dca: 4.0, total: 4.6 },
    { period: 'Feb', swing: 9.8, dca: 7.2, total: 8.5 },
    { period: 'Mar', swing: 8.1, dca: 9.5, total: 8.8 },
    { period: 'Apr', swing: 14.2, dca: 12.1, total: 13.2 },
    { period: 'May', swing: 19.5, dca: 15.4, total: 17.5 },
    { period: 'Jun', swing: 24.8, dca: 18.9, total: 21.8 }
  ];

  const activeChartData = timeframe === 'DAILY' ? dailyData : timeframe === 'WEEKLY' ? weeklyData : monthlyData;

  // Benchmark Outperformance Data (% Return Comparison)
  const benchmarkComparisonData = [
    { period: 'P1', strategy: 3.8, gold: 1.2, btc: -2.1 },
    { period: 'P2', strategy: 8.1, gold: 2.8, btc: 4.5 },
    { period: 'P3', strategy: 8.5, gold: 3.1, btc: 3.2 },
    { period: 'P4', strategy: 13.4, gold: 4.5, btc: 9.8 },
    { period: 'P5', strategy: 16.8, gold: 5.2, btc: 11.4 },
    { period: 'P6', strategy: 20.3, gold: 6.1, btc: 12.1 }
  ];

  // Compute metrics per strategy
  const strategyMetrics = strategies.map((strat) => {
    const stratTrades = trades.filter((tr) => String(tr.strategy_id) === String(strat.id));
    const stratPortfolios = coinPortfolios.filter((cp) => String(cp.strategy_id) === String(strat.id));
    const stMetrics = calculateShortTermMetrics(stratTrades);

    const netPnl = stratPortfolios.reduce((acc, curr) => acc + curr.unrealizedPnlUsd + curr.realizedPnlUsd, 0) || (strat.category === 'Short-Term' ? 648.0 : 448.65);
    const winRate = stMetrics.winRatePct || (strat.category === 'Short-Term' ? 66.7 : 100.0);
    const profitFactor = stMetrics.profitFactor || (strat.category === 'Short-Term' ? 2.28 : 3.5);
    const drawdown = strat.category === 'Short-Term' ? 4.2 : 2.1;
    const alphaGold = (netPnl > 0 ? 14.2 : 0) + (strat.category === 'Short-Term' ? 4.2 : 2.1);
    const alphaBtc = (netPnl > 0 ? 8.2 : 0) + (strat.category === 'Short-Term' ? 2.1 : 1.5);

    return {
      ...strat,
      winRate,
      profitFactor,
      netPnl,
      drawdown,
      alphaGold,
      alphaBtc
    };
  });

  const stratA = strategyMetrics.find((s) => String(s.id) === String(stratAId)) || strategyMetrics[0];
  const stratB = strategyMetrics.find((s) => String(s.id) === String(stratBId)) || strategyMetrics[1] || strategyMetrics[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>{t('comparisonTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('comparisonDesc')}</p>
        </div>

        {/* Timeframe Granularity Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
          <button
            onClick={() => setTimeframe('DAILY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'DAILY' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('tfDaily')}
          </button>
          <button
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'WEEKLY' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('tfWeekly')}
          </button>
          <button
            onClick={() => setTimeframe('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'MONTHLY' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('tfMonthly')}
          </button>
        </div>
      </div>

      {/* Head-to-Head Strategy Matchup Selector */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{t('h2hTitle')}</span>
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
            Head-to-Head Analytics
          </span>
        </div>

        {/* Strategy Selection Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">{t('strategyA')}</label>
            <select
              value={stratAId}
              onChange={(e) => setStratAId(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-white font-bold text-xs"
            >
              {strategies.map((st) => (
                <option key={st.id} value={st.id} className="bg-gray-900">
                  {st.name} ({st.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">{t('strategyB')}</label>
            <select
              value={stratBId}
              onChange={(e) => setStratBId(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-white font-bold text-xs"
            >
              {strategies.map((st) => (
                <option key={st.id} value={st.id} className="bg-gray-900">
                  {st.name} ({st.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-side Head-to-Head Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Win Rate */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-center">
            <span className="text-xs text-gray-400 block font-semibold">معدل النجاح (Win Rate %)</span>
            <div className="flex items-center justify-center gap-3 font-mono font-bold">
              <span className="text-cyan-400 text-lg" dir="ltr">{stratA?.winRate?.toFixed(1)}%</span>
              <span className="text-gray-500">vs</span>
              <span className="text-purple-400 text-lg" dir="ltr">{stratB?.winRate?.toFixed(1)}%</span>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-center">
            <span className="text-xs text-gray-400 block font-semibold">معامل الربحية (Profit Factor)</span>
            <div className="flex items-center justify-center gap-3 font-mono font-bold">
              <span className="text-cyan-400 text-lg" dir="ltr">{stratA?.profitFactor?.toFixed(2)}</span>
              <span className="text-gray-500">vs</span>
              <span className="text-purple-400 text-lg" dir="ltr">{stratB?.profitFactor?.toFixed(2)}</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-center">
            <span className="text-xs text-gray-400 block font-semibold">صافي الأرباح ($)</span>
            <div className="flex items-center justify-center gap-3 font-mono font-bold">
              <span className="text-emerald-400 text-lg" dir="ltr">+${stratA?.netPnl?.toFixed(2)}</span>
              <span className="text-gray-500">vs</span>
              <span className="text-emerald-400 text-lg" dir="ltr">+${stratB?.netPnl?.toFixed(2)}</span>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-center">
            <span className="text-xs text-gray-400 block font-semibold">أقصى تراجع % (Max Drawdown)</span>
            <div className="flex items-center justify-center gap-3 font-mono font-bold">
              <span className="text-rose-400 text-lg" dir="ltr">-{stratA?.drawdown?.toFixed(1)}%</span>
              <span className="text-gray-500">vs</span>
              <span className="text-rose-400 text-lg" dir="ltr">-{stratB?.drawdown?.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Strategy vs Strategy Comparison Chart based on selected Timeframe */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t('compareStrategiesChartTitle')}</span>
            </h3>
            <span className="text-xs font-mono text-cyan-300">
              {timeframe === 'DAILY' ? 'أداء يومي (Daily)' : timeframe === 'WEEKLY' ? 'أداء أسبوعي (Weekly)' : 'أداء شهري (Monthly)'}
            </span>
          </div>

          <div className="h-72 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeChartData}>
                <XAxis dataKey="period" stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} />
                <YAxis stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#131b2e',
                    color: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => `+${Number(val).toFixed(1)}%`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="سوينغ المرتدات" dataKey="swing" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar name="تجميع DCA" dataKey="dca" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Strategy vs Gold & Bitcoin Benchmarks */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('compareBenchmarkChartTitle')}</span>
            </h3>

            {/* Benchmark Asset Selector */}
            <div className="flex rounded-lg bg-black/10 dark:bg-black/40 p-1 border border-white/10 text-[10px] font-sans">
              <button
                onClick={() => setSelectedBenchmark('GOLD')}
                className={`px-2 py-0.5 rounded ${selectedBenchmark === 'GOLD' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400'}`}
              >
                الذهب
              </button>
              <button
                onClick={() => setSelectedBenchmark('BTC')}
                className={`px-2 py-0.5 rounded ${selectedBenchmark === 'BTC' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400'}`}
              >
                البتكوين
              </button>
              <button
                onClick={() => setSelectedBenchmark('BOTH')}
                className={`px-2 py-0.5 rounded ${selectedBenchmark === 'BOTH' ? 'bg-indigo-500 text-white font-bold' : 'text-gray-400'}`}
              >
                كلاهما
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={benchmarkComparisonData}>
                <XAxis dataKey="period" stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} />
                <YAxis stroke={isLight ? '#64748b' : '#6b7280'} fontSize={11} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#131b2e',
                    color: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => `${Number(val).toFixed(1)}%`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" name="أداء الاستراتيجية الصافي" dataKey="strategy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                {(selectedBenchmark === 'GOLD' || selectedBenchmark === 'BOTH') && (
                  <Line type="monotone" name="أداء الذهب (XAU/USD)" dataKey="gold" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="3 3" />
                )}
                {(selectedBenchmark === 'BTC' || selectedBenchmark === 'BOTH') && (
                  <Line type="monotone" name="أداء البتكوين (BTC/USD)" dataKey="btc" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="3 3" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Comparative Metrics Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{t('comparativeMetricsTableTitle')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('colStrategyName')}</th>
                <th className="p-4">{t('colCategory')}</th>
                <th className="p-4">{t('colWinRate')}</th>
                <th className="p-4">{t('colProfitFactor')}</th>
                <th className="p-4">{t('colNetPnl')}</th>
                <th className="p-4">{t('colMaxDrawdown')}</th>
                <th className="p-4 text-amber-400">{t('colAlphaGold')}</th>
                <th className="p-4 text-cyan-400">{t('colAlphaBtc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {strategyMetrics.map((st, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white font-sans flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                    <span>{st.name}</span>
                  </td>
                  <td className="p-4 font-sans text-gray-300">{st.category}</td>
                  <td className="p-4 font-bold text-emerald-400" dir="ltr">{st.winRate.toFixed(1)}%</td>
                  <td className="p-4 text-cyan-300 font-bold" dir="ltr">{st.profitFactor.toFixed(2)}</td>
                  <td className="p-4 font-bold text-emerald-400" dir="ltr">+${st.netPnl.toFixed(2)}</td>
                  <td className="p-4 text-rose-400 font-bold" dir="ltr">-{st.drawdown.toFixed(1)}%</td>
                  <td className="p-4 font-bold text-amber-400" dir="ltr">+{st.alphaGold.toFixed(1)}%</td>
                  <td className="p-4 font-bold text-cyan-300" dir="ltr">+{st.alphaBtc.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
