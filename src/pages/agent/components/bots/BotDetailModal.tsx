import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { 
  X, 
  Play, 
  Pause, 
  Trash2, 
  Save, 
  Terminal, 
  TrendingUp, 
  Settings2, 
  ShieldAlert,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BotDetailModalProps {
  botId: string;
  onClose: () => void;
}

const mockBotPnlHistory = [
  { step: '1', pnl: 0 },
  { step: '2', pnl: 25 },
  { step: '3', pnl: 15 },
  { step: '4', pnl: 85 },
  { step: '5', pnl: 140 },
  { step: '6', pnl: 220 },
  { step: '7', pnl: 428.50 },
];

export const BotDetailModal: React.FC<BotDetailModalProps> = ({ botId, onClose }) => {
  const { bots, theme, toggleBotStatus, updateBotConfig, deleteBot } = useCryptoStore();
  const isDark = theme === 'dark';
  const bot = bots.find(b => b.id === botId);

  if (!bot) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs'>('overview');
  
  // Settings Form State
  const [takeProfitPct, setTakeProfitPct] = useState(bot.config.takeProfitPct || 2.5);
  const [stopLossPct, setStopLossPct] = useState(bot.config.stopLossPct || 4.0);
  const [gridLevels, setGridLevels] = useState(bot.config.gridLevels || 20);
  const [upperPrice, setUpperPrice] = useState(bot.config.upperPrice || 70000);
  const [lowerPrice, setLowerPrice] = useState(bot.config.lowerPrice || 58000);
  const [investmentUsdt, setInvestmentUsdt] = useState(bot.config.investmentUsdt || 5000);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    updateBotConfig(bot.id, {
      takeProfitPct,
      stopLossPct,
      gridLevels,
      upperPrice,
      lowerPrice,
      investmentUsdt
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`هل أنت تأكد من حذف البوت "${bot.name}"؟`)) {
      deleteBot(bot.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-crypto-card w-full max-w-4xl rounded-2xl border border-jiade-border dark:border-crypto-border shadow-2xl overflow-hidden my-8 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-jiade-border dark:border-crypto-border bg-jiade-cardSub dark:bg-crypto-dark/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
              {bot.pair.split('/')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-jiade-textMain dark:text-white">{bot.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  bot.status === 'active' 
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {bot.status === 'active' ? 'شغال (Active)' : 'متوقف مؤقتاً'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-crypto-border text-slate-700 dark:text-gray-300">
                  {bot.mode === 'real' ? 'حقيقي Live' : 'تجريبي Demo'}
                </span>
              </div>
              <p className="text-xs text-jiade-textMuted dark:text-gray-400 mt-0.5 font-medium">{bot.exchange} • استراتيجية: {bot.strategy} • الزوج: {bot.pair}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white bg-white dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Modal Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-jiade-border dark:border-crypto-border bg-white dark:bg-crypto-dark/30">
          <div className="flex items-center gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>نظرة عامة والنمو</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'settings' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>إعدادات الاستراتيجية والتداول</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'logs' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>السجلات والصفقات (Logs)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBotStatus(bot.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                bot.status === 'active' 
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
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
              onClick={handleDelete}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-all"
              title="حذف البوت"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Performance */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-4 rounded-xl border border-jiade-border dark:border-crypto-border">
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">إجمالي الأرباح (PnL)</span>
                <div className={`text-xl font-extrabold ${bot.pnlUsdt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {bot.pnlUsdt >= 0 ? '+' : ''}${bot.pnlUsdt} USDT
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">({bot.pnlPercent}%)</span>
              </div>

              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-4 rounded-xl border border-jiade-border dark:border-crypto-border">
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">نسبة النجاح (Win Rate)</span>
                <div className="text-xl font-extrabold text-jiade-textMain dark:text-white">{bot.winRate}%</div>
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">إجمالي الصفقات: {bot.tradesCount}</span>
              </div>

              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-4 rounded-xl border border-jiade-border dark:border-crypto-border">
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">رأس المال المخصص</span>
                <div className="text-xl font-extrabold text-jiade-textMain dark:text-white">${bot.config.investmentUsdt.toLocaleString()} USDT</div>
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">على منصة {bot.exchange}</span>
              </div>

              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-4 rounded-xl border border-jiade-border dark:border-crypto-border">
                <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">تاريخ التشغيل</span>
                <div className="text-base font-extrabold text-jiade-textMain dark:text-gray-200 mt-1">{bot.createdAt}</div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">حالة ممتازة</span>
              </div>
            </div>

            {/* PnL Performance Chart */}
            <div className="bg-jiade-cardSub dark:bg-crypto-dark p-5 rounded-xl border border-jiade-border dark:border-crypto-border">
              <h4 className="text-sm font-extrabold text-jiade-textMain dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>منحنى نمو أرباح هذا البوت</span>
              </h4>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockBotPnlHistory}>
                    <XAxis dataKey="step" stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={10} />
                    <YAxis stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#121621' : '#ffffff', 
                        borderColor: isDark ? '#1e2434' : '#e2e8f0', 
                        color: isDark ? '#fff' : '#0f172a',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                      formatter={(val: any) => [`$${val}`, 'الربح']}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Strategy Settings & Parameters */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            
            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold text-center">
                ✓ تم حفظ تعديلات الاستراتيجية وإعادة تطبيقها على البوت بنجاح!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Risk Controls */}
              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-5 rounded-xl border border-jiade-border dark:border-crypto-border space-y-4">
                <h4 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2 border-b border-jiade-border dark:border-crypto-border pb-3">
                  <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>إدارة المخاطر وجني الأرباح</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">جني الأرباح (Take Profit %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                  <p className="text-[11px] text-jiade-textMuted dark:text-gray-400 mt-1 font-medium">إغلاق الصفقة وتأمين الأرباح عند الوصول لهذه النسبة.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">وقف الخسارة (Stop Loss %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                  <p className="text-[11px] text-jiade-textMuted dark:text-gray-400 mt-1 font-medium">حماية رأس المال بالخروج التلقائي عند الهبوط الشديد.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">رأس المال المخصص (USDT)</label>
                  <input
                    type="number"
                    value={investmentUsdt}
                    onChange={(e) => setInvestmentUsdt(parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Grid / Strategy Controls */}
              <div className="bg-jiade-cardSub dark:bg-crypto-dark p-5 rounded-xl border border-jiade-border dark:border-crypto-border space-y-4">
                <h4 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2 border-b border-jiade-border dark:border-crypto-border pb-3">
                  <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>معلمات الشبكة والاستراتيجية (Grid Settings)</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">عدد المستويات (Grid Levels)</label>
                  <input
                    type="number"
                    value={gridLevels}
                    onChange={(e) => setGridLevels(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">السعر الأعلى (Upper Limit)</label>
                    <input
                      type="number"
                      value={upperPrice}
                      onChange={(e) => setUpperPrice(parseFloat(e.target.value))}
                      className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">السعر الأدنى (Lower Limit)</label>
                    <input
                      type="number"
                      value={lowerPrice}
                      onChange={(e) => setLowerPrice(parseFloat(e.target.value))}
                      className="w-full bg-white dark:bg-crypto-card border border-jiade-border dark:border-crypto-border rounded-lg px-3 py-2 text-sm text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 3: Live Bot Logs */}
        {activeTab === 'logs' && (
          <div className="p-6">
            <div className="bg-slate-900 dark:bg-crypto-dark p-4 rounded-xl border border-slate-800 dark:border-crypto-border font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
              <div className="text-gray-400 pb-2 border-b border-slate-800 dark:border-crypto-border flex justify-between">
                <span>[سجل العمليات والإشارات اللحظية للبوت]</span>
                <span>تحديث تلقائي</span>
              </div>
              {bot.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-1">
                  <span className="text-gray-400">[{log.timestamp}]</span>
                  <span className={`font-bold ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
