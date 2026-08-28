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

  // اختيار أفضل العملات ذات الزخم الصاعد وترتيبها
  const trendingCoins = [...items]
    .map(coin => ({
      ...coin,
      momentumScore: calculateMomentumScore(coin, btcChange),
      signals: detectScalpSignal(coin, btcChange)
    }))
    .filter(c => c.priceChangePercent > 1 || c.momentumScore >= 1)
    .sort((a, b) => b.momentumScore - a.momentumScore || b.priceChangePercent - a.priceChangePercent)
    .slice(0, 12);

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
              <span>رادار بوكسات الزخم وفرص الصعود (Momentum Boxes)</span>
            </h3>
            <p className="text-[11px] text-text-muted">
              بوكسات متناسقة الحجم لأقوى العملات صعوداً وسيولة مع رتبة الزخم وتأكيد الصفقات.
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

      {/* Collapsible Body: Uniform Symmetrical Boxes */}
      {isExpanded && (
        <div className="p-4">
          {trendingCoins.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              لا توجد عملات في حالة زخم صاعد حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {trendingCoins.map((coin, index) => {
                const isLeader = index === 0;
                const isTopThree = index < 3;

                // تصميم بوكس موحد وثابت لجميع البطاقات (Uniform Boxes)
                const borderStyle = isLeader
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 to-black/60 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/40'
                  : isTopThree
                  ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-black/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20';

                return (
                  <div
                    key={coin.id}
                    onClick={() => onSelectCoin(coin)}
                    className={`${borderStyle} p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between aspect-square min-h-[145px] group relative overflow-hidden`}
                  >
                    {/* Top Row: Symbol, Rank Number & Platform */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-sm text-white tracking-tight group-hover:text-primary transition-colors">
                            {coin.baseAsset}
                          </span>
                          <span className="text-[9px] font-mono text-text-muted">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="mt-1">
                          <PlatformBadge platformId={coin.platform} />
                        </div>
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

                    {/* Middle Section: Price & 24h Change */}
                    <div className="my-1 flex flex-col items-center justify-center text-center font-mono">
                      <span className="text-xs text-text-muted font-normal">
                        ${formatPrice(coin.price)}
                      </span>
                      <span className="text-sm font-black text-emerald-400 mt-0.5">
                        {formatPercent(coin.priceChangePercent)}
                      </span>
                    </div>

                    {/* Bottom Row: Volume & Primary Signal */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-text-muted truncate max-w-[55px]">
                        {formatVolume(coin.quoteVolume)}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-cyan-300 border border-white/10 truncate max-w-[65px]">
                        {coin.signals[0]?.label || 'زخم صاعد'}
                      </span>
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
