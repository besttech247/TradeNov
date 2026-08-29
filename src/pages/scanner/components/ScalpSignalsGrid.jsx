import React from 'react';
import { formatPrice, formatPercent, formatVolume } from '../utils/technicalIndicators';
import { PlatformBadge } from '../utils/platformLogos';

export const ScalpSignalsGrid = ({ signals = [], onSelectCoin }) => {
  if (!signals || signals.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center mb-6">
        <p className="text-sm text-text-muted">لا توجد إشارات مضاربة سريعة (Scalp) نشطة في اللحظة الحالية.</p>
      </div>
    );
  }

  // نعرض أعلى 2 إلى 5 صفقات سريعة مصنفة حسب الجودة
  const topScalps = signals.slice(0, 5);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <span>⚡</span>
          <span>صفقات المضاربة السريعة النشطة اليوم ({topScalps.length} صفقات)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            فريم 15m
          </span>
        </h3>
        <span className="text-xs text-text-muted font-mono">معدل الإغلاق: 1-3 ساعات</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {topScalps.map((s, idx) => (
          <div
            key={s.id || idx}
            onClick={() => onSelectCoin && onSelectCoin(s)}
            className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 bg-black/40 hover:bg-black/60 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Header: Symbol + Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-white text-sm group-hover:text-cyan-400 transition-colors">
                {s.symbol}
              </span>
              <PlatformBadge platform={s.platform} />
            </div>

            {/* Price & Change */}
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-base font-bold text-white font-mono">
                ${formatPrice(s.price)}
              </span>
              <span className={`text-xs font-mono font-bold ${s.priceChangePercent >= 0 ? 'text-success' : 'text-rose-400'}`}>
                {formatPercent(s.priceChangePercent)}
              </span>
            </div>

            {/* Scalp Levels Mini Box */}
            {s.scalpLevels && (
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-cyan-300">
                  <span>دخول معلق:</span>
                  <span>${formatPrice(s.scalpLevels.entry)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>الوقف (SL):</span>
                  <span>${formatPrice(s.scalpLevels.stopLoss)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>الهدف (TP):</span>
                  <span>${formatPrice(s.scalpLevels.takeProfit)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px] text-text-muted">
              <span>R:R {s.scalpLevels?.rrRatio || '1:2.0'}</span>
              <span className="text-cyan-400 font-bold">ثقة: {s.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
