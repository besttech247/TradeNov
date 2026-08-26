import React from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { LineChart, BarChart3, Award, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyPnlData = [
  { month: 'يناير', pnl: 450 },
  { month: 'فبراير', pnl: 820 },
  { month: 'مارس', pnl: 640 },
  { month: 'أبريل', pnl: 1100 },
  { month: 'مايو', pnl: 950 },
  { month: 'يونيو', pnl: 1420 },
  { month: 'يوليو', pnl: 1850 },
];

export const AnalyticsTab: React.FC = () => {
  const { mode, theme, bots } = useCryptoStore();
  const isDark = theme === 'dark';

  const modeBots = bots.filter(b => b.mode === mode);
  const totalTrades = modeBots.reduce((sum, b) => sum + b.tradesCount, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex items-center justify-between shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-jiade-textMain dark:text-white">التحليلات والتقارير الشاملة</h2>
          </div>
          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            تقارير مفصلة عن عائد الاستثمار (ROI)، توزيع الأرباح حسب الاستراتيجية والمنصة، ومعدل أداء المخاطر.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">معدل الفوز العام (Win Rate)</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">92.4%</div>
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium mt-1 block">من إجمالي {totalTrades} صفقة</span>
        </div>

        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">متوسط أرباح الصفقة الواحدة</span>
          <div className="text-2xl font-extrabold text-jiade-textMain dark:text-white">$14.20 USDT</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+2.1% لكل صفقة</span>
        </div>

        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">معامل شارب (Sharpe Ratio)</span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">3.12</div>
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium mt-1 block">مخاطرة ممتازة للغاية</span>
        </div>

        <div className="bg-white dark:bg-crypto-card p-5 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <span className="text-xs text-jiade-textMuted dark:text-gray-400 block mb-1 font-medium">أفضل استراتيجية أداءً</span>
          <div className="text-lg font-extrabold text-jiade-textMain dark:text-white">MEXC Spot Grid</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">أرباح +$428.50 USDT</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly PnL Bar Chart */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
          <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>نمو الأرباح الشهرية (USDT)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPnlData}>
                <XAxis dataKey="month" stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#6b7280' : '#94a3b8'} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#121621' : '#ffffff', 
                    borderColor: isDark ? '#1e2434' : '#e2e8f0', 
                    color: isDark ? '#fff' : '#0f172a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                  formatter={(val: any) => [`$${val}`, 'الربح الشهري']}
                />
                <Bar dataKey="pnl" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>مساهمة الاستراتيجيات في الأرباح</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-jiade-textMain dark:text-white">Spot Grid (شبكية MEXC)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">55% ($1,240 USDT)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-jiade-cardSub dark:bg-crypto-dark overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[55%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-jiade-textMain dark:text-white">RSI + MACD Signals</span>
                  <span className="text-blue-600 dark:text-blue-400">30% ($680 USDT)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-jiade-cardSub dark:bg-crypto-dark overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[30%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-jiade-textMain dark:text-white">DCA Smart Accumulator</span>
                  <span className="text-amber-600 dark:text-amber-400">15% ($340 USDT)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-jiade-cardSub dark:bg-crypto-dark overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[15%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-jiade-border dark:border-crypto-border text-xs text-jiade-textMuted dark:text-gray-400 flex items-center gap-2 font-medium">
            <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>نصيحة النظام: تظهر الاستراتيجية الشبكية استقراراً كبيراً في تقلبات سوق MEXC.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
