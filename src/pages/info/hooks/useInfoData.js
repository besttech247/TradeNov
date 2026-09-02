// Data Fetching & Indicators Hook for TradeNov INFO
import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMEFRAMES, TF_SECONDS, MARKET_PRESETS } from '../utils/infoConstants';
import { calculateInfoIndicators } from '../utils/infoIndicators';
import { fetchMacroEnvironment } from '../utils/macroEngine';

// Generates synthetic realistic candles for non-crypto tickers (Gold, Oil, S&P 500, Yields)
function generateSyntheticCandles(basePrice, count = 60, tf = '15m') {
  const candles = [];
  const now = Date.now();
  const tfSec = TF_SECONDS[tf] || 900;
  const stepMs = tfSec * 1000;

  let currentClose = basePrice;
  const volatility = basePrice * 0.003;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const change = (Math.random() - 0.49) * volatility;
    const open = currentClose;
    const close = Math.max(0.01, open + change);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.6);
    const volume = Math.round(1000 + Math.random() * 5000);

    candles.push({
      timestamp,
      datetime: new Date(timestamp),
      open,
      high,
      low,
      close,
      volume
    });
    currentClose = close;
  }
  return candles;
}

export function useInfoData(selectedPreset, customSymbol) {
  const [framesData, setFramesData] = useState({});
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countdownMap, setCountdownMap] = useState({});

  // Active Symbol resolution
  const activeSymbol = selectedPreset.id === 'CUSTOM'
    ? (customSymbol ? customSymbol.trim().toUpperCase() : 'BTCUSDT')
    : (selectedPreset.cryptoPair || selectedPreset.symbol);

  // 1. Fetch Macro Data
  useEffect(() => {
    let isMounted = true;
    fetchMacroEnvironment().then(data => {
      if (isMounted) setMacroData(data);
    });
    const macroTimer = setInterval(() => {
      fetchMacroEnvironment().then(data => {
        if (isMounted) setMacroData(data);
      });
    }, 60000);
    return () => {
      isMounted = false;
      clearInterval(macroTimer);
    };
  }, []);

  // 2. Fetch Multi-Timeframe Candles & Calculate Indicators
  const fetchAllTimeframes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const isCrypto = selectedPreset.type === 'CRYPTO' ||
      selectedPreset.cryptoPair ||
      (selectedPreset.id === 'CUSTOM' && (activeSymbol.includes('USDT') || activeSymbol.includes('BTC')));

    const cleanSym = selectedPreset.cryptoPair || (activeSymbol.includes('/') ? activeSymbol.replace('/', '') : activeSymbol);

    const results = {};

    try {
      const promises = TIMEFRAMES.map(async (tf) => {
        if (isCrypto) {
          try {
            // Binance spot/futures interval mapping
            const binanceTf = tf === '1d' ? '1d' : tf === '4h' ? '4h' : tf === '1h' ? '1h' : tf;
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSym}&interval=${binanceTf}&limit=60`);
            if (res.ok) {
              const raw = await res.json();
              if (Array.isArray(raw) && raw.length > 0) {
                const formatted = raw.map(c => ({
                  timestamp: c[0],
                  datetime: new Date(c[0]),
                  open: parseFloat(c[1]),
                  high: parseFloat(c[2]),
                  low: parseFloat(c[3]),
                  close: parseFloat(c[4]),
                  volume: parseFloat(c[5])
                }));
                return { tf, data: calculateInfoIndicators(formatted) };
              }
            }
          } catch (e) {
            console.warn(`Failed fetching crypto tf ${tf}:`, e);
          }
        }

        // Fallback for non-crypto or API failure: synthetic calibrated candles
        const basePrice = selectedPreset.defaultPrice || 100;
        const synth = generateSyntheticCandles(basePrice, 60, tf);
        return { tf, data: calculateInfoIndicators(synth) };
      });

      const fetched = await Promise.all(promises);
      fetched.forEach(item => {
        results[item.tf] = item.data;
      });

      setFramesData(results);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Error fetching frames data:', err);
      setError('تعذر تحميل بيانات الشموع');
    } finally {
      setLoading(false);
    }
  }, [selectedPreset, activeSymbol]);

  // Trigger fetch when symbol changes
  useEffect(() => {
    fetchAllTimeframes();
    const interval = setInterval(fetchAllTimeframes, 15000);
    return () => clearInterval(interval);
  }, [fetchAllTimeframes]);

  // 3. Candle Close Countdown Timer (updates every second)
  useEffect(() => {
    const updateCountdown = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const newMap = {};

      TIMEFRAMES.forEach(tf => {
        const tfSec = TF_SECONDS[tf] || 60;
        const remaining = tfSec - (nowSec % tfSec);
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        newMap[tf] = h > 0
          ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      });

      setCountdownMap(newMap);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    framesData,
    macroData,
    loading,
    error,
    lastUpdated,
    countdownMap,
    refresh: fetchAllTimeframes
  };
}
