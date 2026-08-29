import React, { useState, useEffect, useMemo } from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { analyzeCoinMultiTf, calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidDetailModal = ({ coin, onClose, isFavorite, onToggleFavorite }) => {
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
  const activeTfSpecs = TF_SPECS[selectedTf] || TF_SPECS['81m'];

  // استخراج شموع وبيانات EWO للفريم المختار حالياً
  const tfChartData = analysis?.tfCharts?.[selectedTf];
  const candles = useMemo(() => tfChartData?.candles?.slice(-40) || [], [tfChartData]);
  const ewoData = useMemo(() => tfChartData?.ewo?.slice(-40) || [], [tfChartData]);

  // حساب أبعاد ونطاق شارت الشموع SVG
  const minPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 1;
  const priceRange = maxPrice - minPrice || 1;

  // حساب أبعاد شارت EWO SVG
  const minEwo = ewoData.length > 0 ? Math.min(...ewoData.map(e => e.ewo), 0) : -1;
  const maxEwo = ewoData.length > 0 ? Math.max(...ewoData.map(e => e.ewo), 0) : 1;
  const ewoAbsMax = Math.max(Math.abs(minEwo), Math.abs(maxEwo)) || 1;

  const chartW = 680;
  const candleChartH = 180;
  const ewoChartH = 100;

  // حالة إشارة الفريم المختار
  const tfStatus = analysis?.tfStatus?.[selectedTf];
  const e1 = tfStatus?.e1;
  const e2 = tfStatus?.e2;
  const e3 = tfStatus?.e3;
  const isRebound = tfStatus?.isRebound;
  const filterOk = tfStatus?.filterOk;
  const isSignalValid = tfStatus?.signalValid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="scanner-glass border border-white/10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-5 sm:p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-lg">
              {coin.baseAsset?.slice(0, 3) || coin.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{coin.symbol}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  SOWAID v4.0 Matrix
                </span>
                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(coin.symbol)}
                  className={`text-lg p-0.5 transition-transform hover:scale-125 ${
                    isFavorite ? 'text-amber-400 font-bold' : 'text-white/30 hover:text-amber-300'
                  }`}
                  title={isFavorite ? 'إلغاء التثبيت من المفضلة' : 'تثبيت في المفضلة'}
                >
                  {isFavorite ? '★ مثبت في المفضلة' : '☆ تثبيت'}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-0.5 font-mono">
                السعر الحالي: ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)} | التغير: {coin.priceChangePercent > 0 ? '+' : ''}{coin.priceChangePercent?.toFixed(2)}% | السيولة: ${(coin.quoteVolume / 1e6).toFixed(2)}M
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10 text-sm"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-muted">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono">جاري استخراج شموع الفريمات الـ 7 واحتساب مذبذب EWO...</span>
          </div>
        ) : (
          <div>
            {/* 1. Timeframe Switcher Tabs (All 7 TFs) */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-black/40 p-2 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted font-bold mr-1">الفريم النشط:</span>
                {PRIORITY_ORDER.map((tf) => {
                  const state = analysis?.tfStatus?.[tf];
                  const isValid = state?.signalValid;
                  const isSelected = selectedTf === tf;

                  return (
                    <button
                      key={tf}
                      onClick={() => setSelectedTf(tf)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{tf}</span>
                      {isValid && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-mono text-amber-300 font-bold px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                حالة إشارة {selectedTf}: {isSignalValid ? '✅ ارتداد مؤكد ومكتمل' : '⏸ غير مكتمل'}
              </div>
            </div>

            {/* 2. Top Chart: Candlestick Price Chart */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 mb-3">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted mb-2 border-b border-white/5 pb-1.5">
                <span className="text-white font-bold flex items-center gap-2">
                  <span>📈 شارت الشموع لفريم [{activeTfSpecs.label}]</span>
                  <span className="text-[10px] text-text-muted font-normal">({candles.length} شمعة)</span>
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>أعلى: <b className="text-white">${maxPrice.toFixed(4)}</b></span>
                  <span>أدنى: <b className="text-white">${minPrice.toFixed(4)}</b></span>
                </div>
              </div>

              {candles.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-text-muted text-xs font-mono">
                  لا تتوفر شموع كافية لهذا الفريم حالياً
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartW} ${candleChartH}`} className="w-full h-44 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2={chartW} y2="10" stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1={candleChartH / 2} x2={chartW} y2={candleChartH / 2} stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1={candleChartH - 10} x2={chartW} y2={candleChartH - 10} stroke="rgba(255,255,255,0.05)" />

                  {/* Stop Loss & Trailing lines */}
                  {levels.stopLossPrice >= minPrice && levels.stopLossPrice <= maxPrice && (
                    <g>
                      <line
                        x1="0"
                        y1={candleChartH - ((levels.stopLossPrice - minPrice) / priceRange) * (candleChartH - 20) - 10}
                        x2={chartW}
                        y2={candleChartH - ((levels.stopLossPrice - minPrice) / priceRange) * (candleChartH - 20) - 10}
                        stroke="#f43f5e"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      <text
                        x={chartW - 8}
                        y={candleChartH - ((levels.stopLossPrice - minPrice) / priceRange) * (candleChartH - 20) - 14}
                        fill="#f43f5e"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        وقف الخسارة SL (${levels.stopLossPrice.toFixed(2)})
                      </text>
                    </g>
                  )}

                  {/* Candlesticks */}
                  {candles.map((c, i) => {
                    const step = chartW / candles.length;
                    const x = i * step + step / 2;
                    const candleW = Math.max(step * 0.65, 3);

                    const yHigh = candleChartH - ((c.high - minPrice) / priceRange) * (candleChartH - 20) - 10;
                    const yLow = candleChartH - ((c.low - minPrice) / priceRange) * (candleChartH - 20) - 10;
                    const yOpen = candleChartH - ((c.open - minPrice) / priceRange) * (candleChartH - 20) - 10;
                    const yClose = candleChartH - ((c.close - minPrice) / priceRange) * (candleChartH - 20) - 10;

                    const color = c.isGreen ? '#34d399' : '#f87171';
                    const rectY = Math.min(yOpen, yClose);
                    const rectH = Math.max(Math.abs(yClose - yOpen), 1.5);

                    return (
                      <g key={i}>
                        {/* Wick */}
                        <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" opacity="0.8" />
                        {/* Candle Body */}
                        <rect
                          x={x - candleW / 2}
                          y={rectY}
                          width={candleW}
                          height={rectH}
                          fill={color}
                          rx="1"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* 3. Bottom Chart: Elliott Wave Oscillator (EWO) Sub-Chart */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 mb-4">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted mb-2 border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">🌊 مؤشر مذبذب إليوت (EWO: SMA5 - SMA35)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/80">
                    Median (High + Low) / 2
                  </span>
                </div>
                {e1 !== null && (
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span>E1 (الحالي): <b className={e1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{e1?.toFixed(4)}</b></span>
                    <span>E2: <b className={e2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{e2?.toFixed(4)}</b></span>
                    <span>E3: <b className={e3 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{e3?.toFixed(4)}</b></span>
                  </div>
                )}
              </div>

              {ewoData.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-text-muted text-xs font-mono">
                  يتطلب حساب EWO 35 شمعة على الأقل
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartW} ${ewoChartH}`} className="w-full h-28 overflow-visible">
                  {/* Zero Line */}
                  <line
                    x1="0"
                    y1={ewoChartH / 2}
                    x2={chartW}
                    y2={ewoChartH / 2}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                  />

                  {/* EWO Histogram Bars */}
                  {ewoData.map((eItem, i) => {
                    const step = chartW / ewoData.length;
                    const x = i * step + step / 2;
                    const barW = Math.max(step * 0.65, 3);
                    const zeroY = ewoChartH / 2;
                    const val = eItem.ewo;

                    const barH = (Math.abs(val) / ewoAbsMax) * (ewoChartH / 2 - 8);
                    const isPositive = val >= 0;
                    const barY = isPositive ? zeroY - barH : zeroY;

                    // تلوين ذكي: أخضر عند الصعود وأحمر عند الهبوط
                    const isRising = i > 0 ? val > ewoData[i - 1].ewo : val >= 0;
                    const barColor = isRising ? '#34d399' : '#f87171';

                    return (
                      <rect
                        key={i}
                        x={x - barW / 2}
                        y={barY}
                        width={barW}
                        height={Math.max(barH, 1)}
                        fill={barColor}
                        opacity={isPositive ? '0.9' : '0.8'}
                        rx="1"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Formula & Conditions Explanation */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-text-muted mt-2 pt-2 border-t border-white/5">
                <div>
                  شرط الارتداد: <span className={isRebound ? 'text-emerald-400 font-bold' : 'text-text-muted'}>E1 &lt; 0 و E1 &gt; E2 و E2 &le; E3 {isRebound ? '✅' : '❌'}</span>
                </div>
                <div>
                  فلتر الترند [{activeTfSpecs.filter}]: <span className={filterOk ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{filterOk ? 'متوافق وصاعد ✅' : 'غير متوافق ❌'}</span>
                </div>
              </div>
            </div>

            {/* 4. Strategy Trade Execution Specs & Sizing Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="text-white font-bold border-b border-white/5 pb-1.5 flex justify-between">
                  <span>🎯 مستويات تنفيذ صفقة [{activeTfSpecs.label}]</span>
                  <span className="text-amber-400">حجم ${levels.recommendedSizeUsd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">سعر الدخول:</span>
                  <span className="text-white font-bold">${currentPrice.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">وقف الخسارة SL (-{levels.stopLossPercent}%):</span>
                  <span className="text-rose-400 font-bold">${levels.stopLossPrice.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">الوقف المتحرك Trailing (+{levels.trailingPercent}%):</span>
                  <span className="text-sky-400 font-bold">${levels.trailingTriggerPrice.toFixed(4)}</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs font-mono">
                <div className="text-white font-bold border-b border-white/5 pb-1.5 flex justify-between">
                  <span>💰 محاكي رأس المال والمخاطرة</span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(Number(e.target.value))}
                      className="w-16 bg-white/5 border border-white/10 rounded px-1 text-white text-right focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">وزن الصفقة:</span>
                  <span className="text-amber-300 font-bold">
                    {((activeTfSpecs.size_usd / capital) * 100).toFixed(1)}% من المحفظة
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">أقصى خسارة ممكنة:</span>
                  <span className="text-rose-400 font-bold">
                    -${(activeTfSpecs.size_usd * activeTfSpecs.sl).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">هدف بداية حجز الأرباح:</span>
                  <span className="text-emerald-400 font-bold">
                    +${(activeTfSpecs.size_usd * activeTfSpecs.trail).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
