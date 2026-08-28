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

  // اختيار وترتيب أفضل عملات الزخم المتصدرة
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
            title={isExpanded ? 'طي الرادار' : 'توسيع الرادار'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>🫧</span>
              <span>رادار فقاعات الزخم والفرص الذكية (CryptoBubbles Style)</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Heatmap Dynamic
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">
              حجم البوكس يكبر تلقائياً حسب قوة الإشارات (المتصدر يشغل مساحة 3 بوكسات) مع ظهور كافة أيقونات الإشارات بداخله.
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

      {/* Dynamic Bubbles / Treemap Grid */}
      {isExpanded && (
        <div className="p-4">
          {trendingCoins.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted">
              لا توجد عملات في حالة زخم صاعد استثنائي حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5 [grid-auto-flow:dense]">
              {trendingCoins.map((coin, index) => {
                const isLeader = index === 0;
                const isRankTwoOrThree = index === 1 || index === 2;
                const isMedium = index >= 3 && index <= 5;

                // 1. تحديد حجم ومساحة البوكس مستوحى من CryptoBubbles:
                // المتصدر الأول يشغل مساحة 3 بوكسات (عرض وارتفاع مضاعف)
                const sizeClass = isLeader
                  ? 'col-span-2 row-span-2 sm:col-span-3 sm:row-span-2 md:col-span-3 md:row-span-2 min-h-[220px]'
                  : isRankTwoOrThree
                  ? 'col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 min-h-[170px]'
                  : isMedium
                  ? 'col-span-2 row-span-1 min-h-[125px]'
                  : 'col-span-1 row-span-1 min-h-[110px]';

                // 2. تدرج لوني ديناميكي وتوهج حسب شدة الزخم
                const cardTheme = isLeader
                  ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-900/50 via-emerald-950/40 to-black/90 shadow-[0_0_30px_rgba(52,211,153,0.25)] ring-2 ring-emerald-400/40'
                  : isRankTwoOrThree
                  ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-900/40 via-cyan-950/30 to-black/80 shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/30'
                  : isMedium
                  ? 'border-purple-500/40 bg-gradient-to-br from-purple-950/30 to-black/60 hover:border-purple-400/60'
                  : 'border-white/10 bg-black/40 hover:border-white/20';

                return (
                  <div
                    key={coin.id}
                    onClick={() => onSelectCoin(coin)}
                    className={`${sizeClass} ${cardTheme} p-4 rounded-3xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between group relative overflow-hidden select-none`}
                  >
                    {/* Background Ambient Glow for Leaders */}
                    {isLeader && (
                      <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
                    )}
                    {isRankTwoOrThree && (
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    {/* Top Row: Coin Symbol, Platform Icon, Rank & Market Badge */}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <PlatformBadge platformId={coin.platform} size={isLeader ? "w-6 h-6" : "w-4 h-4"} />
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`font-black tracking-tight text-white group-hover:text-primary transition-colors ${
                              isLeader ? 'text-xl sm:text-2xl' : isRankTwoOrThree ? 'text-base sm:text-lg' : 'text-sm'
                            }`}
                          >
                            {coin.baseAsset}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            #{index + 1}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg font-bold ${
                          coin.market === 'FUTURES'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {coin.market === 'FUTURES' ? '⚡ FUT' : '🪙 SPOT'}
                      </span>
                    </div>

                    {/* Center Section: Giant Percentage & Live Price (CryptoBubbles Style) */}
                    <div className="my-2 flex flex-col items-center justify-center text-center font-mono relative z-10">
                      <span
                        className={`font-black tracking-tight ${
                          isLeader
                            ? 'text-2xl sm:text-4xl text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                            : isRankTwoOrThree
                            ? 'text-xl sm:text-2xl text-emerald-400'
                            : 'text-base font-extrabold text-emerald-400'
                        }`}
                      >
                        {formatPercent(coin.priceChangePercent)}
                      </span>
                      <span className={`text-text-muted font-normal mt-0.5 ${isLeader ? 'text-sm' : 'text-xs'}`}>
                        ${formatPrice(coin.price)}
                      </span>
                    </div>

                    {/* Bottom Row: Explicit Signal Icons & Badges */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 relative z-10">
                      <span className="text-[11px] font-mono text-text-muted">
                        فوليوم: <strong className="text-white">{formatVolume(coin.quoteVolume)}</strong>
                      </span>

                      {/* أيقونات الإشارات ظاهرة بوضوح داخل البوكس */}
                      <div className="flex flex-wrap items-center gap-1">
                        {coin.signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-sans font-semibold shadow-sm ${sig.color}`}
                          >
                            <span>{sig.label}</span>
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
