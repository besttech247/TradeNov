import React, { useState, useMemo } from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels, cleanCoinSymbol } from '../utils/sowaidEngine';

export const SowaidTable = ({
  coins = [],
  multiTfAnalysisMap = {},
  onSelectCoin,
  favoritesSet = new Set(),
  onToggleFavorite,
  isCollapsed,
  setIsCollapsed
}) => {
  // الترتيب الافتراضي: بحسب عدد الإشارات المتوافقة تنازلياً
  // الترتيب الافتراضي حسب السيولة لضمان ثبات الجدول وعدم قفز الصفوف أثناء الفحص الأولي
  const [sortField, setSortField] = useState('quoteVolume');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // تنازلياً دائماً عند الضغط الأول
    }
  };

  // دمج العملات المكررة (Binance Spot / Futures / Bybit) لكي يظهر كل رمز مرة واحدة فقط بنظافة
  const uniqueCoins = useMemo(() => {
    const map = new Map();
    (coins || []).forEach((c) => {
      const clean = cleanCoinSymbol(c.symbol);
      if (!map.has(clean)) {
        map.set(clean, c);
      } else {
        const existing = map.get(clean);
        if (c.market === 'FUTURES' || (c.quoteVolume || 0) > (existing.quoteVolume || 0)) {
          map.set(clean, c);
        }
      }
    });
    return Array.from(map.values());
  }, [coins]);

  // فرز القائمة بشكل مضمون ورصين يمنع القفزات
  const sortedCoins = useMemo(() => {
    return [...uniqueCoins].sort((a, b) => {
      const symA = cleanCoinSymbol(a.symbol);
      const symB = cleanCoinSymbol(b.symbol);

      let aVal = 0;
      let bVal = 0;

      if (sortField === 'activeSignals') {
        const itemA = multiTfAnalysisMap[symA];
        const itemB = multiTfAnalysisMap[symB];
        // وزن الإشارات: الصعود المؤكد (أخضر) = 10 نقاط، الاستعداد (أصفر) = 1 نقطة
        aVal = ((itemA?.activeSignalsCount || 0) * 10) + (itemA?.yellowSignalsCount || 0);
        bVal = ((itemB?.activeSignalsCount || 0) * 10) + (itemB?.yellowSignalsCount || 0);
      } else if (sortField === 'price') {
        aVal = a.price || 0;
        bVal = b.price || 0;
      } else if (sortField === 'priceChangePercent') {
        aVal = a.priceChangePercent || 0;
        bVal = b.priceChangePercent || 0;
      } else if (sortField === 'quoteVolume') {
        aVal = a.quoteVolume || 0;
        bVal = b.quoteVolume || 0;
      }

      if (aVal === bVal) {
        // عند التعادل نفرز بالسيولة كمعيار ثانوي ثابت
        return (b.quoteVolume || 0) - (a.quoteVolume || 0);
      }

      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [uniqueCoins, sortField, sortAsc, multiTfAnalysisMap]);

  return (
    <div className="scanner-glass overflow-hidden border border-white/5 mb-6">
      {/* Table Header with Collapsible Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-3.5 bg-black/40 border-b border-white/5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">📋 جدول المسح المباشر</span>
          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-mono">
            {sortedCoins.length} عملة مميزة
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
            مرتب بـ: {sortField === 'activeSignals' ? '🎯 قوة الإشارات' : sortField === 'price' ? 'السعر' : sortField === 'priceChangePercent' ? 'التغير' : 'السيولة'} {sortAsc ? '▲' : '▼'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="hidden sm:inline text-[11px]">اضغط على أي عمود لفرزه فوراً</span>
          <span className="font-mono">{isCollapsed ? '▼ عرض' : '▲ طي'}</span>
        </div>
      </div>

      {!isCollapsed && (
        <div className="overflow-x-auto animate-fade-in">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-text-muted font-mono uppercase text-[10px] border-b border-white/5 select-none">
              <tr>
                <th className="py-3 px-3 text-center w-10">⭐</th>
                <th className="py-3 px-4">الزوج / المنصة</th>
                <th
                  className={`py-3 px-4 cursor-pointer transition-colors ${sortField === 'price' ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
                  onClick={() => handleSort('price')}
                >
                  السعر {sortField === 'price' ? (sortAsc ? '▲' : '▼') : '↕'}
                </th>
                <th
                  className={`py-3 px-4 cursor-pointer transition-colors ${sortField === 'priceChangePercent' ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
                  onClick={() => handleSort('priceChangePercent')}
                >
                  تغير 24h {sortField === 'priceChangePercent' ? (sortAsc ? '▲' : '▼') : '↕'}
                </th>
                <th
                  className={`py-3 px-4 cursor-pointer transition-colors ${sortField === 'quoteVolume' ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
                  onClick={() => handleSort('quoteVolume')}
                >
                  السيولة (24h) {sortField === 'quoteVolume' ? (sortAsc ? '▲' : '▼') : '↕'}
                </th>
                <th
                  className={`py-3 px-4 text-center cursor-pointer transition-colors border-x border-white/5 ${sortField === 'activeSignals' ? 'text-amber-300 font-bold bg-amber-500/10' : 'hover:text-white bg-white/5'}`}
                  onClick={() => handleSort('activeSignals')}
                >
                  🎯 الإشارات المتوافقة {sortField === 'activeSignals' ? (sortAsc ? '▲' : '▼') : '↕'}
                </th>
                <th className="py-3 px-4 text-center">رادار الفريمات الـ 7</th>
                <th className="py-3 px-4">الصفقة الموصى بها</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedCoins.slice(0, 80).map((coin) => {
                const cleanSym = cleanCoinSymbol(coin.symbol);
                const analysis = multiTfAnalysisMap[cleanSym] || multiTfAnalysisMap[coin.symbol];
                const activeCount = analysis?.activeSignalsCount || 0;
                const bestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid || analysis?.tfStatus?.[tf]?.isSignalValid) || "81m";
                const levels = calculateSowaidTradeLevels(coin.price, bestTf);
                const isFav = favoritesSet.has(cleanSym);

                return (
                  <tr
                    key={cleanSym}
                    onClick={() => onSelectCoin(coin)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Favorite Star */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(cleanSym);
                        }}
                        className={`text-base p-1 transition-transform hover:scale-125 ${
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
                          {cleanSym}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                          {coin.platform || 'BINANCE'}
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
                      ${((coin.quoteVolume || 0) / 1e6).toFixed(2)}M
                    </td>

                    {/* Signals Count Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          activeCount >= 3
                            ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                            : activeCount > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : (analysis?.yellowSignalsCount || 0) > 0
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'bg-white/5 text-white/40 border border-white/5'
                        }`}
                      >
                        {activeCount > 0
                          ? `🟢 ${activeCount}/7 صعود`
                          : (analysis?.yellowSignalsCount || 0) > 0
                          ? `🟡 ${analysis.yellowSignalsCount}/7 استعداد`
                          : '0 محايد'}
                      </span>
                    </td>

                    {/* Multi-TF Radar */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/5 font-mono text-[8px]">
                        {PRIORITY_ORDER.map((tf) => {
                          const status = analysis?.tfStatus?.[tf];
                          const isGreen = status?.greenSignal || status?.signalValid;
                          const isYellow = status?.yellowSignal;
                          return (
                            <span
                              key={tf}
                              className={`px-1 py-0.5 rounded transition-all ${
                                isGreen
                                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                                  : isYellow
                                  ? 'bg-yellow-400 text-black font-bold shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                                  : 'text-white/30'
                              }`}
                              title={`${tf}: ${isGreen ? '🟢 صعود مؤكد (تنفيذ الشراء)' : isYellow ? '🟡 إشارة استعداد (تباطؤ الهبوط)' : 'محايد'}`}
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
