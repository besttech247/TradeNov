import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { StrategyType } from '../../types';
import { 
  BrainCircuit, 
  Play, 
  CheckCircle2, 
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  Download,
  BookmarkPlus,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const StrategyTesterTab: React.FC = () => {
  const { createBot, mode, theme, setActiveTab } = useCryptoStore();
  const isDark = theme === 'dark';

  // Backtest Configuration State
  const [strategy, setStrategy] = useState<StrategyType>('Spot Grid');
  const [pair, setPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('30D');
  const [capital, setCapital] = useState(5000);
  const [gridLevels, setGridLevels] = useState(40);
  const [takeProfit, setTakeProfit] = useState(3.5);
  const [stopLoss, setStopLoss] = useState(4.0);
  const [trailingStop, setTrailingStop] = useState(true);
  const [exchangeFee, setExchangeFee] = useState(0.05); // 0.05% MEXC Maker/Taker
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simulation Status
  const [isRunning, setIsRunning] = useState(false);
  const [hasResult, setHasResult] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'equity' | 'drawdown'>('equity');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Metrics Results
  const [metrics, setMetrics] = useState({
    netProfitUsdt: 1240.50,
    roiPct: 24.81,
    buyHoldRoi: 6.40,
    alphaOutperformance: 18.41,
    winRate: 92.8,
    winningTrades: 142,
    losingTrades: 11,
    totalTrades: 153,
    maxDrawdown: -2.85,
    profitFactor: 3.42,
    sharpeRatio: 2.89,
    feesPaid: 14.20,
    avgHoldHours: 4.2
  });

  // Dynamic Backtest Chart Data
  const [chartData, setChartData] = useState([
    { day: 'يوم 1', botEquity: 5000, buyHoldEquity: 5000, drawdown: 0 },
    { day: 'يوم 5', botEquity: 5210, buyHoldEquity: 5080, drawdown: -0.4 },
    { day: 'يوم 10', botEquity: 5460, buyHoldEquity: 4920, drawdown: -1.2 },
    { day: 'يوم 15', botEquity: 5680, buyHoldEquity: 5150, drawdown: -0.8 },
    { day: 'يوم 20', botEquity: 5920, buyHoldEquity: 5240, drawdown: -2.85 },
    { day: 'يوم 25', botEquity: 6090, buyHoldEquity: 5190, drawdown: -0.5 },
    { day: 'يوم 30', botEquity: 6240.50, buyHoldEquity: 5320, drawdown: -0.2 },
  ]);

  // Simulated Trades Log
  const [tradesLog, setTradesLog] = useState([
    { id: 'T-101', type: 'GRID_TP', pair: 'BTC/USDT', entry: 61850, exit: 62650, pnl: 48.20, pnlPct: 1.29, date: '2026-08-18 14:20' },
    { id: 'T-102', type: 'GRID_BUY', pair: 'BTC/USDT', entry: 61400, exit: 62100, pnl: 42.10, pnlPct: 1.14, date: '2026-08-18 11:05' },
    { id: 'T-103', type: 'RSI_REBOUND', pair: 'BTC/USDT', entry: 60950, exit: 61750, pnl: 54.60, pnlPct: 1.31, date: '2026-08-17 19:40' },
    { id: 'T-104', type: 'GRID_TP', pair: 'BTC/USDT', entry: 62100, exit: 62800, pnl: 39.80, pnlPct: 1.12, date: '2026-08-17 08:15' },
    { id: 'T-105', type: 'TRAILING_SL', pair: 'BTC/USDT', entry: 63200, exit: 62900, pnl: -18.40, pnlPct: -0.47, date: '2026-08-16 22:30' },
  ]);

  const handleRunBacktest = () => {
    setIsRunning(true);
    setHasResult(false);

    setTimeout(() => {
      const generatedRoi = parseFloat((Math.random() * 18 + 12).toFixed(2));
      const generatedProfit = parseFloat(((capital * generatedRoi) / 100).toFixed(2));
      const generatedBuyHold = parseFloat((Math.random() * 8 + 1).toFixed(2));
      const generatedWinRate = parseFloat((Math.random() * 8 + 89).toFixed(1));
      const generatedWins = Math.floor(Math.random() * 60) + 100;
      const generatedLosses = Math.floor(Math.random() * 12) + 5;
      const generatedDrawdown = parseFloat((-Math.random() * 3 - 1.2).toFixed(2));
      const generatedFactor = parseFloat((Math.random() * 1.5 + 2.4).toFixed(2));

      setMetrics({
        netProfitUsdt: generatedProfit,
        roiPct: generatedRoi,
        buyHoldRoi: generatedBuyHold,
        alphaOutperformance: parseFloat((generatedRoi - generatedBuyHold).toFixed(2)),
        winRate: generatedWinRate,
        winningTrades: generatedWins,
        losingTrades: generatedLosses,
        totalTrades: generatedWins + generatedLosses,
        maxDrawdown: generatedDrawdown,
        profitFactor: generatedFactor,
        sharpeRatio: parseFloat((Math.random() * 1.2 + 2.2).toFixed(2)),
        feesPaid: parseFloat(((capital * 0.003)).toFixed(2)),
        avgHoldHours: parseFloat((Math.random() * 4 + 2).toFixed(1))
      });

      // Update Chart Series
      setChartData([
        { day: 'بداية', botEquity: capital, buyHoldEquity: capital, drawdown: 0 },
        { day: '20%', botEquity: capital * 1.04, buyHoldEquity: capital * 1.01, drawdown: -0.6 },
        { day: '40%', botEquity: capital * 1.09, buyHoldEquity: capital * 0.98, drawdown: generatedDrawdown },
        { day: '60%', botEquity: capital * 1.15, buyHoldEquity: capital * 1.03, drawdown: -0.9 },
        { day: '80%', botEquity: capital * 1.20, buyHoldEquity: capital * 1.05, drawdown: -0.4 },
        { day: 'النهاية', botEquity: capital + generatedProfit, buyHoldEquity: capital * (1 + generatedBuyHold / 100), drawdown: -0.1 },
      ]);

      setIsRunning(false);
      setHasResult(true);
    }, 1400);
  };

  const handleDeployBotFromStrategy = () => {
    createBot({
      name: `بوت الباك تيست - ${pair} (${strategy})`,
      pair,
      exchange: 'MEXC',
      strategy,
      mode,
      status: 'active',
      config: {
        investmentUsdt: capital,
        takeProfitPct: takeProfit,
        stopLossPct: stopLoss
      }
    });

    setActiveTab('bots');
  };

  const handleSavePreset = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl md:text-2xl font-extrabold text-jiade-textMain dark:text-white">
              استوديو الباك تيست المتقدم (Quantitative Backtest Studio)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-jiade-textMuted dark:text-gray-400 font-medium">
            اختبار وتدقيق استراتيجيات التداول الآلية بالبيانات الدقيقة لـ MEXC مع مقارنة أداء البوت مقابل الاحتفاظ بالعملة (Buy & Hold).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSavePreset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border text-jiade-textMain dark:text-white text-xs font-bold transition-all shadow-sm"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-500" />
            <span>{saveSuccess ? '✓ تم حفظ القالب!' : 'حفظ كقالب معتمد'}</span>
          </button>

          <button
            onClick={handleDeployBotFromStrategy}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>نشر كبوت نشط فوراً</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Analysis Studio on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Parameter Configuration Studio */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none h-fit">
          <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
            <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>معايير واختيارات الباك تيست</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              MEXC Spot Historical API
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">الزوج المراد اختباره</label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2 text-xs text-jiade-textMain dark:text-white font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="BTC/USDT">BTC/USDT (بيتكوين)</option>
              <option value="ETH/USDT">ETH/USDT (إيثيريوم)</option>
              <option value="SOL/USDT">SOL/USDT (سولانا)</option>
              <option value="XRP/USDT">XRP/USDT (ريبل)</option>
              <option value="PEPE/USDT">PEPE/USDT (ميمي كوين تذبذب عالي)</option>
              <option value="KAS/USDT">KAS/USDT (كاسبا)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">نوع الاستراتيجية والخوارزمية</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as StrategyType)}
              className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2 text-xs text-jiade-textMain dark:text-white font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="Spot Grid">Spot Grid (الشبكية التلقائية لموجات التذبذب)</option>
              <option value="DCA Bot">DCA Martingale (التجميع الذكي المتوسط)</option>
              <option value="RSI + MACD Signal">RSI + MACD Signal (المؤشرات الفنية والانعكاس)</option>
              <option value="Triangular Arbitrage">Triangular Arbitrage (المضاربة الثلاثية بالفروقات)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">فترة البيانات التاريخية</label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {['7D', '30D', '90D', '1Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-2 rounded-xl border transition-all ${
                    timeframe === tf
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-jiade-cardSub dark:bg-crypto-dark border-jiade-border dark:border-crypto-border text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">رأس المال المخصص للاختبار (USDT)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
              className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2 text-xs text-jiade-textMain dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Toggle Advanced Risk Parameters */}
          <div className="pt-2 border-t border-jiade-border dark:border-crypto-border">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between w-full hover:underline"
            >
              <span>الإعدادات المتقدمة وإدارة المخاطر</span>
              <span>{showAdvanced ? '▲ إخفاء' : '▼ إظهار'}</span>
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-jiade-textMain dark:text-gray-300 mb-1">
                    <span>عدد مستويات الشبكة (Grid Density)</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{gridLevels} مستوى</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={gridLevels}
                    onChange={(e) => setGridLevels(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-jiade-border dark:bg-crypto-border rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">جني الربح (TP %)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                      className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-1.5 text-xs text-jiade-textMain dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">وقف الخسارة (SL %)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                      className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-1.5 text-xs text-jiade-textMain dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border">
                  <span className="font-bold text-jiade-textMain dark:text-gray-300">وقف الخسارة المتحرك (Trailing SL)</span>
                  <input
                    type="checkbox"
                    checked={trailingStop}
                    onChange={(e) => setTrailingStop(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>جاري استدعاء البيانات وحساب المحاكاة...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>بدء تشغيل الباك تيست (Run Backtest)</span>
              </>
            )}
          </button>
        </div>

        {/* Right 2 Columns: Results Dashboard & Deep Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {hasResult ? (
            <>
              {/* Row 1: KPI Summary Metric Widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-crypto-card p-4 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
                  <span className="text-[11px] text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">صافي أرباح البوت (Net PnL)</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">+${metrics.netProfitUsdt.toLocaleString()}</div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">عائد ROI: +{metrics.roiPct}%</span>
                </div>

                <div className="bg-white dark:bg-crypto-card p-4 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
                  <span className="text-[11px] text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">مقارنة بـ Buy & Hold</span>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">+{metrics.buyHoldRoi}%</div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">تفوق البوت: +{metrics.alphaOutperformance}%</span>
                </div>

                <div className="bg-white dark:bg-crypto-card p-4 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
                  <span className="text-[11px] text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">نسبة النجاح (Win Rate)</span>
                  <div className="text-xl font-black text-jiade-textMain dark:text-white font-mono">{metrics.winRate}%</div>
                  <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                    {metrics.winningTrades} رابحة / {metrics.losingTrades} خاسرة
                  </span>
                </div>

                <div className="bg-white dark:bg-crypto-card p-4 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
                  <span className="text-[11px] text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">أقصى هبوط (Max Drawdown)</span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{metrics.maxDrawdown}%</div>
                  <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">معامل الربح: {metrics.profitFactor}</span>
                </div>

              </div>

              {/* Row 2: Interactive Dual-Tab Visualizer (Equity vs Benchmark & Drawdown) */}
              <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jiade-border dark:border-crypto-border pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span>منحنى نمو رأس المال مقارنة بالسوق (Equity Growth Curve)</span>
                    </h3>
                    <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                      مقارنة أداء البوت الذكي (الأخضر) مقابل الاحتفاظ بالعملة Buy & Hold (الأزرق)
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-jiade-cardSub dark:bg-crypto-dark p-1 rounded-xl border border-jiade-border dark:border-crypto-border text-xs font-bold">
                    <button
                      onClick={() => setActiveChartTab('equity')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeChartTab === 'equity'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white'
                      }`}
                    >
                      منحنى النمو (Equity)
                    </button>
                    <button
                      onClick={() => setActiveChartTab('drawdown')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeChartTab === 'drawdown'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white'
                      }`}
                    >
                      الهبوط المؤقت (Drawdown)
                    </button>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChartTab === 'equity' ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="botEquityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} />
                        <YAxis stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#121621' : '#ffffff', 
                            borderColor: isDark ? '#1e2434' : '#e2e8f0', 
                            borderRadius: '12px',
                            color: isDark ? '#fff' : '#0f172a',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                          }}
                          formatter={(val: any, name: string) => [
                            `$${parseFloat(val).toFixed(2)}`, 
                            name === 'botEquity' ? 'رأس مال البوت' : 'رأس مال Buy & Hold'
                          ]}
                        />
                        <Area type="monotone" dataKey="botEquity" name="botEquity" stroke="#10b981" strokeWidth={3} fill="url(#botEquityGrad)" />
                        <Line type="monotone" dataKey="buyHoldEquity" name="buyHoldEquity" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <XAxis dataKey="day" stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} />
                        <YAxis stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#121621' : '#ffffff', 
                            borderColor: isDark ? '#1e2434' : '#e2e8f0', 
                            borderRadius: '12px',
                            color: isDark ? '#fff' : '#0f172a'
                          }}
                          formatter={(val: any) => [`${val}%`, 'نسبة الهبوط المؤقت']}
                        />
                        <Area type="monotone" dataKey="drawdown" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Additional Quantitative Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-jiade-border dark:border-crypto-border text-xs">
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px]">معامل شارب (Sharpe):</span>
                    <strong className="text-jiade-textMain dark:text-white font-mono font-bold">{metrics.sharpeRatio}</strong>
                  </div>
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px]">إجمالي العمولات المقتطعة:</span>
                    <strong className="text-jiade-textMain dark:text-white font-mono font-bold">${metrics.feesPaid} USDT</strong>
                  </div>
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px]">متوسط مدة الصفقة:</span>
                    <strong className="text-jiade-textMain dark:text-white font-mono font-bold">{metrics.avgHoldHours} ساعات</strong>
                  </div>
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px]">إجمالي الصفقات المنفذة:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{metrics.totalTrades} صفقة</strong>
                  </div>
                </div>

              </div>

              {/* Row 3: Simulated Trade-by-Trade Log */}
              <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none space-y-4">
                <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
                  <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>سجل صفقات الباك تيست التفصيلية (Trade-by-Trade Log)</span>
                  </h3>
                  <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-bold">
                    آخر الصفقات المنفذة خلال فترة الاختبار
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-jiade-textMuted dark:text-gray-400 border-b border-jiade-border dark:border-crypto-border pb-2 font-bold">
                        <th className="pb-3">معرّف الصفقة والزوج</th>
                        <th className="pb-3">نوع الحدث</th>
                        <th className="pb-3">سعر الدخول</th>
                        <th className="pb-3">سعر الخروج</th>
                        <th className="pb-3">الربح المحقق</th>
                        <th className="pb-3">التاريخ والوقت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-jiade-border/60 dark:divide-crypto-border/50 text-jiade-textMain dark:text-gray-200">
                      {tradesLog.map((trade) => (
                        <tr key={trade.id} className="hover:bg-jiade-cardSub/60 dark:hover:bg-crypto-dark/50 transition-all">
                          <td className="py-3 font-mono font-bold text-jiade-textMain dark:text-white">
                            {trade.id} - {trade.pair}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 font-mono">${trade.entry.toLocaleString()}</td>
                          <td className="py-3 font-mono">${trade.exit.toLocaleString()}</td>
                          <td className="py-3 font-mono font-bold">
                            <span className={trade.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} ({trade.pnlPct}%)
                            </span>
                          </td>
                          <td className="py-3 text-jiade-textMuted dark:text-gray-400 dir-ltr text-right">
                            {trade.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          ) : (
            <div className="bg-white dark:bg-crypto-card p-16 rounded-2xl border border-jiade-border dark:border-crypto-border text-center text-jiade-textMuted dark:text-gray-400 shadow-jiade dark:shadow-none">
              <span className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin inline-block mb-3"></span>
              <p className="text-sm font-bold text-jiade-textMain dark:text-white">جاري حساب صفقات الباك تيست ومقارنة أداء السوق لزوج {pair}...</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
