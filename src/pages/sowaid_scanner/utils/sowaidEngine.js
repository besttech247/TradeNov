// SOWAID v4.0 Multi-Timeframe Strategy Mathematical Engine
import { TF_SPECS, PRIORITY_ORDER } from './sowaidConstants';

/**
 * تنظيف رمز العملة ليكون متوافقاً 100% مع Binance API
 * مثل: BINANCE_BTCUSDT_FUTURES -> BTCUSDT
 */
export function cleanCoinSymbol(symbol) {
  if (!symbol) return 'BTCUSDT';
  return symbol
    .replace(/^(BINANCE_|BYBIT_|DEX_)/i, '')
    .replace(/(_SPOT|_FUTURES)$/i, '')
    .toUpperCase();
}

/**
 * دمج شموع الدقيقة الواحدة إلى فريم زمني مخصص (مثال: 3m, 9m, 27m, 81m)
 */
export function resampleCandles(candles1m, targetMinutes) {
  if (!candles1m || candles1m.length === 0) return [];
  if (targetMinutes === 1) return candles1m;

  const resampled = [];
  const bucketMs = targetMinutes * 60 * 1000;
  let currentBucket = null;
  let bOpen = null, bHigh = null, bLow = null, bClose = null, bVol = 0.0;
  let bStartTs = null;

  for (const c of candles1m) {
    const ts = c.timestamp || c.time;
    const bucketId = Math.floor(ts / bucketMs);

    if (currentBucket === null) {
      currentBucket = bucketId;
      bStartTs = bucketId * bucketMs;
      bOpen = c.open;
      bHigh = c.high;
      bLow = c.low;
      bClose = c.close;
      bVol = c.volume;
    } else if (bucketId === currentBucket) {
      if (c.high > bHigh) bHigh = c.high;
      if (c.low < bLow) bLow = c.low;
      bClose = c.close;
      bVol += c.volume;
    } else {
      resampled.push({
        timestamp: bStartTs,
        time: bStartTs,
        open: bOpen,
        high: bHigh,
        low: bLow,
        close: bClose,
        volume: bVol,
        isGreen: bClose >= bOpen
      });
      currentBucket = bucketId;
      bStartTs = bucketId * bucketMs;
      bOpen = c.open;
      bHigh = c.high;
      bLow = c.low;
      bClose = c.close;
      bVol = c.volume;
    }
  }

  if (currentBucket !== null) {
    resampled.push({
      timestamp: bStartTs,
      time: bStartTs,
      open: bOpen,
      high: bHigh,
      low: bLow,
      close: bClose,
      volume: bVol,
      isGreen: bClose >= bOpen
    });
  }

  return resampled;
}

/**
 * حساب مذبذب موجات إليوت (Elliott Wave Oscillator)
 * Median = (High + Low) / 2
 * EWO = SMA(Median, 5) - SMA(Median, 35)
 */
export function computeEWOArray(candles) {
  if (!candles || candles.length < 10) return [];
  const medians = candles.map(c => (c.high + c.low) / 2.0);
  const result = [];

  // إذا كان عدد الشموع أقل من 35، نستخدم نافذة متكيفة أصغر لضمان عدم توقف الإشارات
  const longPeriod = candles.length >= 35 ? 35 : Math.max(Math.floor(candles.length * 0.7), 6);
  const shortPeriod = Math.min(5, Math.floor(longPeriod / 3));

  for (let i = 0; i < candles.length; i++) {
    if (i >= longPeriod - 1) {
      let sumShort = 0;
      for (let j = i - shortPeriod + 1; j <= i; j++) sumShort += medians[j];
      const smaShort = sumShort / shortPeriod;

      let sumLong = 0;
      for (let j = i - longPeriod + 1; j <= i; j++) sumLong += medians[j];
      const smaLong = sumLong / longPeriod;

      const ewo = smaShort - smaLong;
      result.push({
        timestamp: candles[i].timestamp || candles[i].time,
        time: candles[i].timestamp || candles[i].time,
        ewo: ewo,
        candle: candles[i]
      });
    }
  }
  return result;
}

/**
 * فحص حالة إشارة الارتداد والفلتر وفق منطق كود SOWAID v4.0
 */
export function evaluateEWOState(ewoList) {
  if (!ewoList || ewoList.length < 3) {
    return { e1: null, e2: null, e3: null, isRebound: false, isRising: false };
  }

  const n = ewoList.length;
  const e1 = ewoList[n - 1].ewo; // الشمعة الأحدث
  const e2 = ewoList[n - 2].ewo; // الشمعة السابقة
  const e3 = ewoList[n - 3].ewo; // شمعة قبلها

  // شرط الارتداد: EWO سالب وفي بداية تقوسه وصعوده لأعلى
  const isRebound = (e1 < 0) && (e1 > e2) && (e2 <= e3);

  // شرط الفلتر الصاعد: EWO1 > EWO2
  const isRising = e1 > e2;

  return {
    e1,
    e2,
    e3,
    isRebound,
    isRising,
    latestCandle: ewoList[n - 1].candle
  };
}

/**
 * حساب مستويات الدخول ووقف الخسارة والـ Trailing Stop وفق مواصفات الاستراتيجية
 */
