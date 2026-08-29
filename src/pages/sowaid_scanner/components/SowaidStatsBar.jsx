import React from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';

export const SowaidStatsBar = ({
  totalCoins = 0,
  btcData = null,
  activeReboundsCount = 0,
  isCollapsed,
  setIsCollapsed
}) => {
  const btcChange = btcData?.priceChangePercent || 0;
  const isBtcBullish = btcChange >= 0;

  return (
    <div className="mb-6">
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none text-xs text-text-muted hover:text-white mb-2 px-1"
      >
        <span className="font-bold flex items-center gap-1.5">
          <span>📊</span>
          <span>شريط المؤشرات الإحصائية العامة</span>
        </span>
        <span className="font-mono text-[11px]">{isCollapsed ? '▼ عرض' : '▲ طي'}</span>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {/* 1. Monitored Assets */}
          <div className="scanner-glass p-3 flex items-center gap-3 border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-base">
              📡
            </div>
            <div>
              <div className="text-[10px] text-text-muted">الأزواج المفحوصة</div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1">
                <span>{totalCoins}</span>
                <span className="text-[9px] text-emerald-400 font-normal">● مباشر</span>
              </div>
            </div>
          </div>

          {/* 2. 1D Master Filter Status */}
          <div className="scanner-glass p-3 flex items-center gap-3 border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 text-base">
              🧭
            </div>
            <div>
              <div className="text-[10px] text-text-muted">ترند البيتكوين (1D)</div>
              <div className="text-sm font-bold font-mono">
                <span className={isBtcBullish ? 'text-emerald-400' : 'text-rose-400'}>
                  {isBtcBullish ? 'صاعد (E1 > E2)' : 'تصحيحي (E1 <= E2)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Multi-TF Specs Quick Overview */}
          <div className="scanner-glass p-3 flex items-center gap-3 border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-base">
              ⚖️
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-text-muted">أوزان رأس المال (7 فريمات)</div>
              <div className="flex flex-wrap items-center gap-0.5 mt-0.5">
                {PRIORITY_ORDER.map((tf) => (
                  <span
                    key={tf}
                    className="text-[8px] font-mono px-1 rounded bg-white/5 border border-white/10 text-white/80"
                    title={`${TF_SPECS[tf].label}: حجم $${TF_SPECS[tf].size_usd}`}
                  >
                    {tf}:${TF_SPECS[tf].size_usd}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Active Rebound Signals */}
          <div className="scanner-glass p-3 flex items-center gap-3 border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-base">
              🎯
            </div>
            <div>
              <div className="text-[10px] text-text-muted">الارتدادات الجاهزة</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {activeReboundsCount > 0 ? `${activeReboundsCount} إشارة نشطة` : 'جاري الفحص...'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
