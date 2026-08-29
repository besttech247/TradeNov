import React from 'react';
import { formatPrice, formatPercent, formatVolume } from '../utils/technicalIndicators';
import { PlatformBadge } from '../utils/platformLogos';

export const SniperTradeCard = ({ sniperSignal, onSelectCoin }) => {
  if (!sniperSignal) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/10 via-black/40 to-black/60 mb-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          🎯
        </div>
        <h3 className="text-lg font-black text-white mb-1">محرك القناص اليومي (Daily Sniper)</h3>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          النظام في وضع المسح والمراقبة الآن. لم تتطابق جميع الشروط الأربعة الصارمة (اختراق الـ POC + انضغاط Squeeze + دلتا CVD إيجابية + اتجاه BTC صاعد) على العملات القيادية حتى اللحظة.
        </p>
      </div>
    );
  }

  const { levels } = sniperSignal;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-950/20 via-black/70 to-black/90 mb-6 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            🎯
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black shadow-sm">
                صفقة القناص الحصرية لليوم
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                الثقة: {sniperSignal.score}% 🌟
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
              <span>{sniperSignal.symbol}</span>
              <PlatformBadge platform={sniperSignal.platform} />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-xs text-text-muted font-mono">السعر اللحظي</div>
            <div className="text-xl font-black text-white font-mono">
              ${formatPrice(sniperSignal.price)}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono ${
            sniperSignal.priceChangePercent >= 0 ? 'bg-success/20 text-success border border-success/30' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {formatPercent(sniperSignal.priceChangePercent)}
          </div>
          <button
            onClick={() => onSelectCoin && onSelectCoin(sniperSignal)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-amber-400 hover:text-black transition-all border border-white/20 flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>عرض الشارت</span>
          </button>
        </div>
      </div>

      {/* 4 Trade Execution Levels (The Quant Box) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5 relative z-10">
        {/* 1. Limit Pullback Entry */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-right">
          <div className="text-[10px] font-bold text-cyan-400 flex items-center justify-between mb-1">
            <span>أمر شراء معلق (Pullback)</span>
            <span>📥</span>
          </div>
          <div className="text-lg font-black text-white font-mono">
            ${formatPrice(levels.limitEntry)}
          </div>
          <div className="text-[9px] text-text-muted mt-0.5">تراجع 45% لإعادة الاختبار</div>
        </div>

        {/* 2. Stop Loss (ATR) */}
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-right">
          <div className="text-[10px] font-bold text-rose-400 flex items-center justify-between mb-1">
            <span>وقف الخسارة (SL)</span>
            <span>🛡️</span>
          </div>
          <div className="text-lg font-black text-rose-300 font-mono">
            ${formatPrice(levels.stopLoss)}
          </div>
          <div className="text-[9px] text-rose-400/80 mt-0.5">المخاطرة: -{levels.riskPct}% (1.6x ATR)</div>
        </div>

        {/* 3. Take Profit */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right">
          <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-between mb-1">
            <span>الهدف المالي (TP)</span>
            <span>🏆</span>
          </div>
          <div className="text-lg font-black text-emerald-300 font-mono">
            ${formatPrice(levels.takeProfit)}
          </div>
          <div className="text-[9px] text-emerald-400/80 mt-0.5">العائد: +{levels.rewardPct}% (3.5x ATR)</div>
        </div>

        {/* 4. Risk / Reward & Breakeven */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-right">
          <div className="text-[10px] font-bold text-amber-400 flex items-center justify-between mb-1">
            <span>نسبة العائد للمخاطرة</span>
            <span>⚖️</span>
          </div>
          <div className="text-lg font-black text-amber-300 font-mono">
            {levels.rrRatio}
          </div>
          <div className="text-[9px] text-amber-300/80 mt-0.5">نقل الوقف للدخول عند +1R</div>
        </div>
      </div>

      {/* Bottom Confluence Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-text-muted relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white/80 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            أسباب الدخول المؤكدة:
          </span>
          {sniperSignal.reasons.map((r, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-white/90 border border-white/5 font-mono">
              ✓ {r}
            </span>
          ))}
        </div>
        <div className="text-[11px] font-mono text-white/60">
          حجم السيولة: {formatVolume(sniperSignal.quoteVolume)}
        </div>
      </div>
    </div>
  );
};
