import React from 'react';

export function RadarStatsBar({
  regime,
  marketCount,
  topItem,
  lastUpdated,
  totalFoundCount
}) {
  const getRegimeColor = () => {
    switch (regime) {
      case 'BULLISH':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'BEARISH':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'RANGE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-text-muted bg-white/5 border-white/10';
    }
  };

  const getRegimeLabel = () => {
    switch (regime) {
      case 'BULLISH': return 'صاعد قوي (Bullish)';
      case 'BEARISH': return 'هابط قوي (Bearish)';
      case 'RANGE': return 'تذبذب عرضي (Range)';
      default: return 'جاري التحديد...';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. Market Regime (BTC Trend) */}
      <div className="p-3.5 rounded-2xl bg-background-light/40 border border-white/10 flex flex-col justify-between backdrop-blur-md">
        <span className="text-[11px] font-medium text-text-muted">اتجاه السوق (BTC REGIME)</span>
        <div className="mt-1 flex items-center justify-between">
          <span className={`text-xs font-black px-2 py-0.5 rounded-lg border font-mono ${getRegimeColor()}`}>
            {regime}
          </span>
          <span className="text-[10px] text-text-muted hidden sm:inline">{getRegimeLabel()}</span>
        </div>
      </div>

      {/* 2. Monitored Markets */}
      <div className="p-3.5 rounded-2xl bg-background-light/40 border border-white/10 flex flex-col justify-between backdrop-blur-md">
        <span className="text-[11px] font-medium text-text-muted">الأسواق الممسوحة (Bybit)</span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-black font-mono text-white">
            {totalFoundCount}
          </span>
          <span className="text-[10px] text-text-muted font-mono">/ {marketCount} زوج</span>
        </div>
      </div>

      {/* 3. Top Score */}
      <div className="p-3.5 rounded-2xl bg-background-light/40 border border-white/10 flex flex-col justify-between backdrop-blur-md">
        <span className="text-[11px] font-medium text-text-muted">أعلى تقييم (TOP SCORE)</span>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-cyan-400">
            {topItem ? topItem.score : '--'}
          </span>
          <span className="text-[10px] text-text-muted">/ 100</span>
        </div>
      </div>

      {/* 4. Top Symbol */}
      <div className="p-3.5 rounded-2xl bg-background-light/40 border border-white/10 flex flex-col justify-between backdrop-blur-md">
        <span className="text-[11px] font-medium text-text-muted">أقوى فرصة حالية</span>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-black font-mono text-amber-400">
            {topItem ? topItem.symbol : '---'}
          </span>
          {topItem && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              topItem.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {topItem.signal}
            </span>
          )}
        </div>
      </div>

      {/* 5. Last Updated */}
      <div className="col-span-2 md:col-span-1 p-3.5 rounded-2xl bg-background-light/40 border border-white/10 flex flex-col justify-between backdrop-blur-md">
        <span className="text-[11px] font-medium text-text-muted">آخر تحديث للبيانات</span>
        <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white/80">
          <span className="text-cyan-400 font-bold">⏱️</span>
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
