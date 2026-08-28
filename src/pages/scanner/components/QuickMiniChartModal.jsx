import React, { useState, useEffect } from 'react';
import { formatPrice, formatPercent, formatVolume } from '../utils/technicalIndicators';
import { MARKET_TYPES } from '../utils/scannerConstants';

export const QuickMiniChartModal = ({ coin, marketType, onClose }) => {
  const [timeframe, setTimeframe] = useState('5m');
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coin) return;

    const fetchKlines = async () => {
      setLoading(true);
      setError(null);
      try {
        const symbol = coin.symbol;
        const endpoint =
          marketType === MARKET_TYPES.FUTURES
            ? `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=40`
            : `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=40`;

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

  if (!coin) return null;

  // حساب أبعاد الرسم SVG
  const chartHeight = 220;
  const chartWidth = 550;
  const padding = 20;

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 1;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val) => {
    return chartHeight - padding - ((val - minPrice) / priceRange) * (chartHeight - padding * 2);
  };

  const candleWidth = candles.length > 0 ? Math.max(4, (chartWidth - padding * 2) / candles.length - 3) : 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e131f] border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden text-right">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-text-muted hover:text-white transition-all text-sm"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{coin.baseAsset}</span>
                <span className="text-xs text-text-muted font-mono">/ USDT</span>
                <span className="text-[10px] bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 rounded font-mono">
                  {marketType}
                </span>
              </div>
              <div className="text-xs text-text-muted font-mono">
                السعر الحالي: <span className="text-white font-bold">${formatPrice(coin.price)}</span> (
                <span className={coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatPercent(coin.priceChangePercent)}
                </span>
                )
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base text-primary">
              {coin.baseAsset.substring(0, 3)}
            </div>
          </div>
        </div>

        {/* Timeframe Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">فريم الشارت:</span>
            {['1m', '3m', '5m', '15m', '1h'].map((tf) => (
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

          <div className="text-xs font-mono text-text-muted">
            أعلى: <span className="text-emerald-400">${formatPrice(maxPrice)}</span> | أدنى:{' '}
            <span className="text-rose-400">${formatPrice(minPrice)}</span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 mb-4 flex items-center justify-center min-h-[240px] relative">
          {loading && candles.length === 0 ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2"></div>
              <span className="text-xs text-text-muted font-mono">جاري قراءة الشموع اللحظية...</span>
            </div>
          ) : error ? (
            <div className="text-xs text-rose-400 font-mono">{error}</div>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              <line
                x1={padding}
                y1={getY(maxPrice)}
                x2={chartWidth - padding}
                y2={getY(maxPrice)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4"
              />
              <line
                x1={padding}
                y1={getY((maxPrice + minPrice) / 2)}
                x2={chartWidth - padding}
                y2={getY((maxPrice + minPrice) / 2)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4"
              />
              <line
                x1={padding}
                y1={getY(minPrice)}
                x2={chartWidth - padding}
                y2={getY(minPrice)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4"
              />

              {/* Candles */}
              {candles.map((c, i) => {
                const x = padding + i * ((chartWidth - padding * 2) / candles.length) + candleWidth / 2;
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(closeY - openY));
                const color = c.isGreen ? '#34d399' : '#f87171';

                return (
                  <g key={c.time}>
                    {/* Wick */}
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                    {/* Body */}
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
            </svg>
          )}
        </div>

        {/* Quick Stats & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
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
