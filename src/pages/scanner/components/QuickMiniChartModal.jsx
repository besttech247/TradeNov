import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice, formatPercent, formatVolume, calculateTradeLevels } from '../utils/technicalIndicators';
import { MARKET_TYPES } from '../utils/scannerConstants';

export const QuickMiniChartModal = ({ coin, marketType, onClose }) => {
  const [timeframe, setTimeframe] = useState('15m');
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVolumeProfile, setShowVolumeProfile] = useState(true);

  useEffect(() => {
    if (!coin) return;

    const fetchKlines = async () => {
      setLoading(true);
      setError(null);
      try {
        const symbol = coin.symbol;
        const endpoint =
          marketType === MARKET_TYPES.FUTURES
            ? `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=48`
            : `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=48`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('فشل جلب بيانات الشموع');
        const raw = await res.json();

        // format candles: [time, open, high, low, close, volume]
        const formatted = raw.map((c) => ({
          time: c[0],
          open: parseFloat(c[1]),
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4]),
          volume: parseFloat(c[5]),
          isGreen: parseFloat(c[4]) >= parseFloat(c[1])
        }));

        setCandles(formatted);
      } catch (err) {
        console.error('Error fetching klines:', err);
        setError('تعذر تحميل بيانات الشارت');
      } finally {
        setLoading(false);
      }
    };

    fetchKlines();
    const interval = setInterval(fetchKlines, 5000);
    return () => clearInterval(interval);
  }, [coin, marketType, timeframe]);

  // حساب أبعاد الرسم SVG
  const chartHeight = 240;
  const chartWidth = 580;
  const padding = 25;
  const rightMargin = 85; // مساحة لكتل الـ Volume Profile

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 1;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val) => {
    return chartHeight - padding - ((val - minPrice) / priceRange) * (chartHeight - padding * 2);
  };

  const candleAreaWidth = chartWidth - padding - rightMargin;
  const candleWidth = candles.length > 0 ? Math.max(3, (candleAreaWidth) / candles.length - 2.5) : 6;

  // حساب الـ Volume Profile والـ Point of Control (POC)
  const volumeProfileData = useMemo(() => {
    if (candles.length === 0) return { pocPrice: null, bins: [] };

    const binsCount = 18;
    const binSize = priceRange / binsCount;
    const bins = Array(binsCount).fill(0);

    for (const c of candles) {
      const typical = (c.high + c.low + c.close) / 3;
      let idx = Math.floor((typical - minPrice) / binSize);
      if (idx >= binsCount) idx = binsCount - 1;
      if (idx < 0) idx = 0;
      bins[idx] += c.volume;
    }

    const maxVol = Math.max(...bins);
    const maxIdx = bins.indexOf(maxVol);
    const pocPrice = minPrice + (maxIdx + 0.5) * binSize;

    const formattedBins = bins.map((v, i) => {
      const p = minPrice + (i + 0.5) * binSize;
      return {
        price: p,
        y: getY(p),
        height: Math.max(2, (chartHeight - padding * 2) / binsCount - 1.5),
        width: maxVol > 0 ? (v / maxVol) * 60 : 0,
        isPoc: i === maxIdx
      };
    });

    return { pocPrice, bins: formattedBins };
  }, [candles, minPrice, priceRange]);

  // احتساب مستويات الصفقة المقترحة (دخول معلق، وقف، هدف)
  const tradeLevels = useMemo(() => {
    if (!coin) return null;
    return coin.levels || calculateTradeLevels(coin.price, maxPrice, minPrice);
  }, [coin, maxPrice, minPrice]);

  if (!coin) return null;

  const { pocPrice, bins: vpBins } = volumeProfileData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden text-right">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 relative z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-text-muted hover:text-white transition-all text-sm"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">{coin.baseAsset}</span>
                <span className="text-xs text-text-muted font-mono">/ USDT</span>
                <span className="text-[10px] bg-primary/20 border border-primary/40 text-primary px-2 py-0.5 rounded font-mono font-bold">
                  {marketType}
                </span>
                {pocPrice && (
                  <span className="text-[10px] bg-amber-400/20 border border-amber-400/50 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                    POC: ${formatPrice(pocPrice)} 🏆
                  </span>
                )}
              </div>
              <div className="text-xs text-text-muted font-mono mt-0.5">
                السعر اللحظي: <span className="text-white font-bold">${formatPrice(coin.price)}</span> (
                <span className={coin.priceChangePercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatPercent(coin.priceChangePercent)}
                </span>
                )
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-black text-base text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              {coin.baseAsset.substring(0, 3)}
            </div>
          </div>
        </div>

        {/* Controls Bar: Timeframe & Toggle VP */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">الفريم:</span>
            {['1m', '5m', '15m', '1h', '4h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowVolumeProfile(!showVolumeProfile)}
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
                showVolumeProfile
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                  : 'bg-white/5 text-text-muted border-white/10'
              }`}
            >
              <span>📊</span>
              <span>Volume Profile POC</span>
            </button>
            <div className="text-xs font-mono text-text-muted">
              أعلى: <span className="text-emerald-400">${formatPrice(maxPrice)}</span> | أدنى:{' '}
              <span className="text-rose-400">${formatPrice(minPrice)}</span>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-2 mb-4 flex items-center justify-center min-h-[250px] relative overflow-hidden">
          {loading && candles.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2"></div>
              <span className="text-xs text-text-muted font-mono">جاري قراءة الشموع وملف الحجم POC...</span>
            </div>
          ) : error ? (
            <div className="text-xs text-rose-400 font-mono py-12">{error}</div>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Background Grid Lines */}
              <line x1={padding} y1={getY(maxPrice)} x2={chartWidth - padding} y2={getY(maxPrice)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={padding} y1={getY((maxPrice + minPrice) / 2)} x2={chartWidth - padding} y2={getY((maxPrice + minPrice) / 2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={padding} y1={getY(minPrice)} x2={chartWidth - padding} y2={getY(minPrice)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />

              {/* Volume Profile Histogram on the Right */}
              {showVolumeProfile && vpBins.map((bin, i) => (
                <rect
                  key={i}
                  x={chartWidth - padding - bin.width}
                  y={bin.y - bin.height / 2}
                  width={bin.width}
                  height={bin.height}
                  fill={bin.isPoc ? 'rgba(251, 191, 36, 0.45)' : 'rgba(0, 240, 255, 0.12)'}
                  stroke={bin.isPoc ? 'rgba(251, 191, 36, 0.8)' : 'none'}
                  strokeWidth="0.5"
                  rx="1"
                />
              ))}

              {/* Candlesticks */}
              {candles.map((c, i) => {
                const x = padding + i * ((candleAreaWidth) / candles.length) + candleWidth / 2;
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(1.8, Math.abs(closeY - openY));
                const color = c.isGreen ? '#34d399' : '#f87171';

                return (
                  <g key={c.time}>
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Volume Profile POC Line (ذهب / Amber) */}
              {showVolumeProfile && pocPrice && (
                <g>
                  <line
                    x1={padding}
                    y1={getY(pocPrice)}
                    x2={chartWidth - padding}
                    y2={getY(pocPrice)}
                    stroke="#fbbf24"
                    strokeWidth="1.8"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={chartWidth - padding - 75}
                    y={getY(pocPrice) - 8}
                    width={75}
                    height={16}
                    fill="#fbbf24"
                    rx="3"
                  />
                  <text
                    x={chartWidth - padding - 37}
                    y={getY(pocPrice) + 3.5}
                    fill="#000000"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    POC: {formatPrice(pocPrice)}
                  </text>
                </g>
              )}

              {/* Trade Execution Lines: Limit Entry, Stop Loss, Take Profit */}
              {tradeLevels && (
                <g>
                  {/* Limit Entry Line (Cyan) */}
                  <line
                    x1={padding}
                    y1={getY(tradeLevels.limitEntry)}
                    x2={chartWidth - padding - rightMargin}
                    y2={getY(tradeLevels.limitEntry)}
                    stroke="#22d3ee"
                    strokeWidth="1.2"
                    strokeDasharray="3"
                  />
                  <text
                    x={padding + 5}
                    y={getY(tradeLevels.limitEntry) - 3}
                    fill="#22d3ee"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    دخول معلق: ${formatPrice(tradeLevels.limitEntry)}
                  </text>

                  {/* Stop Loss Line (Red) */}
                  {tradeLevels.stopLoss >= minPrice && (
                    <>
                      <line
                        x1={padding}
                        y1={getY(tradeLevels.stopLoss)}
                        x2={chartWidth - padding - rightMargin}
                        y2={getY(tradeLevels.stopLoss)}
                        stroke="#f87171"
                        strokeWidth="1.2"
                        strokeDasharray="2"
                      />
                      <text
                        x={padding + 5}
                        y={getY(tradeLevels.stopLoss) - 3}
                        fill="#f87171"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        الوقف (SL): ${formatPrice(tradeLevels.stopLoss)}
                      </text>
                    </>
                  )}

                  {/* Take Profit Line (Green) */}
                  {tradeLevels.takeProfit <= maxPrice && (
                    <>
                      <line
                        x1={padding}
                        y1={getY(tradeLevels.takeProfit)}
                        x2={chartWidth - padding - rightMargin}
                        y2={getY(tradeLevels.takeProfit)}
                        stroke="#34d399"
                        strokeWidth="1.2"
                        strokeDasharray="2"
                      />
                      <text
                        x={padding + 5}
                        y={getY(tradeLevels.takeProfit) - 3}
                        fill="#34d399"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        الهدف (TP): ${formatPrice(tradeLevels.takeProfit)}
                      </text>
                    </>
                  )}
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Legend & Trade Execution Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px] font-mono">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
            <span>خط الـ POC الحوتي</span>
            <span className="font-bold">${pocPrice ? formatPrice(pocPrice) : '--'}</span>
          </div>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-between">
            <span>دخول معلق (Limit)</span>
            <span className="font-bold">${tradeLevels ? formatPrice(tradeLevels.limitEntry) : '--'}</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
            <span>وقف الخسارة (SL)</span>
            <span className="font-bold">${tradeLevels ? formatPrice(tradeLevels.stopLoss) : '--'}</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
            <span>الهدف المالي (TP)</span>
            <span className="font-bold">${tradeLevels ? formatPrice(tradeLevels.takeProfit) : '--'}</span>
          </div>
        </div>

        {/* Quick Stats & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-4 text-text-muted">
            <div>
              حجم 24h: <span className="text-white font-bold">{formatVolume(coin.quoteVolume)}</span>
            </div>
            {coin.fundingRate !== null && (
              <div>
                معدل التمويل:{' '}
                <span className="text-cyan-400 font-bold">{(coin.fundingRate * 100).toFixed(4)}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.binance.com/ar/${marketType === MARKET_TYPES.FUTURES ? 'futures' : 'trade'}/${coin.baseAsset}_USDT`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-primary text-black font-bold font-sans hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <span>فتح الصفقة على بينانس</span>
              <span>↗️</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
