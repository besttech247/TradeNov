import React from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';

export const SowaidStatsBar = ({
  totalCoins = 0,
  btcData = null,
  activeReboundsCount = 0
}) => {
  const btcChange = btcData?.priceChangePercent || 0;
  const isBtcBullish = btcChange >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* 1. Monitored Assets */}
      <div className="scanner-glass p-3.5 flex items-center gap-3 border border-white/5">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">
          📡
        </div>
        <div>
          <div className="text-[11px] text-text-muted">العملات المفحوصة لحظياً</div>
          <div className="text-base font-bold text-white font-mono flex items-center gap-1.5">
            <span>{totalCoins} زوج</span>
            <span className="text-[10px] text-emerald-400 font-normal">● مباشر</span>
          </div>
        </div>
      </div>

      {/* 2. 1D Master Filter Status */}
      <div className="scanner-glass p-3.5 flex items-center gap-3 border border-white/5">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 text-lg">
          🧭
        </div>
        <div>
          <div className="text-[11px] text-text-muted">فلتر الترند الرئيسي (1D)</div>
          <div className="text-base font-bold font-mono flex items-center gap-1.5">
            <span className={isBtcBullish ? 'text-emerald-400' : 'text-rose-400'}>
              {isBtcBullish ? 'صاعد (E1 > E2)' : 'تصحيح (E1 <= E2)'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Multi-TF Specs Quick Overview */}
      <div className="scanner-glass p-3.5 flex items-center gap-3 border border-white/5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-lg">
          ⚖️
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-text-muted">توزيع أوزان الاستراتيجية</div>
          <div className="flex items-center gap-1 mt-0.5">
            {PRIORITY_ORDER.map((tf) => (
              <span
                key={tf}
                className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                title={`${TF_SPECS[tf].label}: حجم صفقة $${TF_SPECS[tf].size_usd} | وقف خسارة ${TF_SPECS[tf].sl * 100}%`}
              >
                {tf}:${TF_SPECS[tf].size_usd}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Active Rebound Signals */}
      <div className="scanner-glass p-3.5 flex items-center gap-3 border border-white/5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-lg">
          🎯
        </div>
        <div>
          <div className="text-[11px] text-text-muted">إشارات الارتداد النشطة</div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {activeReboundsCount > 0 ? `${activeReboundsCount} فرصة جاهزة` : 'جاري الفحص...'}
          </div>
        </div>
      </div>
    </div>
  );
};
