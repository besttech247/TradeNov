import React from 'react';
import { useApp } from '../context/AppContext';
import { Gem, Target, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip
} from 'recharts';

// Custom content for Treemap cells
const CustomizedContent = (props) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, value, avgCost, livePrice } = props;
  const isPositive = livePrice >= avgCost;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 ? (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold" dy={-5}>
          {name}
        </text>
      ) : null}
      {width > 50 && height > 45 ? (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={11} dy={12}>
          ${value.toFixed(0)}
        </text>
      ) : null}
    </g>
  );
};

export default function LongTermDashboardPage() {
  const { coinPortfolios, t } = useApp();

  // Filter Long-Term (DCA) coins
  const dcaPortfolios = coinPortfolios.filter((cp) => cp.category === 'Long-Term');

  // Treemap chart data
  const treemapData = dcaPortfolios.map((item) => ({
    name: item.symbol,
    size: item.currentValue, // Recharts Treemap typically uses 'size'
    value: item.currentValue,
    avgCost: item.averageCost,
    livePrice: item.livePrice
  }));

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gem className="w-6 h-6 text-purple-400 shrink-0" />
            <span>{t('longTermTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('longTermDesc')}</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold shrink-0">
          Long-Term Accumulation & DCA Matrix
        </span>
      </div>

      {/* DCA Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-4 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Target className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{t('dcaMatrix')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('symbol')}</th>
                <th className="p-4 font-sans">{t('exchange')}</th>
                <th className="p-4">{t('totalQuantity')}</th>
                <th className="p-4">{t('averageCost')}</th>
                <th className="p-4 text-purple-300">{t('breakEvenPrice')}</th>
                <th className="p-4 text-cyan-300">{t('livePrice')}</th>
                <th className="p-4">{t('currentValue')}</th>
                <th className="p-4">{t('realizedReturnHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {dcaPortfolios.map((item, idx) => {
                const returnPct = item.unrealizedPnlPct;
                const isPositive = returnPct >= 0;

                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white font-sans flex items-center gap-2">
                      <Gem className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{item.symbol}</span>
                    </td>
                    <td className="p-4 font-sans text-gray-300">{item.exchange_name}</td>
                    <td className="p-4 font-bold" dir="ltr">{item.currentQuantity.toFixed(4)}</td>
                    <td className="p-4 text-gray-300" dir="ltr">${item.averageCost.toFixed(2)}</td>
                    <td className="p-4 text-purple-300 font-bold" dir="ltr">${item.breakEvenPrice.toFixed(2)}</td>
                    <td className="p-4 text-cyan-300 font-bold" dir="ltr">${item.livePrice.toFixed(2)}</td>
                    <td className="p-4 text-white font-bold" dir="ltr">${item.currentValue.toFixed(2)}</td>
                    <td className="p-4 font-bold" dir="ltr">
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                        <span>{isPositive ? '+' : ''}{returnPct.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Weights Treemap */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Layers className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{t('assetTreemap')}</span>
        </h3>

        <div className="h-96 w-full pt-4" dir="ltr">
          {treemapData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                width={400}
                height={200}
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent colors={COLORS} />}
              >
                <Tooltip 
                  formatter={(val) => `$${Number(val).toFixed(2)}`} 
                  contentStyle={{ backgroundColor: '#131b2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-sm">
              No long-term investments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
