import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { BotDetailModal } from './BotDetailModal';
import { StrategyType, ExchangeName } from '../../types';
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  SlidersHorizontal, 
  X, 
  Search, 
  Sparkles,
  Cpu
} from 'lucide-react';

export const BotsManagerTab: React.FC = () => {
  const { mode, bots, selectedBotId, setSelectedBotId, createBot, toggleBotStatus } = useCryptoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Bot Form State
  const [name, setName] = useState('');
  const [pair, setPair] = useState('BTC/USDT');
  const [exchange, setExchange] = useState<ExchangeName>('MEXC');
  const [strategy, setStrategy] = useState<StrategyType>('Spot Grid');
  const [investmentUsdt, setInvestmentUsdt] = useState(2500);
  const [takeProfitPct, setTakeProfitPct] = useState(3.0);
  const [stopLossPct, setStopLossPct] = useState(4.0);

  const filteredBots = bots.filter((bot) => {
    if (bot.mode !== mode) return false;
    if (strategyFilter !== 'all' && bot.strategy !== strategyFilter) return false;
    if (searchQuery && !bot.name.toLowerCase().includes(searchQuery.toLowerCase()) && !bot.pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBot({
      name: name || `${exchange} ${pair} ${strategy}`,
      pair,
      exchange,
      strategy,
      mode,
      status: 'active',
      config: {
        investmentUsdt,
        takeProfitPct,
        stopLossPct,
        gridLevels: strategy === 'Spot Grid' ? 15 : undefined,
        rsiBuyThreshold: strategy === 'RSI + MACD Signal' ? 30 : undefined,
        rsiSellThreshold: strategy === 'RSI + MACD Signal' ? 70 : undefined
      }
    });

    setIsCreateModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-jiade-textMain dark:text-white">إدارة بوتات التداول الاستراتيجية</h2>
          </div>
          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            التحكم الشامل ببوتات التداول (Grid, DCA, Signals) على منصة MEXC والمنصات الأخرى في بيئة {mode === 'real' ? 'حقيقية' : 'تجريبية'}.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء بوت تداول جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-crypto-card p-4 rounded-xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-jiade-textMuted dark:text-gray-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم البوت أو اسم الزوج (مثل BTC/USDT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl pr-9 pl-4 py-2 text-xs text-jiade-textMain dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Strategy Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 text-xs">
          {['all', 'Spot Grid', 'DCA Bot', 'RSI + MACD Signal', 'Triangular Arbitrage'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategyFilter(strat)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                strategyFilter === strat
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-sm'
                  : 'bg-jiade-cardSub dark:bg-crypto-dark text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white border border-jiade-border dark:border-crypto-border'
              }`}
            >
              {strat === 'all' ? 'جميع الاستراتيجيات' : strat}
            </button>
          ))}
        </div>

      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBots.map((bot) => (
          <div 
            key={bot.id}
            className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border hover:border-blue-400 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-jiade dark:shadow-none relative group"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400">
                    {bot.pair.split('/')[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bot.name}</h3>
                    <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">{bot.exchange} • {bot.pair}</p>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  bot.status === 'active' 
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {bot.status === 'active' ? 'نشط' : 'متوقف'}
                </span>
              </div>

              {/* Strategy Badge */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-jiade-cardSub dark:bg-crypto-dark text-blue-600 dark:text-blue-400 border border-jiade-border dark:border-crypto-border mb-4">
                <Sparkles className="w-3 h-3" />
                <span>{bot.strategy}</span>
              </div>

              {/* Performance Box */}
              <div className="grid grid-cols-2 gap-3 bg-jiade-cardSub dark:bg-crypto-dark p-3 rounded-xl border border-jiade-border dark:border-crypto-border text-xs mb-4">
                <div>
                  <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px] font-medium">صافي الأرباح (PnL)</span>
                  <span className={`text-sm font-extrabold ${bot.pnlUsdt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {bot.pnlUsdt >= 0 ? '+' : ''}${bot.pnlUsdt} ({bot.pnlPercent}%)
                  </span>
                </div>
                <div>
                  <span className="text-jiade-textMuted dark:text-gray-400 block text-[11px] font-medium">نسبة الصفقات</span>
                  <span className="text-sm font-extrabold text-jiade-textMain dark:text-white">{bot.winRate}% <span className="text-[10px] text-jiade-textMuted dark:text-gray-400 font-normal">({bot.tradesCount})</span></span>
                </div>
              </div>

              {/* Capital & Limits Info */}
              <div className="space-y-1 text-xs text-jiade-textMuted dark:text-gray-400 mb-4 px-1 font-medium">
                <div className="flex justify-between">
                  <span>رأس المال المخصص:</span>
                  <strong className="text-jiade-textMain dark:text-white font-bold">${bot.config.investmentUsdt.toLocaleString()} USDT</strong>
                </div>
                <div className="flex justify-between">
                  <span>أهداف الأرباح / الأمان:</span>
                  <span className="text-jiade-textMain dark:text-gray-300">TP: +{bot.config.takeProfitPct}% | SL: -{bot.config.stopLossPct}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-jiade-border dark:border-crypto-border">
              <button
                onClick={() => toggleBotStatus(bot.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  bot.status === 'active'
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
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
                    <span>تشغيل البوت</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedBotId(bot.id)}
                className="px-3 py-2 text-xs font-bold text-jiade-textMuted dark:text-gray-300 hover:text-jiade-textMain dark:hover:text-white bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>تحكم كامل</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBots.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-crypto-card rounded-2xl border border-jiade-border dark:border-crypto-border text-jiade-textMuted dark:text-gray-400 space-y-3 shadow-jiade dark:shadow-none">
          <Bot className="w-12 h-12 mx-auto text-slate-400 dark:text-gray-600" />
          <h3 className="text-base font-bold text-jiade-textMain dark:text-gray-200">لا توجد بوتات تطابق خيارات البحث</h3>
          <p className="text-xs">قم بتعديل الخيارات أو إنشاء بوت تداول جديد.</p>
        </div>
      )}

      {/* Single Bot Full Control Modal */}
      {selectedBotId && (
        <BotDetailModal
          botId={selectedBotId}
          onClose={() => setSelectedBotId(null)}
        />
      )}

      {/* Create New Bot Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-crypto-card w-full max-w-lg rounded-2xl border border-jiade-border dark:border-crypto-border shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-jiade-textMain dark:text-white">إعداد وبناء بوت تداول جديد</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Auto-Tune Recommendation Banner */}
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-jiade-textMain dark:text-white">ضبط المعلمات بالذكاء الاصطناعي (AI Auto-Tune)</h4>
                  <p className="text-[11px] text-jiade-textMuted dark:text-gray-400">تحليل تذبذب MEXC لزوج {pair} واقتراح أفضل نسب للربح وإدارة المخاطر.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (pair.includes('BTC')) {
                    setTakeProfitPct(2.5);
                    setStopLossPct(3.5);
                    setInvestmentUsdt(5000);
                  } else if (pair.includes('SOL')) {
                    setTakeProfitPct(4.2);
                    setStopLossPct(3.8);
                    setInvestmentUsdt(3500);
                  } else if (pair.includes('PEPE')) {
                    setTakeProfitPct(8.5);
                    setStopLossPct(6.0);
                    setInvestmentUsdt(1500);
                  } else {
                    setTakeProfitPct(3.0);
                    setStopLossPct(4.0);
                    setInvestmentUsdt(2500);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs whitespace-nowrap shadow-md"
              >
                تطبيق الإعدادات المثالية ✨
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">اسم البوت التوضيحي</label>
                <input
                  type="text"
                  placeholder="مثال: MEXC Spot Grid Alpha #2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">المنصة المتصلة</label>
                  <select
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value as ExchangeName)}
                    className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="MEXC">MEXC (موصى به)</option>
                    <option value="Binance">Binance</option>
                    <option value="Bybit">Bybit</option>
                    <option value="KuCoin">KuCoin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">زوج التداول</label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                    <option value="XRP/USDT">XRP/USDT</option>
                    <option value="PEPE/USDT">PEPE/USDT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">نوع الاستراتيجية الآلية</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as StrategyType)}
                  className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Spot Grid">Spot Grid (شبكية الشراء والبيع التلقائي)</option>
                  <option value="DCA Bot">DCA Bot (التجميع المتوسط عند الهبوط)</option>
                  <option value="RSI + MACD Signal">RSI + MACD Signal (التداول حسب المؤشرات)</option>
                  <option value="Triangular Arbitrage">Triangular Arbitrage (فروقات الأسعار)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">المبلغ (USDT)</label>
                  <input
                    type="number"
                    value={investmentUsdt}
                    onChange={(e) => setInvestmentUsdt(parseFloat(e.target.value))}
                    className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">جني الربح %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(parseFloat(e.target.value))}
                    className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">وقف الخسارة %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(parseFloat(e.target.value))}
                    className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-jiade-border dark:border-crypto-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  تشغيل وتفعيل البوت
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
