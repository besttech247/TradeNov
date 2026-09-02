import React from 'react';
import { getAssetFundamentalProfile } from '../utils/macroEngine';

export const MacroScreen = ({ macroData, activeSymbol }) => {
  if (!macroData) {
    return (
      <div className="info-glass-panel p-8 text-center text-text-muted">
        <div className="animate-pulse">جاري تحميل بيانات الاقتصاد الكلي والسيولة الفيدرالية...</div>
      </div>
    );
  }

  const assetProfile = getAssetFundamentalProfile(activeSymbol, macroData);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Macro Environment Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          macroData.fedColor === 'emerald'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : macroData.fedColor === 'rose'
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🏛️</span>
          <h2 className="text-xl font-black text-white">التحليل الأساسي ومعدلات الفائدة الفيدرالية والسيولة</h2>
        </div>

        <div className="text-base font-bold text-white mb-4">
          🌐 بيئة السيولة الكلية الحالية:{' '}
          <span
            className={`font-black ${
              macroData.fedColor === 'emerald'
                ? 'text-emerald-400'
                : macroData.fedColor === 'rose'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            [{macroData.fedBias}]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-white/80">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-text-muted">مؤشر الخوف والجشع:</span>
            <span className="font-mono font-bold text-white">
              {macroData.fngVal}/100 ({macroData.fngClass})
            </span>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-text-muted">مؤشر الدولار (DXY):</span>
            <span className="font-mono font-bold text-primary">
              {macroData.dxyVal.toFixed(2)} ({macroData.dxyChange > 0 ? `+${macroData.dxyChange}` : macroData.dxyChange}%)
            </span>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-text-muted">عائد السندات (US10Y):</span>
            <span className="font-mono font-bold text-amber-400">{macroData.ir10y.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Fed Interest Rate Outlook */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🏦</span>
          <span>1. توقعات أسعار الفائدة الفيدرالية (Fed Interest Rate Outlook)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rate Cut */}
          <div className="info-glass-panel p-5 border-emerald-500/20 flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-muted font-bold">📉 احتمال خفض الفائدة (Rate Cut)</span>
              <div className="text-3xl font-black text-emerald-400 font-mono my-2">{macroData.probCut}%</div>
              {macroData.probCut > 50 && (
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                  إيجابي للذهب والكريبتو والأسهم
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted mt-3 pt-2 border-t border-white/5">
              دعم تدفق السيولة للأسواق الخطرة وتخفيض تكلفة الاقتراض
            </p>
          </div>

          {/* Hold */}
          <div className="info-glass-panel p-5 border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-muted font-bold">⏸️ احتمال تثبيت الفائدة (Hold)</span>
              <div className="text-3xl font-black text-white font-mono my-2">{macroData.probHold}%</div>
            </div>
            <p className="text-xs text-text-muted mt-3 pt-2 border-t border-white/5">
              استقرار معدلات الإقراض الحالية وترقب بيانات التضخم والوظائف
            </p>
          </div>

          {/* Rate Hike */}
          <div className="info-glass-panel p-5 border-rose-500/20 flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-muted font-bold">📈 احتمال رفع الفائدة (Rate Hike)</span>
              <div className="text-3xl font-black text-rose-400 font-mono my-2">{macroData.probHike}%</div>
              {macroData.probHike > 15 && (
                <div className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded w-fit">
                  سلبي / ضغط هابط
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted mt-3 pt-2 border-t border-white/5">
              تشديد نقدي وسحب السيولة نحو السندات والدولار الأمريكي
            </p>
          </div>
        </div>
      </div>

      {/* 3. Asset Fundamental Valuation */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🔍</span>
          <span>
            2. التقييم المالي والأساسي للأصل: <span className="font-mono text-primary">{activeSymbol}</span>
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assetProfile.metrics.map((m, idx) => (
            <div key={idx} className="info-glass-panel p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-text-muted font-bold">{m.label}</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono my-2">{m.value}</div>
                {m.delta && (
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {m.delta}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-3 pt-2 border-t border-white/5">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
