import React, { useMemo } from 'react';
import { TIMEFRAMES } from '../utils/infoConstants';
import { calculateTpoLevels } from '../utils/infoIndicators';

export const OverviewScreen = ({ framesData, activeSymbol }) => {
  const analysis = useMemo(() => {
    let ewoScore = 0;
    let rsiScore = 0;
    let macdScore = 0;
    let stScore = 0;
    const activeSq = [];

    TIMEFRAMES.forEach((tf) => {
      const candles = framesData[tf];
      if (candles && candles.length > 0) {
        const last = candles[candles.length - 1];
        if (last.ewo > 0) ewoScore++;
        if (last.rsi >= 50) rsiScore++;
        if (last.macd > last.macd_signal) macdScore++;
        if (last.supertrend_dir) stScore++;
        if (last.squeeze_on) activeSq.push(tf.toUpperCase());
      }
    });

    const df15m = framesData['15m'] || framesData['5m'] || [];
    const rsi15m = df15m.length > 0 ? df15m[df15m.length - 1].rsi : 50;

    const tpoRes = calculateTpoLevels(df15m);
    let tpoStatus = 'تداول طبيعي';
    if (tpoRes && df15m.length > 0) {
      const cPrice = df15m[df15m.length - 1].close;
      if (cPrice > tpoRes.vah) tpoStatus = 'كسر صاعد فوق VAH';
      else if (cPrice >= tpoRes.poc) tpoStatus = 'إيجابي فوق POC';
      else if (cPrice < tpoRes.val) tpoStatus = 'كسر هابط تحت VAL';
      else tpoStatus = 'داخل منطقة القيمة';
    }

    const totalPositives = ewoScore + rsiScore + macdScore + stScore;
    const bullishPct = Math.round((totalPositives / 32) * 100);

    let verdict = '🔴 مسار هابط حذر (High Bearish Risk)';
    let colorClass = 'rose';
    if (bullishPct >= 65) {
      verdict = '🟢 شراء قوي مؤكد (Strong Confluence)';
      colorClass = 'emerald';
    } else if (bullishPct >= 40) {
      verdict = '🟡 منطقة تذبذب / انتظار (Neutral)';
      colorClass = 'amber';
    }

    return {
      ewo: {
        score: `${ewoScore}/8`,
        status: ewoScore >= 5 ? 'زخم صاعد' : 'تصحيح / هابط',
        desc: `${ewoScore} فريمات فوق خط الصفر`,
        isBullish: ewoScore >= 5
      },
      rsi: {
        score: `${rsiScore}/8`,
        status: rsi15m >= 50 ? 'زخم صاعد (>50)' : 'ضعف زخم (<50)',
        desc: `RSI: ${rsi15m.toFixed(1)}`,
        isBullish: rsiScore >= 5
      },
      macd: {
        score: `${macdScore}/8`,
        status: macdScore >= 5 ? 'تقاطع صاعد' : 'تقاطع هابط',
        desc: `${macdScore} فريمات إيجابية`,
        isBullish: macdScore >= 5
      },
      supertrend: {
        score: `${stScore}/8`,
        status: stScore >= 5 ? 'مسار أخضر' : 'مسار أحمر',
        desc: `${stScore} فريمات صاعدة`,
        isBullish: stScore >= 5
      },
      squeeze: {
        score: `${activeSq.length} فريمات`,
        status: activeSq.length > 0 ? `انضغاط نشط (${activeSq.length})` : 'انفجار حر',
        desc: activeSq.length > 0 ? activeSq.join(', ') : 'طبيعي',
        isBullish: activeSq.length > 0
      },
      tpo: {
        score: 'Zone 70%',
        status: tpoStatus,
        desc: tpoRes ? `POC: ${tpoRes.poc.toFixed(2)}` : 'غير متاح',
        isBullish: tpoStatus.includes('صاعد') || tpoStatus.includes('إيجابي')
      },
      totalPositives,
      bullishPct,
      verdict,
      colorClass
    };
  }, [framesData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Confluence Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          analysis.colorClass === 'emerald'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : analysis.colorClass === 'amber'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌐</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                لوحة النظرة العامة التراكمية: <span className="font-mono text-primary">{activeSymbol}</span>
              </h2>
            </div>
            <p className="text-sm font-semibold text-white/90">
              التقييم الكلي للأصل: <span className="font-bold">{analysis.verdict}</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-text-muted">نسبة التوافق الصاعد</div>
              <div
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  analysis.colorClass === 'emerald'
                    ? 'text-emerald-400'
                    : analysis.colorClass === 'amber'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {analysis.bullishPct}%
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-text-muted">مجموع النقاط</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {analysis.totalPositives} <span className="text-sm text-text-muted font-normal">/ 32</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              analysis.colorClass === 'emerald'
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : analysis.colorClass === 'amber'
                ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
            }`}
            style={{ width: `${analysis.bullishPct}%` }}
          />
        </div>
      </div>

      {/* 6 Metric Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. EWO Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">🌊 1. Elliott Wave (EWO)</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.ewo.isBullish ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {analysis.ewo.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.ewo.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.ewo.desc}</div>
        </div>

        {/* 2. RSI Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">📊 2. RSI (14)</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.rsi.isBullish ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {analysis.rsi.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.rsi.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.rsi.desc}</div>
        </div>

        {/* 3. MACD Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">⚡ 3. MACD Momentum</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.macd.isBullish ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {analysis.macd.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.macd.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.macd.desc}</div>
        </div>

        {/* 4. Supertrend Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">🏹 4. Supertrend</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.supertrend.isBullish ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {analysis.supertrend.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.supertrend.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.supertrend.desc}</div>
        </div>

        {/* 5. TTM Squeeze Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">💥 5. TTM Squeeze</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.squeeze.isBullish ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/70'
                }`}
              >
                {analysis.squeeze.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.squeeze.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.squeeze.desc}</div>
        </div>

        {/* 6. TPO / Market Profile Card */}
        <div className="info-glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted">🎯 6. Market Profile (TPO)</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  analysis.tpo.isBullish ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                }`}
              >
                {analysis.tpo.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">{analysis.tpo.score}</div>
          </div>
          <div className="text-xs text-text-muted border-t border-white/5 pt-2 mt-2">{analysis.tpo.desc}</div>
        </div>
      </div>
    </div>
  );
};
