import React, { useState, useMemo } from 'react';
import { TIMEFRAMES } from '../utils/infoConstants';
import {
  evalWave4,
  evalDivergence,
  evalSaucer,
  evalRsiOs,
  evalRsiC50,
  evalMacdCross,
  evalSupertrendFlip,
  evalSqueeze,
  evalTpo,
  calculateTpoLevels
} from '../utils/infoIndicators';

export const IndicatorScreen = ({
  selectedScreen,
  framesData,
  activeSymbol,
  countdownMap
}) => {
  // Sub-tabs for EWO & RSI
  const [ewoSubTab, setEwoSubTab] = useState('mtf');
  const [rsiSubTab, setRsiSubTab] = useState('os');

  // Multi-Timeframe calculations based on selected indicator & sub-tab
  const screenAnalysis = useMemo(() => {
    const scores = [];
    const signals = {};

    TIMEFRAMES.forEach((tf) => {
      const candles = framesData[tf] || [];

      if (selectedScreen === 'ewo') {
        let res = { text: '⚪ غير كافٍ', score: 0 };
        if (ewoSubTab === 'w4') res = evalWave4(candles);
        else if (ewoSubTab === 'div') res = evalDivergence(candles);
        else if (ewoSubTab === 'saucer') res = evalSaucer(candles);
        else {
          // MTF Pro
          const last = candles[candles.length - 1];
          const isPos = last && last.ewo > 0;
          res = {
            text: isPos ? '🟢 زخم صاعد فوق الصفر' : '🔴 زخم هابط تحت الصفر',
            score: isPos ? 1.0 : 0.0
          };
        }
        scores.push(res.score);
        signals[tf] = {
          text: res.text,
          val: candles.length > 0 ? candles[candles.length - 1].ewo : 0
        };
      } else if (selectedScreen === 'rsi') {
        const res = rsiSubTab === 'os' ? evalRsiOs(candles) : evalRsiC50(candles);
        scores.push(res.score);
        signals[tf] = {
          text: res.text,
          val: candles.length > 0 ? candles[candles.length - 1].rsi : 50
        };
      } else if (selectedScreen === 'macd') {
        const res = evalMacdCross(candles);
        scores.push(res.score);
        const last = candles[candles.length - 1] || {};
        signals[tf] = {
          text: res.text,
          macd: last.macd || 0,
          signal: last.macd_signal || 0
        };
      } else if (selectedScreen === 'supertrend') {
        const res = evalSupertrendFlip(candles);
        scores.push(res.score);
        const last = candles[candles.length - 1] || {};
        signals[tf] = {
          text: res.text,
          price: last.close || 0,
          stVal: last.supertrend || 0,
          dir: last.supertrend_dir
        };
      } else if (selectedScreen === 'squeeze') {
        const res = evalSqueeze(candles);
        scores.push(res.score);
        const last = candles[candles.length - 1] || {};
        signals[tf] = {
          text: res.text,
          isSqueeze: last.squeeze_on || false
        };
      } else if (selectedScreen === 'tpo') {
        const res = evalTpo(candles);
        scores.push(res.score);
        signals[tf] = {
          text: res.text,
          tpoRes: res.tpoRes
        };
      }
    });

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const badgeColor = totalScore >= 5 ? 'green' : totalScore >= 2.5 ? 'orange' : 'red';

    return { totalScore, badgeColor, signals };
  }, [selectedScreen, ewoSubTab, rsiSubTab, framesData]);

  // Title of current view
  const viewTitle = useMemo(() => {
    switch (selectedScreen) {
      case 'ewo':
        return `مؤشر موجات إليوت (EWO) — ${
          ewoSubTab === 'w4'
            ? 'تراجع الموجة الرابعة'
            : ewoSubTab === 'div'
            ? 'الدايفرجنس الصاعد'
            : ewoSubTab === 'saucer'
            ? 'نمط الصحن'
            : 'توافق الفريمات MTF Pro'
        }`;
      case 'rsi':
        return `مؤشر القوة النسبية (RSI) — ${
          rsiSubTab === 'os' ? 'ارتداد ذروة البيع (Oversold 30)' : 'اختراق خط المنتصف (50-Cross)'
        }`;
      case 'macd':
        return 'مؤشر تقاطع الماكد وزخم السيولة (MACD)';
      case 'supertrend':
        return 'فلتر الاتجاه الفائق (Supertrend Directional Filter)';
      case 'squeeze':
        return 'مؤشر الانضغاط السعري وقنوات كيلتنر (TTM Squeeze)';
      case 'tpo':
        return 'بروفايل السوق والفرصة الزمنية السعرية (TPO / Market Profile)';
      default:
        return '';
    }
  }, [selectedScreen, ewoSubTab, rsiSubTab]);

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tabs for EWO */}
      {selectedScreen === 'ewo' && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl">
          {[
            { id: 'mtf', label: '🎯 1. توافق الفريمات (MTF Pro)' },
            { id: 'w4', label: '🌊 2. Wave 4 Pullback' },
            { id: 'div', label: '📈 3. Bullish Divergence' },
            { id: 'saucer', label: '☕ 4. Zero Bounce (Saucer)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEwoSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                ewoSubTab === tab.id
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs for RSI */}
      {selectedScreen === 'rsi' && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl">
          {[
            { id: 'os', label: '⚡ 1. ارتداد ذروة البيع (Oversold 30)' },
            { id: 'c50', label: '📊 2. اختراق خط المنتصف (50-Cross)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRsiSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rsiSubTab === tab.id
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Header bar: Title & Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white">{viewTitle}</h2>
          <span className="text-xs text-text-muted font-mono">{activeSymbol}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">النقاط الإجمالية:</span>
          <span
            className={`info-badge ${
              screenAnalysis.badgeColor === 'green'
                ? 'info-badge-green'
                : screenAnalysis.badgeColor === 'orange'
                ? 'info-badge-orange'
                : 'info-badge-red'
            } text-sm px-3 py-1`}
          >
            {screenAnalysis.totalScore.toFixed(1)} / {TIMEFRAMES.length}
          </span>
        </div>
      </div>

      {/* Multi-Timeframe Charts Grid */}
      <div className="flex flex-col gap-3">
        {TIMEFRAMES.map((tf) => {
          const candles = framesData[tf] || [];
          const sig = screenAnalysis.signals[tf] || { text: 'غير متاح' };
          const countdown = countdownMap[tf] || '--:--';

          return (
            <div
              key={tf}
              className="info-chart-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
            >
              {/* Left Chart Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-white/10">
                      {tf.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">
                      ⏳ إغلاق الشمعة: <span className="text-primary font-bold">{countdown}</span>
                    </span>
                  </div>
                </div>

                {/* SVG Chart Rendering */}
                <div className="h-28 w-full bg-black/40 rounded-lg overflow-hidden border border-white/5 relative">
                  {candles.length > 0 ? (
                    <RenderIndicatorSvgChart
                      candles={candles}
                      selectedScreen={selectedScreen}
                      sig={sig}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-text-muted">
                      جاري تحميل بيانات الفريم...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Signal & Metric Sidebar */}
              <div className="w-full md:w-56 p-3 rounded-lg bg-black/30 border border-white/5 flex flex-col justify-between text-right">
                <div>
                  <div className="text-[11px] text-text-muted mb-1">الإشارة والقرار:</div>
                  <div className="text-xs font-bold text-white leading-relaxed mb-2">
                    {sig.text}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 text-[11px] font-mono text-text-muted">
                  {selectedScreen === 'ewo' && (
                    <span>EWO: <strong className={sig.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{Number(sig.val).toFixed(4)}</strong></span>
                  )}
                  {selectedScreen === 'rsi' && (
                    <span>RSI: <strong className={sig.val >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{Number(sig.val).toFixed(2)}</strong></span>
                  )}
                  {selectedScreen === 'macd' && (
                    <span>MACD: <strong className="text-primary">{Number(sig.macd).toFixed(3)}</strong> | Sig: <strong className="text-amber-400">{Number(sig.signal).toFixed(3)}</strong></span>
                  )}
                  {selectedScreen === 'supertrend' && (
                    <span>السعر: <strong className="text-white">{Number(sig.price).toFixed(2)}</strong> | ST: <strong className={sig.dir ? 'text-emerald-400' : 'text-rose-400'}>{Number(sig.stVal).toFixed(2)}</strong></span>
                  )}
                  {selectedScreen === 'squeeze' && (
                    <span>الحالة: <strong className={sig.isSqueeze ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{sig.isSqueeze ? '🔥 انضغاط نشط' : '✅ انفجار حر'}</strong></span>
                  )}
                  {selectedScreen === 'tpo' && sig.tpoRes && (
                    <div className="flex flex-col gap-0.5 text-[10px]">
                      <span>POC: <strong className="text-yellow-400">{sig.tpoRes.poc.toFixed(2)}</strong></span>
                      <span>VAH: <strong className="text-emerald-400">{sig.tpoRes.vah.toFixed(2)}</strong> | VAL: <strong className="text-rose-400">{sig.tpoRes.val.toFixed(2)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SVG Sub-chart Renderer
function RenderIndicatorSvgChart({ candles, selectedScreen, sig }) {
  const width = 600;
  const height = 112;
  const padding = 8;

  const n = candles.length;
  if (n < 2) return null;

  // 1. EWO: Bar Chart
  if (selectedScreen === 'ewo') {
    const ewos = candles.map((c) => c.ewo || 0);
    const maxVal = Math.max(0.0001, Math.max(...ewos.map(Math.abs)));
    const zeroY = height / 2;
    const barWidth = Math.max(2, (width - padding * 2) / n - 2);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Zero line */}
        <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
        {ewos.map((val, idx) => {
          const x = padding + idx * ((width - padding * 2) / n);
          const barHeight = (Math.abs(val) / maxVal) * (height / 2 - padding);
          const y = val >= 0 ? zeroY - barHeight : zeroY;
          const color = val >= 0 ? '#10b981' : '#f43f5e';
          return <rect key={idx} x={x} y={y} width={barWidth} height={Math.max(1, barHeight)} fill={color} rx={1} />;
        })}
      </svg>
    );
  }

  // 2. RSI: Line Chart with 70, 50, 30 levels
  if (selectedScreen === 'rsi') {
    const rsis = candles.map((c) => c.rsi || 50);
    const getY = (val) => height - padding - ((val - 10) / 80) * (height - padding * 2);

    const points = rsis
      .map((val, idx) => {
        const x = padding + idx * ((width - padding * 2) / (n - 1));
        return `${x},${getY(val)}`;
      })
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Level 70 */}
        <line x1={padding} y1={getY(70)} x2={width - padding} y2={getY(70)} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1" />
        {/* Level 50 */}
        <line x1={padding} y1={getY(50)} x2={width - padding} y2={getY(50)} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 2" strokeWidth="1" />
        {/* Level 30 */}
        <line x1={padding} y1={getY(30)} x2={width - padding} y2={getY(30)} stroke="#10b981" strokeDasharray="3 3" strokeWidth="1" />
        {/* RSI Line */}
        <polyline fill="none" stroke="#ab47bc" strokeWidth="2" points={points} />
      </svg>
    );
  }

  // 3. MACD: Histogram bars + MACD line + Signal line
  if (selectedScreen === 'macd') {
    const macds = candles.map((c) => c.macd || 0);
    const signals = candles.map((c) => c.macd_signal || 0);
    const hists = candles.map((c) => c.macd_hist || 0);

    const allVals = [...macds, ...signals, ...hists];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || 1;

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - padding * 2);
    const zeroY = getY(0);
    const barWidth = Math.max(2, (width - padding * 2) / n - 2);

    const macdPoints = macds
      .map((val, idx) => `${padding + idx * ((width - padding * 2) / (n - 1))},${getY(val)}`)
      .join(' ');

    const sigPoints = signals
      .map((val, idx) => `${padding + idx * ((width - padding * 2) / (n - 1))},${getY(val)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="rgba(255,255,255,0.15)" />
        {/* Hist bars */}
        {hists.map((val, idx) => {
          const x = padding + idx * ((width - padding * 2) / n);
          const y = val >= 0 ? getY(val) : zeroY;
          const barHeight = Math.abs(getY(val) - zeroY);
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, barHeight)}
              fill={val >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
            />
          );
        })}
        {/* MACD line */}
        <polyline fill="none" stroke="#29b6f6" strokeWidth="1.5" points={macdPoints} />
        {/* Signal line */}
        <polyline fill="none" stroke="#ffca28" strokeWidth="1.5" points={sigPoints} />
      </svg>
    );
  }

  // 4. Supertrend: Price line + Supertrend colored line
  if (selectedScreen === 'supertrend') {
    const closes = candles.map((c) => c.close || 0);
    const sts = candles.map((c) => c.supertrend || 0);
    const allVals = [...closes, ...sts];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || 1;

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - padding * 2);

    const pricePoints = closes
      .map((val, idx) => `${padding + idx * ((width - padding * 2) / (n - 1))},${getY(val)}`)
      .join(' ');

    const stPoints = sts
      .map((val, idx) => `${padding + idx * ((width - padding * 2) / (n - 1))},${getY(val)}`)
      .join(' ');

    const lastDir = candles[n - 1].supertrend_dir;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <polyline fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" points={pricePoints} />
        <polyline fill="none" stroke={lastDir ? '#10b981' : '#f43f5e'} strokeWidth="2" points={stPoints} />
      </svg>
    );
  }

  // 5. Squeeze: Bollinger Bands & Price
  if (selectedScreen === 'squeeze') {
    const uppers = candles.map((c) => c.bb_upper || 0);
    const lowers = candles.map((c) => c.bb_lower || 0);
    const closes = candles.map((c) => c.close || 0);

    const minVal = Math.min(...lowers, ...closes);
    const maxVal = Math.max(...uppers, ...closes);
    const range = maxVal - minVal || 1;

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - padding * 2);

    const upperPoints = uppers.map((val, idx) => [padding + idx * ((width - padding * 2) / (n - 1)), getY(val)]);
    const lowerPoints = lowers.map((val, idx) => [padding + idx * ((width - padding * 2) / (n - 1)), getY(val)]);

    const polyUpper = upperPoints.map((p) => `${p[0]},${p[1]}`).join(' ');
    const polyLowerRev = [...lowerPoints].reverse().map((p) => `${p[0]},${p[1]}`).join(' ');
    const bandPolygon = `${polyUpper} ${polyLowerRev}`;

    const pricePoints = closes
      .map((val, idx) => `${padding + idx * ((width - padding * 2) / (n - 1))},${getY(val)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Shaded BB Area */}
        <polygon points={bandPolygon} fill="rgba(33, 150, 243, 0.12)" />
        <polyline fill="none" stroke="rgba(33, 150, 243, 0.5)" strokeWidth="1" points={polyUpper} />
        <polyline fill="none" stroke="rgba(33, 150, 243, 0.5)" strokeWidth="1" points={lowerPoints.map((p) => `${p[0]},${p[1]}`).join(' ')} />
        <polyline fill="none" stroke="#ffffff" strokeWidth="1.5" points={pricePoints} />
      </svg>
    );
  }

  // 6. TPO: Candlesticks + POC + VAH + VAL
  if (selectedScreen === 'tpo') {
    const tpoRes = sig.tpoRes || calculateTpoLevels(candles);
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);

    const minVal = Math.min(...lows);
    const maxVal = Math.max(...highs);
    const range = maxVal - minVal || 1;

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - padding * 2);
    const candleWidth = Math.max(3, (width - padding * 2) / n - 3);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Candlesticks */}
        {candles.map((c, idx) => {
          const x = padding + idx * ((width - padding * 2) / n);
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const isGreen = c.close >= c.open;
          const bodyY = Math.min(yOpen, yClose);
          const bodyH = Math.max(1, Math.abs(yOpen - yClose));
          const color = isGreen ? '#10b981' : '#f43f5e';

          return (
            <g key={idx}>
              {/* Wick */}
              <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1" />
              {/* Body */}
              <rect x={x} y={bodyY} width={candleWidth} height={bodyH} fill={color} rx={0.5} />
            </g>
          );
        })}

        {/* TPO Lines */}
        {tpoRes && (
          <>
            {/* VAH Line */}
            <line x1={padding} y1={getY(tpoRes.vah)} x2={width - padding} y2={getY(tpoRes.vah)} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1" />
            {/* VAL Line */}
            <line x1={padding} y1={getY(tpoRes.val)} x2={width - padding} y2={getY(tpoRes.val)} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth="1" />
            {/* POC Line (Gold solid) */}
            <line x1={padding} y1={getY(tpoRes.poc)} x2={width - padding} y2={getY(tpoRes.poc)} stroke="#facc15" strokeWidth="2" />
          </>
        )}
      </svg>
    );
  }

  return null;
}
