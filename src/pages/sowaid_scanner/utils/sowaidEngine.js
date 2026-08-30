// SOWAID v4.0 Multi-Timeframe Strategy Mathematical Engine
import { TF_SPECS, PRIORITY_ORDER } from './sowaidConstants';

/**
 * تنظيف رمز العملة ليكون متوافقاً مع Binance API
 */
export function cleanCoinSymbol(symbol) {
  if (!symbol) return 'BTCUSDT';
  return symbol
    .replace(/^(BINANCE_|BYBIT_|DEX_)/i, '')
    .replace(/(_SPOT|_FUTURES)$/i, '')
    .toUpperCase();
}

/**
 * دمج شموع الدقيقة الواحدة إلى فريم زمني مخصص (3m, 9m, 27m, 81m)
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
  if (!candles || candles.length < 6) return [];
  const medians = candles.map(c => (c.high + c.low) / 2.0);
  const result = [];

  const longPeriod = candles.length >= 35 ? 35 : Math.max(Math.floor(candles.length * 0.7), 5);
  const shortPeriod = Math.min(5, Math.max(Math.floor(longPeriod / 4), 2));

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
 * تقييم إشارة الارتداد والزخم لمذبذب EWO
 * - المنطقة الإيجابية (Bullish Regime): EWO > 0 (الزخم إيجابي لصالح المشترين)
 * - ارتداد صاعد من القاع (Bottom Rebound): EWO < 0 صاعد ومتقوس لأعلى
 */
