// SOWAID v4.0 Multi-Timeframe Strategy Mathematical Engine
import { TF_SPECS, PRIORITY_ORDER } from './sowaidConstants';

/**
 * تنظيف رمز العملة ليكون متوافقاً مع المنصات
 */
export function cleanCoinSymbol(symbol) {
  if (!symbol) return 'BTCUSDT';
  return symbol
    .replace(/^(BINANCE_|BYBIT_|DEX_)/i, '')
    .replace(/(_SPOT|_FUTURES)$/i, '')
    .toUpperCase();
}

// كاش خفيف للشموع لتسريع الفحص وتفادي إعادة تنزيل الشموع نفسها
const klinesCache = new Map();
const CACHE_TTL_MS = 25000; // 25 ثانية

/**
 * جلب الشموع بشكل موحد وسريع مع دعم المنصات (بينانس ثم بايبيت تلقائياً)
 * مزود بـ timeout سريع حتى لا يعلق الفحص في حال حجب أو بطء منصة
 */
export async function fetchKlinesUniversal(symbol, binanceInterval, bybitInterval, limit = 60) {
  const cleanSym = cleanCoinSymbol(symbol);
  const cacheKey = `${cleanSym}_${binanceInterval}_${limit}`;
  const cached = klinesCache.get(cacheKey);
  if (cached && (Date.now() - cached.time < CACHE_TTL_MS)) {
    return cached.data;
  }

  const fetchWithTimeout = async (url, timeoutMs = 3000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  const binancePromise = fetchWithTimeout(`https://api.binance.com/api/v3/klines?symbol=${cleanSym}&interval=${binanceInterval}&limit=${limit}`, 3000)
    .then(data => {
      if (Array.isArray(data) && data.length > 0 && !data.code) {
        return data.map(r => ({
          timestamp: r[0],
          time: r[0],
          open: parseFloat(r[1]),
          high: parseFloat(r[2]),
          low: parseFloat(r[3]),
          close: parseFloat(r[4]),
          volume: parseFloat(r[5]),
          isGreen: parseFloat(r[4]) >= parseFloat(r[1])
        }));
      }
      throw new Error('Invalid Binance data');
    });

  const bybitPromise = fetchWithTimeout(`https://api.bybit.com/v5/market/kline?category=linear&symbol=${cleanSym}&interval=${bybitInterval}&limit=${limit}`, 3000)
    .then(data => {
      if (data?.result?.list && Array.isArray(data.result.list) && data.result.list.length > 0) {
        const raw = [...data.result.list].reverse();
        return raw.map(r => ({
          timestamp: parseInt(r[0]),
          time: parseInt(r[0]),
          open: parseFloat(r[1]),
          high: parseFloat(r[2]),
          low: parseFloat(r[3]),
          close: parseFloat(r[4]),
          volume: parseFloat(r[5]),
          isGreen: parseFloat(r[4]) >= parseFloat(r[1])
        }));
      }
      throw new Error('Invalid Bybit data');
    });

  try {
    // يتسابق كلا المنصتين وأيهما يستجيب أولاً يتم اختياره، مما ينهي مشكلة التأخير للأبد
    const formatted = await Promise.any([binancePromise, bybitPromise]);
    klinesCache.set(cacheKey, { time: Date.now(), data: formatted });
    return formatted;
  } catch (e) {
    return [];
  }
}

/**
 * دمج الشموع إلى فريم زمني مخصص (مثال: دمج شموع 3 دقائق إلى 9m أو 27m أو 81m)
 * مطابقة 100% لكود resample_candles في back.py
 */
export function resampleCandles(candlesBase, targetMinutes, baseMinutes = 1) {
  if (!candlesBase || candlesBase.length === 0) return [];
  if (targetMinutes === baseMinutes) return candlesBase;

  const resampled = [];
  const bucketMs = targetMinutes * 60 * 1000;
  let currentBucket = null;
  let bOpen = null, bHigh = null, bLow = null, bClose = null, bVol = 0.0;
  let bStartTs = null;

  for (const c of candlesBase) {
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
 * مطابقة 100% لكود compute_ewo_dict في back.py:
 * Median = (High + Low) / 2.0
 * SMA5 = SMA(Median, 5)
 * SMA35 = SMA(Median, 35)
 * EWO = SMA5 - SMA35
 */
export function computeEWOArray(candles) {
  if (!candles || candles.length < 35) return [];
  const medians = candles.map(c => (c.high + c.low) / 2.0);
  const result = [];

  for (let i = 0; i < candles.length; i++) {
    if (i >= 34) {
      let sum5 = 0;
      for (let j = i - 4; j <= i; j++) sum5 += medians[j];
      const sma5 = sum5 / 5.0;

      let sum35 = 0;
      for (let j = i - 34; j <= i; j++) sum35 += medians[j];
      const sma35 = sum35 / 35.0;

      const ewo = sma5 - sma35;
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
 * فحص حصري لإشارات الصعود والاستعداد للصعود تحت الصفر
 * e1: الشمعة الحالية المغلقة
 * e2: الشمعة السابقة
 * e3: الشمعة الأقدم
 */
export function checkReboundSignals(e1, e2, e3) {
  if (e1 === null || e2 === null || e3 === null || e1 === undefined || e2 === undefined || e3 === undefined) {
    return null;
  }

  // الفحص يعمل فقط تحت خط الصفر
  if (e1 < 0) {
    // 1. 🟢 إشارة الصعود المؤكدة (تنفيذ الشراء)
    if (e1 > e2 && e2 <= e3) {
      return "GREEN";
    }

    // 2. 🟡 إشارة الاستعداد للصعود (تباطؤ الهبوط تمهيداً للقاع)
    const diff_curr = Math.abs(e1 - e2);
    const diff_prev = Math.abs(e2 - e3);
    if (e1 <= e2 && diff_curr < diff_prev) {
      return "YELLOW";
    }
  }

  return null; // لا توجد إشارة صعود أو استعداد
}

/**
 * تقييم حالة إشارة الارتداد EWO بدقة
 */
export function evaluateEWOState(ewoList) {
  if (!ewoList || ewoList.length < 3) {
    return {
      e1: null,
      e2: null,
      e3: null,
      diffCurr: null,
      diffPrev: null,
      signalType: null,
      isGreenSignal: false,
      isYellowSignal: false,
      isExactRebound: false,
      isRebound: false,
      isRising: false,
      isPositive: false,
      signalValid: false,
      isSignalValid: false,
      statusText: 'غير كافٍ'
    };
  }

  const n = ewoList.length;
  const e1 = ewoList[n - 1].ewo; // الشمعة الحالية
  const e2 = ewoList[n - 2].ewo; // الشمعة السابقة
  const e3 = ewoList[n - 3].ewo; // شمعة قبلها

  const diffCurr = Math.abs(e1 - e2);
  const diffPrev = Math.abs(e2 - e3);

  const signalType = checkReboundSignals(e1, e2, e3);
  const isGreenSignal = signalType === "GREEN";
  const isYellowSignal = signalType === "YELLOW";

  const isRising = e1 > e2;
  const isPositive = e1 > 0;

  let statusText = '⏸ لا توجد إشارة (مطفأ)';
  if (isGreenSignal) {
    statusText = '🟢 إشارة صعود مؤكدة (تنفيذ الشراء)';
  } else if (isYellowSignal) {
    statusText = '🟡 إشارة استعداد (تباطؤ الهبوط)';
  } else if (isPositive && isRising) {
    statusText = '🔥 صعود إيجابي فوق الصفر';
  } else if (isPositive) {
    statusText = ' عزم إيجابي فوق الصفر';
  }

  return {
    e1,
    e2,
    e3,
    diffCurr,
    diffPrev,
    signalType,
    isGreenSignal,
    isYellowSignal,
    isExactRebound: isGreenSignal,
    isRebound: isGreenSignal,
    isRising,
    isPositive,
    signalValid: isGreenSignal,
    isSignalValid: isGreenSignal,
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
 * جلب وتحليل الشموع الحقيقية 100% وحساب إشارات EWO الرياضية المطابقة لـ back.py
 */
export async function analyzeCoinMultiTf(rawSymbol) {
  try {
    const symbol = cleanCoinSymbol(rawSymbol);

    // نجلب الشموع الأساسية:
    // 1D (بينانس: 1d / بايبيت: D)
    // 4H (بينانس: 4h / بايبيت: 240)
    // 3m (بينانس: 3m / بايبيت: 3) لدمج 3m, 9m, 27m, 81m بـ 1000 شمعة
    // 1m (بينانس: 1m / بايبيت: 1)
    const [candles1d, candles4h, candles3m, candles1m] = await Promise.all([
      fetchKlinesUniversal(symbol, '1d', 'D', 60),
      fetchKlinesUniversal(symbol, '4h', '240', 60),
      fetchKlinesUniversal(symbol, '3m', '3', 1000),
      fetchKlinesUniversal(symbol, '1m', '1', 200)
    ]);

    if (candles3m.length < 35 && candles1d.length === 0) {
      return null;
    }

    // دمج الشموع بدقة من شموع الـ 3 دقائق لضمان وجود أكثر من 35 شمعة لكل فريم
    const candles9m = resampleCandles(candles3m, 9, 3);
    const candles27m = resampleCandles(candles3m, 27, 3);
    const candles81m = resampleCandles(candles3m, 81, 3);

    // حساب EWO الدقيق لكل فريم
    const ewo1d = computeEWOArray(candles1d);
    const ewo4h = computeEWOArray(candles4h);
    const ewo81m = computeEWOArray(candles81m);
    const ewo27m = computeEWOArray(candles27m);
    const ewo9m = computeEWOArray(candles9m);
    const ewo3m = computeEWOArray(candles3m);
    const ewo1m = computeEWOArray(candles1m);

    // تقييم حالة EWO لكل فريم
    const state1d = evaluateEWOState(ewo1d);
    const state4h = evaluateEWOState(ewo4h);
    const state81m = evaluateEWOState(ewo81m);
    const state27m = evaluateEWOState(ewo27m);
    const state9m = evaluateEWOState(ewo9m);
    const state3m = evaluateEWOState(ewo3m);
    const state1m = evaluateEWOState(ewo1m);

    // فلاتر الاتجاه المطابقة لكود back.py
    // f_1d_ok = e1_1d > e2_1d
    // f_81m_ok = e1_81m > e2_81m
    const filter1dOk = state1d.e1 !== null && state1d.e2 !== null ? state1d.e1 > state1d.e2 : true;
    const filter81mOk = state81m.e1 !== null && state81m.e2 !== null ? state81m.e1 > state81m.e2 : true;
    const filter27mOk = state27m.e1 !== null && state27m.e2 !== null ? state27m.e1 > state27m.e2 : true;
    const filter9mOk = state9m.e1 !== null && state9m.e2 !== null ? state9m.e1 > state9m.e2 : true;

    // توافق الشروط مع الفلاتر وفق back.py:
    // الشارات المرئية (greenSignal / yellowSignal) تظهر نقية ومستقلة تماماً لكل فريم دون أي فلتر
    // صلاحية الدخول في الصفقة (signalValid) هي وحدها التي تشترط تحقق فلتر الفريم الأكبر
    const tfStatus = {
      "1d": {
        ...state1d,
        filterOk: true,
        rawSignal: state1d.isGreenSignal,
        greenSignal: state1d.isGreenSignal,
        signalValid: state1d.isGreenSignal,
        yellowSignal: state1d.isYellowSignal
      },
      "4h": {
        ...state4h,
        filterOk: true,
        rawSignal: state4h.isGreenSignal,
        greenSignal: state4h.isGreenSignal,
        signalValid: state4h.isGreenSignal,
        yellowSignal: state4h.isYellowSignal
      },
      "81m": {
        ...state81m,
        filterOk: filter1dOk,
        rawSignal: state81m.isGreenSignal,
        greenSignal: state81m.isGreenSignal,
        signalValid: state81m.isGreenSignal && filter1dOk,
        yellowSignal: state81m.isYellowSignal
      },
      "27m": {
        ...state27m,
        filterOk: filter1dOk,
        rawSignal: state27m.isGreenSignal,
        greenSignal: state27m.isGreenSignal,
        signalValid: state27m.isGreenSignal && filter1dOk,
        yellowSignal: state27m.isYellowSignal
      },
      "9m": {
        ...state9m,
        filterOk: filter81mOk,
        rawSignal: state9m.isGreenSignal,
        greenSignal: state9m.isGreenSignal,
        signalValid: state9m.isGreenSignal && filter81mOk,
        yellowSignal: state9m.isYellowSignal
      },
      "3m": {
        ...state3m,
        filterOk: filter27mOk,
        rawSignal: state3m.isGreenSignal,
        greenSignal: state3m.isGreenSignal,
        signalValid: state3m.isGreenSignal && filter27mOk,
        yellowSignal: state3m.isYellowSignal
      },
      "1m": {
        ...state1m,
        filterOk: filter9mOk,
        rawSignal: state1m.isGreenSignal,
        greenSignal: state1m.isGreenSignal,
        signalValid: state1m.isGreenSignal && filter9mOk,
        yellowSignal: state1m.isYellowSignal
      }
    };

    let activeSignalsCount = 0;
    let yellowSignalsCount = 0;
    for (const key of PRIORITY_ORDER) {
      if (tfStatus[key]?.greenSignal) activeSignalsCount++;
      if (tfStatus[key]?.yellowSignal) yellowSignalsCount++;
    }

    const currentPrice = candles1m.length > 0
      ? candles1m[candles1m.length - 1].close
      : (candles3m.length > 0 ? candles3m[candles3m.length - 1].close : 0);

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
      yellowSignalsCount,
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
