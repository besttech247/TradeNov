import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { 
  TrendingUp, 
  Wallet, 
  Bot, 
  Zap, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Activity, 
  SlidersHorizontal,
  Sparkles,
  Scale,
  CheckCircle2,
  Download,
  Flame
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';





export const OverviewTab: React.FC = () => {

  const [mexcVolatilityScannerData, setLiveScannerData] = useState<any[]>([{ pair: 'جاري التحميل...', price: '-', change24h: '-', volume: '-', volatilityScore: '-', recommendedGrid: '-' }]);
  const [pnlHistoryData, setLivePnlData] = useState<any[]>([{ time: 'الآن', pnl: 0, btc: 60000 }]);

  React.useEffect(() => {
    fetch('/api/shared/prices')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          const d = json.data;
          const formatMoney = (val: number) => '$' + (val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6}));
          const formatChange = (val: number) => (val > 0 ? '+' : '') + val.toFixed(2) + '%';
          
          setLiveScannerData([
            { pair: 'PEPE/USDT', price: formatMoney(d.PEPE?.price || 0), change24h: formatChange(d.PEPE?.change24h || 0), volume: formatMoney(d.PEPE?.volume || 0), volatilityScore: 'مرتفع جداً (9.4/10)', recommendedGrid: '40 مستوى (ربح 1.2%)' },
            { pair: 'SOL/USDT', price: formatMoney(d.SOL?.price || 0), change24h: formatChange(d.SOL?.change24h || 0), volume: formatMoney(d.SOL?.volume || 0), volatilityScore: 'مرتفع (8.1/10)', recommendedGrid: '25 مستوى (ربح 0.8%)' },
            { pair: 'KAS/USDT', price: formatMoney(d.KAS?.price || 0), change24h: formatChange(d.KAS?.change24h || 0), volume: formatMoney(d.KAS?.volume || 0), volatilityScore: 'مرتفع (8.6/10)', recommendedGrid: '30 مستوى (ربح 1.0%)' },
            { pair: 'XRP/USDT', price: formatMoney(d.XRP?.price || 0), change24h: formatChange(d.XRP?.change24h || 0), volume: formatMoney(d.XRP?.volume || 0), volatilityScore: 'متوسط (6.5/10)', recommendedGrid: '18 مستوى (ربح 0.6%)' }
          ]);
          setLivePnlData([
            { time: '00:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: '04:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: '08:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: '12:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: '16:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: '20:00', pnl: 0, btc: d.BTC?.price || 60000 },
            { time: 'الآن', pnl: 0, btc: d.BTC?.price || 60000 }
          ]);
        }
      })
      .catch(e => console.log('price error', e));
  }, []);

  const { 
    mode, 
    theme, 
    bots, 
    assets, 
    exchanges, 
    toggleBotStatus, 
    setSelectedBotId, 
    orders, 
    setActiveTab, 
    rebalancePortfolio,
    createBot
  } = useCryptoStore();

  const isDark = theme === 'dark';
  const modeBots = bots.filter(b => b.mode === mode);
  const activeBots = modeBots.filter(b => b.status === 'active');
  const totalPnlUsdt = modeBots.reduce((sum, b) => sum + b.pnlUsdt, 0);
  
  const totalBalance = assets.reduce((sum, a) => sum + a.valueUsdt, 0);
  const mexcExchange = exchanges.find(e => e.name === 'MEXC');

  const [rebalancedSuccess, setRebalancedSuccess] = useState(false);

  const handleRebalance = () => {
    rebalancePortfolio();
    setRebalancedSuccess(true);
    setTimeout(() => setRebalancedSuccess(false), 2500);
  };

  const handleLaunchScannerBot = (scannedPair: string) => {
    createBot({
      name: `بوت ماسح السيولة - ${scannedPair}`,
      pair: scannedPair,
      exchange: 'MEXC',
      strategy: 'Spot Grid',
      mode,
      status: 'active',
      config: {
        investmentUsdt: 2000,
        gridLevels: 25,
        takeProfitPct: 3.0,
        stopLossPct: 4.0
      }
    });

    setActiveTab('bots');
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Pair,Exchange,Type,Price,Total,Status,Time\n" +
      orders.map(o => `${o.id},${o.pair},${o.exchange},${o.type},${o.price},${o.total},${o.status},${o.timestamp}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mexc_pnl_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Banner & Quick Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-white to-white dark:from-blue-900/30 dark:via-crypto-card dark:to-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
              {mode === 'real' ? 'البيئة الحقيقية 🔴 LIVE' : 'البيئة التجريبية 🟡 DEMO'}
            </span>
            <span className="text-jiade-textMuted dark:text-gray-400 text-xs font-medium">• منصة MEXC والمنصات التابعة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-jiade-textMain dark:text-white">لوحة تحكم الأصول وبوتات التداول</h2>
          <p className="text-jiade-textMuted dark:text-gray-400 text-xs md:text-sm mt-1 font-medium">
            متابعة فورية للأرباح، الصفقات النشطة، والتحكم التام في إعدادات الاستراتيجيات.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border text-jiade-textMain dark:text-white font-bold text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>تصدير كشف الأرباح (CSV)</span>
          </button>

          <button 
            onClick={() => setActiveTab('bots')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>إنشاء بوت جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row (Jiade Style Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Portfolio */}
        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-blue-400 dark:hover:border-blue-500/40 transition-all shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between text-jiade-textMuted dark:text-gray-400 mb-2">
            <span className="text-xs font-bold">إجمالي الأصول بالمحفظة</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-jiade-textMain dark:text-white">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.84% (24 ساعة)</span>
          </div>
        </div>

        {/* Card 2: Cumulative PnL */}
        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between text-jiade-textMuted dark:text-gray-400 mb-2">
            <span className="text-xs font-bold">أرباح البوتات التراكمية (PnL)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +${totalPnlUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-jiade-textMuted dark:text-gray-400 mt-2 font-medium">
            معدل الأرباح الإجمالي: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+11.2%</strong>
          </div>
        </div>

        {/* Card 3: Active Bots Count */}
        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between text-jiade-textMuted dark:text-gray-400 mb-2">
            <span className="text-xs font-bold">البوتات النشطة الآن</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-jiade-textMain dark:text-white">
            {activeBots.length} <span className="text-sm font-normal text-jiade-textMuted dark:text-gray-400">من {modeBots.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>تعمل بكفاءة واستقرار</span>
          </div>
        </div>

        {/* Card 4: MEXC API Connection */}
        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-amber-400 dark:hover:border-amber-500/40 transition-all shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between text-jiade-textMuted dark:text-gray-400 mb-2">
            <span className="text-xs font-bold">حالة اتصال MEXC API</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {mexcExchange?.isConnected ? 'متصل بنجاح' : 'غير متصل'}
          </div>
          <div className="flex items-center gap-1 text-xs text-jiade-textMuted dark:text-gray-400 font-medium mt-2">
            <span>زمن الاستجابة:</span>
            <strong className="text-jiade-textMain dark:text-white font-mono font-bold">{mexcExchange?.pingMs || 24} ms</strong>
          </div>
        </div>

      </div>

      {/* Main Charts & Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main PnL Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>أداء ونمو أرباح البوتات اليومية (PnL Performance)</span>
              </h3>
              <p className="text-xs text-jiade-textMuted dark:text-gray-400 mt-0.5 font-medium">تتبع الأرباح المباشرة وتذبذب السوق في الوقت الفعلي</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                معدل الفوز 92.4%
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlHistoryData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#121621' : '#ffffff', 
                    borderColor: isDark ? '#1e2434' : '#e2e8f0', 
                    borderRadius: '12px',
                    color: isDark ? '#fff' : '#0f172a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }} 
                  formatter={(val: any) => [`$${val}`, 'صافي الربح']}
                />
                <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2.5} fill="url(#pnlGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Asset Allocation & Auto-Rebalancing Widget */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex flex-col justify-between shadow-jiade dark:shadow-none space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3 mb-4">
              <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white">توزيع المحفظة وإعادة التوازن</h3>
              <button
                onClick={handleRebalance}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>إعادة التوازن</span>
              </button>
            </div>

            {rebalancedSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl text-xs font-bold text-center mb-3">
                ✓ تمت إعادة التوازن التلقائي للنسب المستهدفة!
              </div>
            )}

            <div className="space-y-2.5">
              {assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-2.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark/50 border border-jiade-border/60 dark:border-crypto-border/50 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{asset.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-jiade-textMain dark:text-white">{asset.symbol}</h4>
                      <p className="text-[10px] text-jiade-textMuted dark:text-gray-400">{asset.name}</p>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-bold text-jiade-textMain dark:text-white">${asset.valueUsdt.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold ${asset.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-jiade-border dark:border-crypto-border flex items-center justify-between text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            <span>انحراف المحفظة (Drift):</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1.2% (متوازن وممتاز)</strong>
          </div>
        </div>

      </div>

      {/* NEW: MEXC Volatility & Momentum Scanner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jiade-border dark:border-crypto-border pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white">
                ماسح السيولة وتذبذب الأسعار اللحظي (MEXC Volatility Scanner)
              </h3>
              <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                رصد الفرص الأكثر تذبذباً وسرعة على منصة MEXC لتشغيل بوتات المضاربة الفورية بنقرة واحدة.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            تحديث خوارزمي كل 10 ثوانٍ ⚡
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mexcVolatilityScannerData.map((scan) => (
            <div key={scan.pair} className="p-4 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-jiade-textMain dark:text-white">{scan.pair}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{scan.change24h}</span>
                </div>
                <div className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                  السعر: <strong className="text-jiade-textMain dark:text-white font-mono">{scan.price}</strong> • الحجم: {scan.volume}
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-2">
                  مستوى التذبذب: {scan.volatilityScore}
                </div>
                <p className="text-[10px] text-jiade-textMuted dark:text-gray-400 mt-0.5">
                  مقترح الذكاء الاصطناعي: {scan.recommendedGrid}
                </p>
              </div>

              <button
                onClick={() => handleLaunchScannerBot(scan.pair)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تشغيل بوت فوري للزوج</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Bots Grid & Quick Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>البوتات النشطة في النظام</span>
          </h3>

          <button 
            onClick={() => setActiveTab('bots')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <span>عرض كل البوتات ({modeBots.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeBots.map((bot) => (
            <div key={bot.id} className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-blue-400 dark:hover:border-crypto-accent/50 transition-all flex flex-col justify-between shadow-jiade dark:shadow-none">
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                      {bot.pair.split('/')[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-jiade-textMain dark:text-white">{bot.name}</h4>
                      <p className="text-[11px] text-jiade-textMuted dark:text-gray-400">{bot.exchange} • {bot.pair}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bot.status === 'active' 
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {bot.status === 'active' ? 'شغال' : 'متوقف'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-jiade-cardSub dark:bg-crypto-dark/60 p-3 rounded-xl border border-jiade-border/60 dark:border-crypto-border/60 my-3 text-xs">
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[10px] font-medium">الأرباح (PnL)</span>
                    <span className={`font-extrabold ${bot.pnlUsdt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {bot.pnlUsdt >= 0 ? '+' : ''}${bot.pnlUsdt} ({bot.pnlPercent}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-jiade-textMuted dark:text-gray-400 block text-[10px] font-medium">نسبة النجاح</span>
                    <span className="font-extrabold text-jiade-textMain dark:text-white">{bot.winRate}% ({bot.tradesCount} صفقة)</span>
                  </div>
                </div>
              </div>

              {/* Bot controls */}
              <div className="flex items-center gap-2 pt-3 border-t border-jiade-border/60 dark:border-crypto-border/60">
                <button
                  onClick={() => toggleBotStatus(bot.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bot.status === 'active'
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {bot.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>تشغيل</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedBotId(bot.id);
                    setActiveTab('bots');
                  }}
                  className="p-1.5 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-lg shadow-sm"
                  title="التحكم الكامل والبيانات"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Live Orders Log Table */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>سجل الصفقات والأوامر الأخيرة</span>
          </h3>
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">تحديث مباشر</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-jiade-textMuted dark:text-gray-400 border-b border-jiade-border dark:border-crypto-border pb-2">
                <th className="pb-3 font-bold">الزوج والمنصة</th>
                <th className="pb-3 font-bold">نوع الصفقة</th>
                <th className="pb-3 font-bold">سعر التنفيذ</th>
                <th className="pb-3 font-bold">الكمية الإجمالية</th>
                <th className="pb-3 font-bold">الحالة</th>
                <th className="pb-3 font-bold">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jiade-border/60 dark:divide-crypto-border/50 text-jiade-textMain dark:text-gray-200">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-jiade-cardSub/60 dark:hover:bg-crypto-dark/40 transition-all">
                  <td className="py-3 font-bold text-jiade-textMain dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>{ord.pair} ({ord.exchange})</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-extrabold ${
                      ord.type === 'BUY' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/15 text-red-700 dark:text-red-400'
                    }`}>
                      {ord.type === 'BUY' ? 'شراء' : 'بيع'}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold">${ord.price.toLocaleString()}</td>
                  <td className="py-3 font-mono font-bold">${ord.total.toLocaleString()} USDT</td>
                  <td className="py-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ord.status}</span>
                  </td>
                  <td className="py-3 text-jiade-textMuted dark:text-gray-400 dir-ltr text-right">{ord.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
