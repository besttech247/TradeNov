import React, { useState, useEffect } from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { analyzeCoinMultiTf, calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidDetailModal = ({ coin, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTf, setSelectedTf] = useState('81m');
  const [capital, setCapital] = useState(1000);

  useEffect(() => {
    if (!coin) return;
    let isMounted = true;
    setLoading(true);

    analyzeCoinMultiTf(coin.symbol, coin.market)
      .then((res) => {
        if (isMounted) {
          setAnalysis(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [coin]);

  if (!coin) return null;

  const currentPrice = analysis?.currentPrice || coin.price;
  const levels = calculateSowaidTradeLevels(currentPrice, selectedTf);

  // حساب توزيع رأس المال للمحاكاة
  const activeTfSpecs = TF_SPECS[selectedTf];
  const maxLossUsd = (activeTfSpecs.size_usd * activeTfSpecs.sl).toFixed(2);
  const trailingActivationUsd = (activeTfSpecs.size_usd * activeTfSpecs.trail).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="scanner-glass border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-lg">
              {coin.baseAsset?.slice(0, 3) || coin.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{coin.symbol}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  تحليل SOWAID v4.0
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 font-mono">
                السعر الحالي: ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)} | التغير: {coin.priceChangePercent > 0 ? '+' : ''}{coin.priceChangePercent?.toFixed(2)}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono">جاري احتساب EWO عبر الفريمات الـ 5 المدمجة...</span>
          </div>
        ) : (
          <div>
            {/* 5-Timeframe Matrix Cards */}
            <div className="mb-6">
              <div className="text-xs font-bold text-white mb-2.5 flex items-center justify-between">
                <span>⚡ رادار الفريمات الخمسة المباشر (1D | 4h | 81m | 27m | 9m)</span>
                <span className="text-amber-400 font-mono text-[11px]">
                  التوافق: {analysis?.activeSignalsCount || 0}/5 إشارات نشطة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {PRIORITY_ORDER.map((tf) => {
                  const spec = TF_SPECS[tf];
                  const state = analysis?.tfStatus?.[tf];
                  const isSelected = selectedTf === tf;
                  const isValid = state?.signalValid;

                  return (
                    <div
                      key={tf}
                      onClick={() => setSelectedTf(tf)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-bold text-white">{tf}</span>
                        <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                      </div>

                      <div className="font-mono text-xs font-bold my-1">
                        <span className={isValid ? 'text-emerald-400' : 'text-text-muted'}>
                          {isValid ? 'إشارة ارتداد ✅' : 'محايد ⏸'}
                        </span>
                      </div>

                      <div className="text-[10px] text-text-muted border-t border-white/5 pt-1.5 mt-1.5 flex flex-col gap-0.5 font-mono">
                        <div>حجم: ${spec.size_usd}</div>
                        <div>وقف: -{spec.sl * 100}%</div>
                        <div>تتبع: +{spec.trail * 100}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategy Trade Simulator & Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Selected Timeframe Execution Levels */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white">
                    🎯 معايير صفقة فريم [{levels.label}]
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    فلتر الترند: {levels.filterName}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-text-muted">سعر الدخول المقترح:</span>
                    <span className="text-white font-bold">${currentPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">وقف الخسارة الصارم (SL):</span>
                    <span className="text-rose-400 font-bold">
                      ${levels.stopLossPrice.toFixed(4)} (-{levels.stopLossPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">تفعيل الوقف المتحرك (Trailing):</span>
                    <span className="text-sky-400 font-bold">
                      +{levels.trailingPercent}% من أعلى قمة
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">حجم الصفقة المعتمد:</span>
                    <span className="text-amber-300 font-bold">${levels.recommendedSizeUsd} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">أقصى صفقات متزامنة للفريم:</span>
                    <span className="text-white font-bold">{levels.maxTrades} صفقات</span>
                  </div>
                </div>
              </div>

              {/* Capital Allocation & Risk Simulator */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white">💰 محاكي رأس المال والمخاطرة</span>
                  <span className="text-[10px] text-text-muted">نموذج $1,000</span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">رأس مال المحفظة:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white">$</span>
                      <input
                        type="number"
                        value={capital}
                        onChange={(e) => setCapital(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white text-right focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">نسبة الصفقة من المحفظة:</span>
                    <span className="text-amber-400 font-bold">
                      {((activeTfSpecs.size_usd / capital) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">أقصى خسارة محتملة (Max Risk):</span>
                    <span className="text-rose-400 font-bold">
                      -${maxLossUsd} ({((Number(maxLossUsd) / capital) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">بداية حجز الأرباح المتحركة:</span>
                    <span className="text-emerald-400 font-bold">+${trailingActivationUsd}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backtest Benchmark Stamp */}
            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-xs text-text-muted flex items-center justify-between font-mono">
              <span>🛡️ تم إثبات هذه الخوارزمية في باك تيست انهيار البيتكوين بنسبة فوز 58.8% وأقصى تراجع -7.55%.</span>
              <span className="text-amber-400 font-bold">SOWAID v4.0 Core</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
