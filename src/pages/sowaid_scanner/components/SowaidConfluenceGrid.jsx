import React from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels, cleanCoinSymbol } from '../utils/sowaidEngine';

export const SowaidConfluenceGrid = ({
  topCoins = [],
  multiTfAnalysisMap = {},
  onSelectCoin,
  favoritesSet = new Set(),
  onToggleFavorite,
  isCollapsed,
  setIsCollapsed
}) => {
  if (!topCoins || topCoins.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header with Collapsible Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none mb-3 px-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">⚡ رادار التوافق العالي (Multi-TF Confluence Leaders)</span>
          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            أعلى تكرار للإشارات
          </span>
        </div>

        <button className="text-xs text-text-muted hover:text-white flex items-center gap-1 font-mono">
          <span>{isCollapsed ? 'عرض وتوسيع' : 'طي النافذة'}</span>
          <span className="text-sm">{isCollapsed ? '▼' : '▲'}</span>
        </button>
      </div>

      {/* Grid Content */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in">
          {topCoins.map((coin) => {
            const cleanSym = cleanCoinSymbol(coin.symbol);
            const analysis = multiTfAnalysisMap[cleanSym] || multiTfAnalysisMap[coin.symbol];
            const activeCount = analysis?.activeSignalsCount || 0;
            const highestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid || analysis?.tfStatus?.[tf]?.isSignalValid) || "81m";
            const tradeLevels = calculateSowaidTradeLevels(coin.price, highestTf);
            const isFav = favoritesSet.has(coin.symbol);

            return (
              <div
                key={coin.id || coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="scanner-glass p-4 border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 duration-200 relative overflow-hidden"
              >
                {/* Top Row: Symbol, Favorite Star & Price */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm group-hover:scale-105 transition-transform">
                      {coin.baseAsset?.slice(0, 3) || coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm">{coin.symbol}</span>
                        <span className="text-[10px] text-text-muted font-mono bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                          {coin.platform}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted">
                        حجم: ${(coin.quoteVolume / 1e6).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-mono font-bold ${
                          coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {coin.priceChangePercent >= 0 ? '+' : ''}
                        {coin.priceChangePercent?.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(coin.symbol);
                      }}
                      className={`text-base p-1 transition-transform hover:scale-125 ${
                        isFav ? 'text-amber-400' : 'text-white/20 hover:text-amber-300'
                      }`}
                      title={isFav ? 'إلغاء التثبيت' : 'تثبيت في المفضلة'}
                    >
                      {isFav ? '★' : '☆'}
                    </button>
                  </div>
                </div>

                {/* Middle Row: 7 Timeframes Radar Pills */}
                <div className="mb-3 bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-muted mb-1.5 flex items-center justify-between">
                    <span>رادار الفريمات الـ 7 (EWO):</span>
                    <span className="font-bold font-mono">
                      {activeCount > 0 ? (
                        <span className="text-emerald-400">🟢 {activeCount}/7 صعود</span>
                      ) : (analysis?.yellowSignalsCount || 0) > 0 ? (
                        <span className="text-yellow-400">🟡 {analysis.yellowSignalsCount}/7 استعداد</span>
                      ) : (
                        <span className="text-white/40">0/7 محايد</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px]">
                    {PRIORITY_ORDER.map((tf) => {
                      const status = analysis?.tfStatus?.[tf];
                      const isGreen = status ? (status.greenSignal || status.signalValid) : false;
                      const isYellow = status?.yellowSignal;
                      return (
                        <div
                          key={tf}
                          className={`py-1 rounded-lg border transition-all ${
                            isGreen
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)] font-bold'
                              : isYellow
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)] font-bold'
                              : 'bg-white/5 text-white/30 border-white/5'
                          }`}
                        >
                          <div>{tf}</div>
                          <div className="text-[7px] opacity-80">
                            {isGreen ? '🟢' : isYellow ? '🟡' : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: Risk / Reward specs */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono text-text-muted">
                  <div>
                    حجم: <span className="text-white font-bold">${tradeLevels.recommendedSizeUsd}</span>
                  </div>
                  <div>
                    وقف: <span className="text-rose-400">-{tradeLevels.stopLossPercent}%</span>
                  </div>
                  <div>
                    تتبع: <span className="text-sky-400">+{tradeLevels.trailingPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
