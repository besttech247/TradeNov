import React, { useState } from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidTable = ({
  coins = [],
  multiTfAnalysisMap = {},
  onSelectCoin
}) => {
  const [sortField, setSortField] = useState('quoteVolume');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedCoins = [...coins].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'activeSignals') {
      aVal = multiTfAnalysisMap[a.symbol]?.activeSignalsCount || 0;
      bVal = multiTfAnalysisMap[b.symbol]?.activeSignalsCount || 0;
    }

    if (aVal === bVal) return 0;
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  return (
    <div className="scanner-glass overflow-hidden border border-white/5">
      <div className="p-3.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">جدول المسح اللحظي الموحد</span>
          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {coins.length} زوج معروض
          </span>
        </div>
        <div className="text-[11px] text-text-muted">
          اضغط على أي صف لعرض شارت EWO ومحاكي الصفقات
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-white/5 text-text-muted font-mono uppercase text-[10px] border-b border-white/5">
            <tr>
              <th className="py-3 px-4">الزوج / المنصة</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('price')}
              >
                السعر {sortField === 'price' && (sortAsc ? '▲' : '▼')}
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('priceChangePercent')}
              >
                تغير 24h {sortField === 'priceChangePercent' && (sortAsc ? '▲' : '▼')}
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('quoteVolume')}
              >
                السيولة (24h) {sortField === 'quoteVolume' && (sortAsc ? '▲' : '▼')}
              </th>
              <th className="py-3 px-4 text-center">رادار الفريمات (1D | 4h | 81m | 27m | 9m)</th>
              <th className="py-3 px-4">الصفقة الموصى بها</th>
              <th className="py-3 px-4 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedCoins.slice(0, 50).map((coin) => {
              const analysis = multiTfAnalysisMap[coin.symbol];
              const bestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid) || "81m";
              const levels = calculateSowaidTradeLevels(coin.price, bestTf);

              return (
                <tr
                  key={coin.id || coin.symbol}
                  onClick={() => onSelectCoin(coin)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  {/* Symbol & Platform */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                        {coin.symbol}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                        {coin.platform}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}
                  </td>

                  {/* 24h Change */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-xs ${
                        coin.priceChangePercent >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {coin.priceChangePercent >= 0 ? '+' : ''}
                      {coin.priceChangePercent?.toFixed(2)}%
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-4 font-mono text-text-muted">
                    ${(coin.quoteVolume / 1e6).toFixed(2)}M
                  </td>

                  {/* Multi-TF Radar */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5 font-mono text-[9px]">
                      {PRIORITY_ORDER.map((tf) => {
                        const status = analysis?.tfStatus?.[tf];
                        const active = status?.signalValid;
                        return (
                          <span
                            key={tf}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              active
                                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                                : 'text-white/30 hover:text-white/60'
                            }`}
                            title={`${tf}: ${active ? 'إشارة ارتداد متوافقة' : 'محايد'}`}
                          >
                            {tf}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Recommended Trade Levels */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${levels.badgeColor}`}>
                        {bestTf}
                      </span>
                      <span className="text-white font-bold">${levels.recommendedSizeUsd}</span>
                      <span className="text-rose-400">(-{levels.stopLossPercent}%)</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCoin(coin);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors"
                    >
                      فحص EWO 🔍
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
