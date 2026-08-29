import React, { useState } from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidTable = ({
  coins = [],
  multiTfAnalysisMap = {},
  onSelectCoin,
  favoritesSet = new Set(),
  onToggleFavorite,
  isCollapsed,
  setIsCollapsed
}) => {
  // الترتيب الافتراضي بحسب عدد الإشارات المتوافقة كما طلب المستخدم تماماً
  const [sortField, setSortField] = useState('activeSignals');
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

    if (aVal === bVal) {
      // كسر التعادل بالسيولة
      return (b.quoteVolume || 0) - (a.quoteVolume || 0);
    }
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  return (
    <div className="scanner-glass overflow-hidden border border-white/5 mb-6">
      {/* Table Header with Collapsible Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-3.5 bg-black/40 border-b border-white/5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">📋 جدول المسح المباشر (مرتب بحسب قوة الإشارات)</span>
          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {coins.length} زوج معروض
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="hidden sm:inline">اضغط على أي صف لفتح الشارت والـ EWO</span>
          <span className="font-mono">{isCollapsed ? '▼ عرض' : '▲ طي'}</span>
        </div>
      </div>

      {!isCollapsed && (
        <div className="overflow-x-auto animate-fade-in">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-text-muted font-mono uppercase text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-3 text-center w-10">⭐</th>
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
                <th
                  className="py-3 px-4 text-center cursor-pointer hover:text-amber-300 transition-colors bg-amber-500/5 font-bold"
                  onClick={() => handleSort('activeSignals')}
                >
                  🎯 الإشارات المتوافقة {sortField === 'activeSignals' ? (sortAsc ? '▲' : '▼') : '↕'}
                </th>
                <th className="py-3 px-4 text-center">رادار الفريمات (1D | 4h | 81m | 27m | 9m | 3m | 1m)</th>
                <th className="py-3 px-4">الصفقة الموصى بها</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedCoins.slice(0, 60).map((coin) => {
                const analysis = multiTfAnalysisMap[coin.symbol];
                const activeCount = analysis?.activeSignalsCount || 0;
                const bestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid) || "81m";
                const levels = calculateSowaidTradeLevels(coin.price, bestTf);
                const isFav = favoritesSet.has(coin.symbol);

                return (
                  <tr
                    key={coin.id || coin.symbol}
                    onClick={() => onSelectCoin(coin)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Favorite Star */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(coin.symbol);
                        }}
                        className={`text-sm p-1 transition-transform hover:scale-125 ${
                          isFav ? 'text-amber-400 font-bold' : 'text-white/20 hover:text-amber-300'
                        }`}
                        title={isFav ? 'إلغاء التثبيت من المفضلة' : 'تثبيت في المفضلة'}
                      >
                        {isFav ? '★' : '☆'}
                      </button>
                    </td>

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

                    {/* Signals Count Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          activeCount >= 3
                            ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                            : activeCount > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-white/5 text-white/40 border border-white/5'
                        }`}
                      >
                        {activeCount > 0 ? `⚡ ${activeCount}/7 إشارات` : '0 محايد'}
                      </span>
                    </td>

                    {/* Multi-TF Radar */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/5 font-mono text-[8px]">
                        {PRIORITY_ORDER.map((tf) => {
                          const status = analysis?.tfStatus?.[tf];
                          const active = status?.signalValid;
                          return (
                            <span
                              key={tf}
                              className={`px-1 py-0.5 rounded transition-all ${
                                active
                                  ? 'bg-emerald-500 text-black font-bold'
                                  : 'text-white/30'
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
                        الشارت و EWO 📊
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