export function calculateSowaidTradeLevels(currentPrice, tfKey) {
  const spec = TF_SPECS[tfKey] || TF_SPECS["81m"];
  const slPct = spec.sl;
  const trailPct = spec.trail;

  const stopLossPrice = currentPrice * (1.0 - slPct);
  const trailingTriggerPrice = currentPrice * (1.0 + trailPct * 1.5);
  const recommendedSizeUsd = spec.size_usd;
  const maxTrades = spec.max;

  return {
    entryPrice: currentPrice,
    stopLossPrice,
    stopLossPercent: (slPct * 100).toFixed(2),
    trailingPercent: (trailPct * 100).toFixed(2),
    trailingTriggerPrice,
    recommendedSizeUsd,
    maxTrades,
    filterName: spec.filter,
    label: spec.label,
    badgeColor: spec.badgeColor
  };
}

/**
 * جلب وتحليل الفريمات السبعة (1D, 4h, 81m, 27m, 9m, 3m, 1m) لحظياً لعملة محددة
 */
export async function analyzeCoinMultiTf(rawSymbol) {
  try {
    const symbol = cleanCoinSymbol(rawSymbol);
    const baseUrl = 'https://api.binance.com/api/v3';

    // نجلب شموع 1d, 4h, و 1m من Binance Spot (المتوفرة بدون قيود CORS)
    const [res1d, res4h, res1m] = await Promise.all([
      fetch(`${baseUrl}/klines?symbol=${symbol}&interval=1d&limit=45`).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/klines?symbol=${symbol}&interval=4h&limit=60`).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/klines?symbol=${symbol}&interval=1m&limit=500`).then(r => r.ok ? r.json() : [])
    ]);

    const parseKlines = (raw) => {
      if (!Array.isArray(raw)) return [];
      return raw.map(r => ({
        timestamp: r[0],
        time: r[0],
        open: parseFloat(r[1]),
        high: parseFloat(r[2]),
        low: parseFloat(r[3]),
        close: parseFloat(r[4]),
        volume: parseFloat(r[5]),
        isGreen: parseFloat(r[4]) >= parseFloat(r[1])
      }));
    };

    const candles1d = parseKlines(res1d);
    const candles4h = parseKlines(res4h);
    const candles1m = parseKlines(res1m);

    if (candles1m.length < 20) return null;

    // Resampling للفريمات
    const candles3m = resampleCandles(candles1m, 3);
    const candles9m = resampleCandles(candles1m, 9);
    const candles27m = resampleCandles(candles1m, 27);
    const candles81m = resampleCandles(candles1m, 81);

    // حساب EWO لكل فريم
    const ewo1d = computeEWOArray(candles1d);
    const ewo4h = computeEWOArray(candles4h);
    const ewo81m = computeEWOArray(candles81m);
    const ewo27m = computeEWOArray(candles27m);
    const ewo9m = computeEWOArray(candles9m);
    const ewo3m = computeEWOArray(candles3m);
    const ewo1m = computeEWOArray(candles1m);

    // تقييم كل فريم
    const state1d = evaluateEWOState(ewo1d);
    const state4h = evaluateEWOState(ewo4h);
    const state81m = evaluateEWOState(ewo81m);
    const state27m = evaluateEWOState(ewo27m);
    const state9m = evaluateEWOState(ewo9m);
    const state3m = evaluateEWOState(ewo3m);
    const state1m = evaluateEWOState(ewo1m);

    // فلاتر الترند
    const filter1dOk = state1d.isRising;
    const filter81mOk = state81m.isRising;
    const filter27mOk = state27m.isRising;
    const filter9mOk = state9m.isRising;

    // توافق شروط الشراء مع الفلاتر
    const tfStatus = {
      "1d": {
        ...state1d,
        filterOk: true,
        signalValid: state1d.isRebound
      },
      "4h": {
        ...state4h,
        filterOk: true,
        signalValid: state4h.isRebound
      },
      "81m": {
        ...state81m,
        filterOk: filter1dOk,
        signalValid: state81m.isRebound && filter1dOk
      },
      "27m": {
        ...state27m,
        filterOk: filter1dOk,
        signalValid: state27m.isRebound && filter1dOk
      },
      "9m": {
        ...state9m,
        filterOk: filter81mOk,
        signalValid: state9m.isRebound && filter81mOk
      },
      "3m": {
        ...state3m,
        filterOk: filter27mOk,
        signalValid: state3m.isRebound && filter27mOk
      },
      "1m": {
        ...state1m,
        filterOk: filter9mOk,
        signalValid: state1m.isRebound && filter9mOk
      }
    };

    // حساب عدد الفريمات النشطة (Confluence Score)
    let activeSignalsCount = 0;
    for (const key of PRIORITY_ORDER) {
      if (tfStatus[key]?.signalValid) activeSignalsCount++;
    }

    const currentPrice = candles1m[candles1m.length - 1].close;

    const tfCharts = {
      "1d": { candles: candles1d, ewo: ewo1d },
      "4h": { candles: candles4h, ewo: ewo4h },
      "81m": { candles: candles81m, ewo: ewo81m },
      "27m": { candles: candles27m, ewo: ewo27m },
      "9m": { candles: candles9m, ewo: ewo9m },
      "3m": { candles: candles3m, ewo: ewo3m },
      "1m": { candles: candles1m, ewo: ewo1m }
    };

    return {
      symbol: cleanCoinSymbol(rawSymbol),
      rawSymbol,
      currentPrice,
      activeSignalsCount,
      tfStatus,
      tfCharts,
      filter1dOk,
      filter81mOk,
      updatedAt: Date.now()
    };
  } catch (err) {
    console.error(`Error analyzing ${rawSymbol}:`, err);
    return null;
  }
}
