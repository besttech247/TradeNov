import React, { useState } from 'react';
import {
  formatPrice,
  formatPercent,
  formatVolume,
  calculateMomentumScore,
  detectScalpSignal
} from '../utils/technicalIndicators';
import { PlatformBadge } from '../utils/platformLogos';

export const MomentumCardsGrid = ({
  items,
  btcData,
  countdown,
  isPaused,
  onSelectCoin
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  const btcChange = btcData?.priceChangePercent || 0;

  // اختيار أفضل العملات ذات الزخم الصاعد
  const trendingCoins = [...items]
    .map(coin => ({
      ...coin,
      momentumScore: calculateMomentumScore(coin, btcChange),
      signals: detectScalpSignal(coin, btcChange)
    }))
    .filter(c => c.priceChangePercent > 2 || c.momentumScore >= 2)
    .sort((a, b) => b.momentumScore - a.momentumScore || b.priceChangePercent - a.priceChangePercent)
    .slice(0, 10);

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all">
      {/* Header Bar with Accordion Toggle & Live Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all text-xs"
            title={isExpanded ? 'طي الشبكة' : 'توسيع الشبكة'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>🔥</span>
              <span>شبكة رادار الزخم وفرص الصعود الذكية (Momentum Grid)</span>
            </h3>
            <p className="text-[11px] text-text-muted">
              حجم البطاقة يكبر تلقائياً كلما زادت إشارات انفجار السيولة والزخم الصاعد.
            </p>
          </div>
        </div>

        {/* Live Refresh Timer & Pause Indicator */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {isPaused ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
              <span>⏸️</span>
              <span>البث متوقف مؤقتاً</span>
            </span>
          ) : (
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-text-muted">التحديث القادم:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-cyan-400 font-bold">{countdown}s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="p-4">
          {trendingCoins.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              لا توجد عملات في حالة انفجار أو زخم صاعد استثنائي حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[minmax(110px,auto)]">
              {trendingCoins.map((coin) => {
                const isLeader = coin.momentumScore >= 4;
                const isSecondary = coin.momentumScore === 3;

                // تحجيم ديناميكي للبطاقة:
                const colSpanClass = isLeader
                  ? 'sm:col-span-2 md:col-span-2 lg:col-span-2'
                  : isSecondary
                  ? 'sm:col-span-2 md:col-span-2 lg:col-span-2'
                  : 'col-span-1';

                const borderStyle = isLeader
                  ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-black/50 to-black/80 shadow-[0_0_25px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/40'
                  : isSecondary
                  ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-black/40 to-black/70 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20';

                return (
                  <div
                    key={coin.id}
                    onClick={() => onSelectCoin(coin)}
                    className={`${colSpanClass} ${borderStyle} p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
                  >
                    {/* Background subtle glow */}
                    {isLeader && (
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    {/* Top Row: Symbol, Market Type, Platform Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black tracking-tight ${isLeader ? 'text-base sm:text-lg text-white' : 'text-sm text-white'}`}>
                          {coin.baseAsset}
                        </span>
                        <PlatformBadge platformId={coin.platform} />
                      </div>

                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          coin.market === 'FUTURES'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {coin.market === 'FUTURES' ? '⚡ FUT' : '🪙 SPOT'}
                      </span>
                    </div>

                    {/* Middle Row: Price & 24h Change */}
                    <div className="flex items-baseline justify-between mb-2 font-mono">
                      <span className={`font-bold text-white ${isLeader ? 'text-sm sm:text-base' : 'text-xs'}`}>
                        ${formatPrice(coin.price)}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {formatPercent(coin.priceChangePercent)}
                      </span>
                    </div>

                    {/* Bottom Row: Signals & Volume */}
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-white/5 text-[10px] font-mono">
                      <span className="text-text-muted">
                        فوليوم: <strong className="text-white">{formatVolume(coin.quoteVolume)}</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        {coin.signals.slice(0, 2).map((sig, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                            {sig.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
