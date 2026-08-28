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

  // اختيار أفضل العملات ذات الزخم والتحركات القوية
  const trendingCoins = [...items]
    .map(coin => ({
      ...coin,
      momentumScore: calculateMomentumScore(coin, btcChange),
      signals: detectScalpSignal(coin, btcChange)
    }))
    .filter(c => c.priceChangePercent > 1 || c.momentumScore >= 1)
    .sort((a, b) => b.momentumScore - a.momentumScore || b.priceChangePercent - a.priceChangePercent)
    .slice(0, 12);

  // استخراج الأيقونة فقط بدون نصوص
  const getSignalIconOnly = (type) => {
    switch (type) {
      case 'SURGE': return { icon: '🌊', title: 'انفجار سيولة ضخمة', color: 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40' };
      case 'PUMP': return { icon: '🚀', title: 'زخم صاعد حاد', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40' };
      case 'SQUEEZE': return { icon: '⚡', title: 'ضغط شورت (Short Squeeze)', color: 'text-amber-400 bg-amber-950/70 border-amber-500/40' };
      case 'ALPHA': return { icon: '🎯', title: 'ألفا وتفوق كاسح على البيتكوين', color: 'text-purple-400 bg-purple-950/70 border-purple-500/40' };
      case 'DUMP': return { icon: '📉', title: 'هبوط حاد', color: 'text-rose-400 bg-rose-950/70 border-rose-500/40' };
      default: return { icon: '⚡', title: 'إشارة زخم', color: 'text-white bg-white/10 border-white/20' };
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all">
      {/* Header Bar with Accordion Toggle & Live Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all text-xs"
            title={isExpanded ? 'طي الرادار' : 'توسيع الرادار'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📺</span>
              <span>رادار المراقبة اللحظية السريعة (Wall Monitor Radar)</span>
              <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/30 px-2 py-0.2 rounded-full">
                24h Watch
              </span>
            </h3>
          </div>
        </div>

        {/* Live Refresh Timer & Pause Indicator */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {isPaused ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 text-[11px] animate-pulse">
              <span>⏸️ متوقف مؤقتاً</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-text-muted">تحديث:</span>
              <span className="text-cyan-400 font-bold">{countdown}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact, Practical Monitor Grid (Low Height, Far-Readable, Pure Icons) */}
      {isExpanded && (
        <div className="p-3">
          {trendingCoins.length === 0 ? (
            <div className="text-center py-4 text-xs text-text-muted">
              السوق هادئ حالياً ولا توجد تحركات شاذة.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {trendingCoins.map((coin, index) => {
                const isLeader = index === 0;
                const isTopThree = index < 3;

                // ارتفاع عملي مدمج ومريح للعين مع مساحة إضافية طفيفة للمتصدر فقط عرضاً وليس ارتفاعاً
                const sizeClass = isLeader
                  ? 'col-span-2 sm:col-span-2 min-h-[105px]'
                  : 'col-span-1 min-h-[105px]';

                const cardStyle = isLeader
                  ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-black/60 to-black/80 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/40'
                  : isTopThree
                  ? 'border-cyan-500/40 bg-black/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20';

                return (
                  <div
                    key={coin.id}
                    onClick={() => onSelectCoin(coin)}
                    className={`${sizeClass} ${cardStyle} p-2.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group`}
                  >
                    {/* Top Row: Symbol, Exchange Icon, Market & Rank */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PlatformBadge platformId={coin.platform} size="w-3.5 h-3.5" />
                        <span className="font-black text-sm text-white tracking-tight group-hover:text-primary transition-colors">
                          {coin.baseAsset}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">
                          #{index + 1}
                        </span>
                      </div>

                      {/* أيقونات الإشارات فقط (بدون نصوص إطلاقاً) */}
                      <div className="flex items-center gap-1">
                        {coin.signals.map((sig, sIdx) => {
                          const iconInfo = getSignalIconOnly(sig.type);
                          return (
                            <span
                              key={sIdx}
                              title={iconInfo.title}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${iconInfo.color} shadow-sm transition-transform hover:scale-125 cursor-help`}
                            >
                              {iconInfo.icon}
                            </span>
                          );
                        })}
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                            coin.market === 'FUTURES'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {coin.market === 'FUTURES' ? 'FUT' : 'SPT'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Big, Legible Percentage Change (Readable from across the room) */}
                    <div className="flex items-baseline justify-between my-0.5 font-mono">
                      <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
                        {formatPercent(coin.priceChangePercent)}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        ${formatPrice(coin.price)}
                      </span>
                    </div>

                    {/* Bottom Row: Volume & Session Notice */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-text-muted">
                      <span>فوليوم: <strong className="text-white">{formatVolume(coin.quoteVolume)}</strong></span>
                      <span className="text-[9px] text-cyan-400/80">شمعة الجلسة</span>
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