export function evaluateEWOState(ewoList) {
  if (!ewoList || ewoList.length < 2) {
    return { e1: null, e2: null, e3: null, isRebound: false, isRising: false, isSignalValid: false, statusText: 'محايد' };
  }

  const n = ewoList.length;
  const e1 = ewoList[n - 1].ewo; // الشمعة الحالية
  const e2 = ewoList[n - 2].ewo; // الشمعة السابقة
  const e3 = n >= 3 ? ewoList[n - 3].ewo : e2;

  // 1. اتجاه إيجابي صاعد (Bullish Regime): عزم الشراء متفوق بالكامل
  const isPositiveBullish = e1 > 0;

  // 2. ارتداد من القاع (Bottom Rebound): EWO سالب ولكن صاعد ويتقوس لأعلى
  const isBottomRebound = (e1 < 0) && (e1 > e2);

  // 3. شمعة انعكاس دقيقة
  const isExactTurn = (e1 < 0) && (e1 > e2) && (e2 <= e3);

  // الإشارة نشطة وولعانة إذا كان EWO إيجابياً أو في مرحلة ارتداد صاعد
  const isSignalValid = isPositiveBullish || isBottomRebound;
  const isRising = e1 > e2;

  let statusText = '⏸ تصحيح هابط';
  if (isPositiveBullish && isRising) statusText = '🔥 صعود وزخم قوي';
  else if (isPositiveBullish) statusText = '🟢 عزم إيجابي EWO > 0';
  else if (isBottomRebound) statusText = '⚡ ارتداد من القاع';

  return {
    e1,
    e2,
    e3,
    isPositiveBullish,
    isBottomRebound,
    isExactTurn,
    isRising,
    isSignalValid,
    statusText,
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
 * محاكاة وتقدير فوري لحالة الفريمات لجميع العملات لحظياً
 * مثل HYPEUSDT وغيرها، حيث تقيس قوة الزخم وموقع السعر في القمة والسيولة
 */
export function estimateCoinMultiTf(coin, btcChange = 0) {
  const price = parseFloat(coin.price) || 1;
  const high = parseFloat(coin.highPrice) || price * 1.01;
  const low = parseFloat(coin.lowPrice) || price * 0.99;
  const change = parseFloat(coin.priceChangePercent) || 0;
  const vol = parseFloat(coin.quoteVolume) || 0;
  const clean = cleanCoinSymbol(coin.symbol);

  // موقع السعر داخل نطاق اليوم (0 = القاع، 1 = القمة)
  const range = high - low || 1;
  const posInRange = Math.max(0, Math.min(1, (price - low) / range));
  const isHighVolume = vol > 10000000;
  const isUltraVolume = vol > 50000000;
  const isAlphaBtc = change > btcChange;

  const tfStatus = {};
  let activeCount = 0;

  // 1D: صاعد إذا كان التغير إيجابي أو في النصف الأعلى من المدى
  const d1Valid = change > 0.5 || posInRange > 0.45;
  tfStatus["1d"] = { signalValid: d1Valid, statusText: d1Valid ? '🔥 صاعد يومي' : '⏸ محايد', filterOk: true };
  if (d1Valid) activeCount++;

  // 4H: صاعد إذا كان السعر متماسك وفوق متوسط اليوم
  const h4Valid = change > 0 || posInRange > 0.40;
  tfStatus["4h"] = { signalValid: h4Valid, statusText: h4Valid ? '🟢 إيجابي 4H' : '⏸ محايد', filterOk: true };
  if (h4Valid) activeCount++;

  // 81m: ارتداد أو زخم مدعوم بالسيولة
  const m81Valid = (posInRange > 0.35 && isAlphaBtc) || isHighVolume || change > 1.5;
  tfStatus["81m"] = { signalValid: m81Valid, statusText: m81Valid ? '⚡ ارتداد 81m' : '⏸ محايد', filterOk: d1Valid };
  if (m81Valid) activeCount++;

  // 27m: زخم تداول نشط
  const m27Valid = posInRange > 0.30 || change > 1.0 || isHighVolume;
  tfStatus["27m"] = { signalValid: m27Valid, statusText: m27Valid ? '⚡ ارتداد 27m' : '⏸ محايد', filterOk: d1Valid };
  if (m27Valid) activeCount++;

  // 9m: انطلاق أو ارتداد لحظي
  const m9Valid = posInRange > 0.35 || change > 0.2 || isUltraVolume;
  tfStatus["9m"] = { signalValid: m9Valid, statusText: m9Valid ? '⚡ ارتداد 9m' : '⏸ محايد', filterOk: m81Valid };
  if (m9Valid) activeCount++;

  // 3m: مضاربة سريعة
  const m3Valid = change > -3.0 || posInRange > 0.30;
  tfStatus["3m"] = { signalValid: m3Valid, statusText: m3Valid ? '🚀 زخم 3m' : '⏸ محايد', filterOk: true };
  if (m3Valid) activeCount++;

  // 1m: مضاربة لحظية
  const m1Valid = change > -5.0 && posInRange > 0.25;
  tfStatus["1m"] = { signalValid: m1Valid, statusText: m1Valid ? '🚀 زخم 1m' : '⏸ محايد', filterOk: true };
  if (m1Valid) activeCount++;

  return {
    symbol: clean,
    rawSymbol: coin.symbol,
    currentPrice: price,
    activeSignalsCount: activeCount,
    tfStatus,
    filter1dOk: d1Valid,
    filter81mOk: m81Valid,
    isEstimated: true,
    updatedAt: Date.now()
  };
}

/**
 * جلب وتحليل الشموع الحقيقية من بينانس مع استخراج EWO الصاعد والإيجابي
 */
export async function analyzeCoinMultiTf(rawSymbol) {
  try {
    const symbol = cleanCoinSymbol(rawSymbol);
    const baseUrl = 'https://api.binance.com/api/v3';

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

    if (candles1m.length < 15) return null;

    // Resampling للفريمات
    const candles3m = resampleCandles(candles1m, 3);
    const candles9m = resampleCandles(candles1m, 9);
    const candles27m = resampleCandles(candles1m, 27);
    const candles81m = resampleCandles(candles1m, 81);

    // EWO
    const ewo1d = computeEWOArray(candles1d);
    const ewo4h = computeEWOArray(candles4h);
    const ewo81m = computeEWOArray(candles81m);
    const ewo27m = computeEWOArray(candles27m);
    const ewo9m = computeEWOArray(candles9m);
    const ewo3m = computeEWOArray(candles3m);
    const ewo1m = computeEWOArray(candles1m);

    const state1d = evaluateEWOState(ewo1d);
    const state4h = evaluateEWOState(ewo4h);
    const state81m = evaluateEWOState(ewo81m);
    const state27m = evaluateEWOState(ewo27m);
    const state9m = evaluateEWOState(ewo9m);
    const state3m = evaluateEWOState(ewo3m);
    const state1m = evaluateEWOState(ewo1m);

    const tfStatus = {
      "1d": { ...state1d, filterOk: true },
      "4h": { ...state4h, filterOk: true },
      "81m": { ...state81m, filterOk: state1d.isSignalValid },
      "27m": { ...state27m, filterOk: state1d.isSignalValid },
      "9m": { ...state9m, filterOk: state81m.isSignalValid },
      "3m": { ...state3m, filterOk: true },
      "1m": { ...state1m, filterOk: true }
    };

    let activeSignalsCount = 0;
    for (const key of PRIORITY_ORDER) {
      if (tfStatus[key]?.isSignalValid) activeSignalsCount++;
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
      filter1dOk: state1d.isSignalValid,
      filter81mOk: state81m.isSignalValid,
      isEstimated: false,
      updatedAt: Date.now()
    };
  } catch (err) {
    console.error(`Error analyzing ${rawSymbol}:`, err);
    return null;
  }
}
