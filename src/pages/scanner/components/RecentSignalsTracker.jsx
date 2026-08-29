import React, { useState, useEffect } from 'react';
import { formatPrice, formatPercent } from '../utils/technicalIndicators';
import { PlatformBadge } from '../utils/platformLogos';

/**
 * حساب الوقت المنقضي بصيغة بشرية باللغة العربية
 */
const formatTimeElapsed = (timestamp) => {
  if (!timestamp) return 'الآن';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  
  if (diffSec < 60) return `منذ ${diffSec} ثانية`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  if (diffHours < 24) {
    return remMin > 0 ? `منذ ${diffHours} س و ${remMin} د` : `منذ ${diffHours} ساعة`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
};

export const RecentSignalsTracker = ({
  recentSignals = [],
  currentDataMap = new Map(),
  onSelectCoin,
  onClearHistory
}) => {
  // عداد لتحديث الوقت المنقضي كل 10 ثوانٍ
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!recentSignals || recentSignals.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-black/40 mb-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            🕒
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>سجل آخر 5 صفقات مع تتبع الأداء اللحظي</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                مباشر (Live PnL)
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">مراقبة دقيقة لسرعة انطلاق الإشارة والتغير السعري من وقت الصدور حتى اللحظة</p>
          </div>
        </div>

        {onClearHistory && (
          <button
            onClick={onClearHistory}
            className="text-[11px] font-mono text-text-muted hover:text-rose-400 transition-colors flex items-center gap-1"
            title="مسح السجل المؤقت"
          >
            <span>🗑️</span>
            <span>مسح السجل</span>
          </button>
        )}
      </div>

      {/* Signals List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {recentSignals.slice(0, 5).map((sig) => {
          // جلب السعر اللحظي المحدث للعملة من الـ dataMap
          const liveCoin = currentDataMap.get(sig.id) || currentDataMap.get(`BINANCE_${sig.symbol}_FUTURES`) || currentDataMap.get(`BINANCE_${sig.symbol}_SPOT`);
          const currentPrice = liveCoin ? liveCoin.price : sig.signalPrice;
          
          // حساب نسبة التغير من سعر الإشارة إلى السعر الحالي
          const priceChangeSinceSignal = sig.signalPrice > 0
            ? +(((currentPrice - sig.signalPrice) / sig.signalPrice) * 100).toFixed(2)
            : 0;

          const isProfitable = priceChangeSinceSignal >= 0;
          const isSniper = sig.strategy === 'DAILY_SNIPER';

          return (
            <div
              key={sig.id + sig.timestamp}
              onClick={() => onSelectCoin && onSelectCoin(liveCoin || sig)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                isSniper
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400/60'
                  : 'bg-white/[0.02] border-white/10 hover:border-cyan-400/50'
              }`}
            >
              {/* Top Row: Symbol + Badge + Time Elapsed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-white text-sm group-hover:text-primary transition-colors">
                      {sig.symbol}
                    </span>
                    <PlatformBadge platform={sig.platform} />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSniper ? 'bg-amber-400/20 text-amber-300' : 'bg-cyan-400/20 text-cyan-300'
                  }`}>
                    {isSniper ? '🎯 قناص' : '⚡ سكالب'}
                  </span>
                </div>

                {/* Time Elapsed Ticker */}
                <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>{formatTimeElapsed(sig.timestamp)}</span>
                </div>
              </div>

              {/* Price Details & Live PnL */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span>سعر الإشارة:</span>
                  <span className="text-white">${formatPrice(sig.signalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span>السعر الآن:</span>
                  <span className="text-white font-bold">${formatPrice(currentPrice)}</span>
                </div>

                {/* Live PnL Pill */}
                <div className={`mt-2 p-1.5 rounded-xl text-center font-mono font-black text-xs flex items-center justify-center gap-1 ${
                  isProfitable
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  <span>{isProfitable ? '▲' : '▼'}</span>
                  <span>{formatPercent(priceChangeSinceSignal)}</span>
                  <span className="text-[10px] font-normal text-white/70">من الإشارة</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
