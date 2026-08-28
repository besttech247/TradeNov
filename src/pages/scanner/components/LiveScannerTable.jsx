import React, { useState } from 'react';
import {
  formatPrice,
  formatPercent,
  formatVolume,
  formatFundingRate,
  detectScalpSignal,
  calculateBtcRelativeStrength
} from '../utils/technicalIndicators';
import { PlatformBadge } from '../utils/platformLogos';
import { MARKET_TYPES } from '../utils/scannerConstants';

export const LiveScannerTable = ({
  items,
  btcData,
  marketType,
  isPaused,
  onSelectCoin,
  loading
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

  const sortedItems = [...items].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'alpha') {
      const btcChange = btcData?.priceChangePercent || 0;
      aVal = calculateBtcRelativeStrength(a.priceChangePercent, btcChange);
      bVal = calculateBtcRelativeStrength(b.priceChangePercent, btcChange);
    }

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted text-sm font-mono">جاري فحص السيولة من المنصات المتعددة (CEX & DEX)...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-12 bg-white/[0.02] border border-white/5 rounded-2xl">
        <p className="text-text-muted text-sm">لا توجد عملات تطابق شروط الفلترة المحددة.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-md shadow-2xl relative">
      {/* Visual Watermark if Paused */}
      {isPaused && (
        <div className="sticky top-0 z-20 bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs font-mono text-amber-300 backdrop-blur-md">
          ⏸️ السكانر متوقف مؤقتاً (Frozen) - يمكنك الفحص والضغط على الصفقات بحرية
        </div>
      )}

      <table className="w-full text-right border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-text-muted text-[11px] font-mono">
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>
              الزوج / المنصة {sortField === 'symbol' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-center cursor-pointer hover:text-white" onClick={() => handleSort('market')}>
              النوع (Market) {sortField === 'market' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
              السعر اللحظي {sortField === 'price' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('priceChangePercent')}>
              تغير 24h {sortField === 'priceChangePercent' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('quoteVolume')}>
              السيولة / الفوليوم {sortField === 'quoteVolume' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('fundingRate')}>
              التمويل (Funding) {sortField === 'fundingRate' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('alpha')}>
              الألفا vs BTC {sortField === 'alpha' && (sortAsc ? '▲' : '▼')}
            </th>
            <th className="p-3.5 text-center">إشارات الزخم ⚡</th>
            <th className="p-3.5 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-mono">
          {sortedItems.map((item) => {
            const isPositive = item.priceChangePercent >= 0;
            const btcChange = btcData?.priceChangePercent || 0;
            const alphaVsBtc = calculateBtcRelativeStrength(item.priceChangePercent, btcChange);
            const signals = detectScalpSignal(item, btcChange);

            // رابط التداول حسب المنصة
            const tradeUrl =
              item.platform === 'BYBIT'
                ? `https://www.bybit.com/trade/usdt/${item.symbol}`
                : item.platform === 'DEX'
                ? item.dexUrl || `https://dexscreener.com/search?q=${item.baseAsset}`
                : `https://www.binance.com/ar/${item.market === 'FUTURES' ? 'futures' : 'trade'}/${item.baseAsset}_USDT`;

            return (
              <tr
                key={item.id}
                className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                onClick={() => onSelectCoin(item)}
              >
                {/* 1. Symbol & Platform */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:border-primary/50 transition-colors">
                      {item.baseAsset.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{item.baseAsset}</span>
                        <span className="text-[10px] text-text-muted font-normal">/ {item.quoteAsset}</span>
                      </div>
                      <div className="mt-0.5">
                        <PlatformBadge platformId={item.platform} />
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Market Type Badge (Spot vs Futures with distinctive color) */}
                <td className="p-3.5 text-center">
                  {item.market === 'FUTURES' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <span>⚡</span>
                      <span>FUTURES</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      <span>🪙</span>
                      <span>SPOT</span>
                    </span>
                  )}
                </td>

                {/* 3. Live Price */}
                <td className="p-3.5 text-right">
                  <div className="font-bold text-sm text-white">
                    ${formatPrice(item.price)}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    L: ${formatPrice(item.lowPrice)} | H: ${formatPrice(item.highPrice)}
                  </div>
                </td>

                {/* 4. 24h Change */}
                <td className="p-3.5 text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {formatPercent(item.priceChangePercent)}
                  </span>
                </td>

                {/* 5. Volume */}
                <td className="p-3.5 text-right font-bold text-text-main">
                  <div>{formatVolume(item.quoteVolume)}</div>
                  <div className="text-[10px] text-text-muted font-normal">
                    {formatVolume(item.volume)} {item.baseAsset}
                  </div>
                </td>

                {/* 6. Funding Rate */}
                <td className="p-3.5 text-right">
                  {item.market === 'FUTURES' ? (
                    <div
                      className={`font-bold ${
                        (item.fundingRate || 0) < -0.0003
                          ? 'text-cyan-400 font-extrabold animate-pulse'
                          : (item.fundingRate || 0) > 0.0005
                          ? 'text-amber-400'
                          : 'text-text-muted'
                      }`}
                    >
                      {formatFundingRate(item.fundingRate)}
                    </div>
                  ) : (
                    <span className="text-text-muted/40 text-xs">---</span>
                  )}
                </td>

                {/* 7. Alpha vs BTC */}
                <td className="p-3.5 text-right">
                  <span
                    className={`text-xs font-bold ${
                      alphaVsBtc > 0 ? 'text-purple-400' : 'text-text-muted'
                    }`}
                  >
                    {alphaVsBtc > 0 ? `+${alphaVsBtc}%` : `${alphaVsBtc}%`}
                  </span>
                </td>

                {/* 8. Scalping Signals */}
                <td className="p-3.5 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {signals.length > 0 ? (
                      signals.map((sig, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-sans font-semibold ${sig.color}`}
                        >
                          {sig.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-text-muted/40 font-mono">طبيعي</span>
                    )}
                  </div>
                </td>

                {/* 9. Actions */}
                <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onSelectCoin(item)}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-sans transition-all"
                      title="عرض الشارت السريع"
                    >
                      📈 شارت
                    </button>
                    <a
                      href={tradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-text-muted hover:text-white transition-all text-xs"
                      title={`فتح على ${item.platform}`}
                    >
                      ↗️
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
