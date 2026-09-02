// Technical Indicators & Quantitative Analysis Engine for TradeNov INFO

/**
 * Calculates technical indicators on an array of candles:
 * candles: [{ timestamp, open, high, low, close, volume }, ...]
 */
export function calculateInfoIndicators(candles) {
  if (!candles || candles.length === 0) return [];

  const n = candles.length;
  const result = candles.map(c => ({ ...c }));

  // 1. Median price
  for (let i = 0; i < n; i++) {
    result[i].median = (result[i].high + result[i].low) / 2;
  }

  // 2. EWO (Elliott Wave Oscillator) = SMA(5) of Median - SMA(35) of Median
  for (let i = 0; i < n; i++) {
    let sum5 = 0;
    let count5 = 0;
    for (let j = Math.max(0, i - 4); j <= i; j++) {
      sum5 += result[j].median;
      count5++;
    }
    const sma5 = count5 > 0 ? sum5 / count5 : result[i].median;

    let sum35 = 0;
    let count35 = 0;
    for (let j = Math.max(0, i - 34); j <= i; j++) {
      sum35 += result[j].median;
      count35++;
    }
    const sma35 = count35 > 0 ? sum35 / count35 : result[i].median;

    result[i].ewo = i >= 4 ? sma5 - sma35 : 0;
  }

  // 3. RSI (14)
  let avgGain = 0;
  let avgLoss = 0;
  const period = 14;

  for (let i = 0; i < n; i++) {
    if (i === 0) {
      result[i].rsi = 50;
      continue;
    }
    const change = result[i].close - result[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i === period) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[i].rsi = 100 - (100 / (1 + rs));
      } else {
        result[i].rsi = 50;
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result[i].rsi = 100 - (100 / (1 + rs));
    }
  }

  // 4. MACD (12, 26, 9)
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  const k9 = 2 / (9 + 1);

  let ema12 = result[0].close;
  let ema26 = result[0].close;
  let signal = 0;

  for (let i = 0; i < n; i++) {
    const c = result[i].close;
    ema12 = i === 0 ? c : c * k12 + ema12 * (1 - k12);
    ema26 = i === 0 ? c : c * k26 + ema26 * (1 - k26);
    const macd = ema12 - ema26;
    result[i].macd = macd;

    signal = i === 0 ? macd : macd * k9 + signal * (1 - k9);
    result[i].macd_signal = signal;
    result[i].macd_hist = macd - signal;
  }

  // 5. True Range & ATR(10) & Supertrend (10, 3)
  const tr = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      tr[i] = result[i].high - result[i].low;
    } else {
      const hl = result[i].high - result[i].low;
      const hc = Math.abs(result[i].high - result[i - 1].close);
      const lc = Math.abs(result[i].low - result[i - 1].close);
      tr[i] = Math.max(hl, hc, lc);
    }
  }

  const atr10 = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let cnt = 0;
    for (let j = Math.max(0, i - 9); j <= i; j++) {
      sum += tr[j];
      cnt++;
    }
    atr10[i] = cnt > 0 ? sum / cnt : tr[i];
  }

  let stDir = true;
  let stVal = 0;
  for (let i = 0; i < n; i++) {
    const hl2 = (result[i].high + result[i].low) / 2;
    const upBand = hl2 + 3 * atr10[i];
    const lowBand = hl2 - 3 * atr10[i];

    if (i === 0) {
      stDir = true;
      stVal = lowBand;
    } else {
      const prevUp = result[i - 1].st_up || upBand;
      const prevLow = result[i - 1].st_low || lowBand;

      if (result[i].close > prevUp) {
        stDir = true;
      } else if (result[i].close < prevLow) {
        stDir = false;
      } else {
        stDir = result[i - 1].supertrend_dir;
      }
      stVal = stDir ? lowBand : upBand;
    }

    result[i].st_up = hl2 + 3 * atr10[i];
    result[i].st_low = hl2 - 3 * atr10[i];
    result[i].supertrend = stVal;
    result[i].supertrend_dir = stDir;
  }

  // 6. Bollinger Bands (20, 2) & Keltner Channels (20, 1.5) -> TTM Squeeze
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 19); j <= i; j++) {
      sum += result[j].close;
      count++;
    }
    const bbMid = count > 0 ? sum / count : result[i].close;

    let varSum = 0;
    for (let j = Math.max(0, i - 19); j <= i; j++) {
      varSum += Math.pow(result[j].close - bbMid, 2);
    }
    const bbStd = count > 1 ? Math.sqrt(varSum / count) : 0;
    const bbUpper = bbMid + 2 * bbStd;
    const bbLower = bbMid - 2 * bbStd;

    // Keltner Channel with ATR(20)
    let trSum = 0;
    for (let j = Math.max(0, i - 19); j <= i; j++) {
      trSum += tr[j];
    }
    const kcTr = count > 0 ? trSum / count : tr[i];
    const kcUpper = bbMid + 1.5 * kcTr;
    const kcLower = bbMid - 1.5 * kcTr;

    const squeezeOn = bbLower > kcLower && bbUpper < kcUpper;

    result[i].bb_mid = bbMid;
    result[i].bb_upper = bbUpper;
    result[i].bb_lower = bbLower;
    result[i].kc_upper = kcUpper;
    result[i].kc_lower = kcLower;
    result[i].squeeze_on = squeezeOn;
  }

  return result;
}

/**
 * Calculates Time Price Opportunity (TPO) / Volume Profile
 * POC, VAH (Value Area High), VAL (Value Area Low 70%)
 */
export function calculateTpoLevels(candles, bins = 25) {
  if (!candles || candles.length < 10) return null;

  let priceMin = Infinity;
  let priceMax = -Infinity;

  for (const c of candles) {
    if (c.low < priceMin) priceMin = c.low;
    if (c.high > priceMax) priceMax = c.high;
  }

  if (priceMin === priceMax || !isFinite(priceMin) || !isFinite(priceMax)) return null;

  const binStep = (priceMax - priceMin) / bins;
  const priceBins = [];
  for (let i = 0; i <= bins; i++) {
    priceBins.push(priceMin + i * binStep);
  }

  const tpoCounts = new Array(bins).fill(0);

  for (const row of candles) {
    for (let b = 0; b < bins; b++) {
      const bLow = priceBins[b];
      const bHigh = priceBins[b + 1];
      if (bLow <= row.high && bHigh >= row.low) {
        tpoCounts[b] += 1;
      }
    }
  }

  let pocIdx = 0;
  let maxCount = -1;
  for (let b = 0; b < bins; b++) {
    if (tpoCounts[b] > maxCount) {
      maxCount = tpoCounts[b];
      pocIdx = b;
    }
  }

  const pocPrice = (priceBins[pocIdx] + priceBins[pocIdx + 1]) / 2;

  // 70% Value Area
  const totalHits = tpoCounts.reduce((a, b) => a + b, 0);
  const targetHits = totalHits * 0.7;

  const sortedIndices = tpoCounts
    .map((cnt, idx) => ({ cnt, idx }))
    .sort((a, b) => b.cnt - a.cnt);

  let cumHits = 0;
  const vaIndices = [];
  for (const item of sortedIndices) {
    cumHits += item.cnt;
    vaIndices.push(item.idx);
    if (cumHits >= targetHits) break;
  }

  const maxVaIdx = Math.max(...vaIndices);
  const minVaIdx = Math.min(...vaIndices);

  return {
    poc: pocPrice,
    vah: priceBins[maxVaIdx + 1] || priceBins[bins],
    val: priceBins[minVaIdx] || priceBins[0]
  };
}

// ========== STRATEGY EVALUATION FUNCTIONS ==========

export function evalWave4(candles) {
  if (!candles || candles.length < 40) return { text: '⚪ غير كافٍ', score: 0 };
  const ewos = candles.map(c => c.ewo);
  const prevSlice = ewos.slice(-40, -5);
  const recentSlice = ewos.slice(-15);
  const maxPrev = Math.max(...prevSlice);
  const minRecent = Math.min(...recentSlice);

  const last = ewos[ewos.length - 1];
  const prev = ewos[ewos.length - 2];

  if (maxPrev > 0 && minRecent <= 0) {
    if (prev < 0 && last >= 0) return { text: '🟢 شراء مؤكد (بداية W5)', score: 1.0 };
    if (last < 0 && last > prev) return { text: '🟡 استعداد (ارتداد W4)', score: 0.5 };
  }
  return { text: '⚪ محايد', score: 0.0 };
}

export function evalDivergence(candles) {
  if (!candles || candles.length < 30) return { text: '⚪ غير كافٍ', score: 0 };
  const lows = candles.map(c => c.low);
  const ewos = candles.map(c => c.ewo);

  const p1 = Math.min(...lows.slice(-30, -15));
  const p2 = Math.min(...lows.slice(-15));
  const e1 = Math.min(...ewos.slice(-30, -15));
  const e2 = Math.min(...ewos.slice(-15));

  const last = ewos[ewos.length - 1];
  const prev = ewos[ewos.length - 2];

  if (p2 < p1 && e2 > e1 && e2 < 0) {
    if (last > prev) return { text: '🟢 دايفرجنس إيجابي مؤكد', score: 1.0 };
    return { text: '🟡 رصد دايفرجنس (استعداد)', score: 0.5 };
  }
  return { text: '⚪ لا يوجد دايفرجنس', score: 0.0 };
}

export function evalSaucer(candles) {
  if (!candles || candles.length < 5) return { text: '⚪ غير كافٍ', score: 0 };
  const ewos = candles.map(c => c.ewo);
  const c = ewos[ewos.length - 1];
  const p1 = ewos[ewos.length - 2];
  const p2 = ewos[ewos.length - 3];

  if (c > 0 && p1 > 0 && p2 > 0) {
    if (p2 > p1 && c > p1) return { text: '🟢 صحن صاعد مؤكد (BUY)', score: 1.0 };
    if (p2 > p1 && c <= p1) return { text: '🟡 استعداد (تراجع مؤقت)', score: 0.5 };
  }
  return { text: '🔴 هبوط / تحت الصفر', score: 0.0 };
}

export function evalRsiOs(candles) {
  if (!candles || candles.length < 2) return { text: '⚪ غير كافٍ', score: 0 };
  const rsis = candles.map(c => c.rsi);
  const last = rsis[rsis.length - 1];
  const prev = rsis[rsis.length - 2];

  if (prev < 30 && last >= 30) return { text: '🟢 ارتداد من ذروة البيع (شراء)', score: 1.0 };
  if (last < 30) return { text: '🟡 ذروة بيع تحت 30 (استعداد)', score: 0.5 };
  if (last > 70) return { text: '🔴 تشبع شرائي فوق 70', score: 0.0 };
  return { text: '⚪ منطقة محايدة', score: 0.25 };
}

export function evalRsiC50(candles) {
  if (!candles || candles.length < 2) return { text: '⚪ غير كافٍ', score: 0 };
  const rsis = candles.map(c => c.rsi);
  const last = rsis[rsis.length - 1];
  const prev = rsis[rsis.length - 2];

  if (prev < 50 && last >= 50) return { text: '🟢 اختراق صاعد لمستوى 50', score: 1.0 };
  if (last >= 50) return { text: '📈 زخم صاعد مستمر', score: 0.75 };
  return { text: '🔴 زخم هابط تحت 50', score: 0.0 };
}

export function evalMacdCross(candles) {
  if (!candles || candles.length < 2) return { text: '⚪ غير كافٍ', score: 0 };
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (prev.macd <= prev.macd_signal && last.macd > last.macd_signal) {
    return { text: '🟢 تقاطع صاعد (Golden Cross)', score: 1.0 };
  }
  if (last.macd > last.macd_signal) {
    return { text: '📈 ماكد فوق خط الإشارة', score: 0.75 };
  }
  return { text: '🔴 ماكد تحت خط الإشارة', score: 0.0 };
}

export function evalSupertrendFlip(candles) {
  if (!candles || candles.length < 2) return { text: '⚪ غير كافٍ', score: 0 };
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (!prev.supertrend_dir && last.supertrend_dir) {
    return { text: '🟢 تحول صاعد (BUY FLIP)', score: 1.0 };
  }
  if (last.supertrend_dir) {
    return { text: '📈 اتجاه صاعد سارٍ', score: 0.75 };
  }
  return { text: '🔴 اتجاه هابط سارٍ', score: 0.0 };
}

export function evalSqueeze(candles) {
  if (!candles || candles.length < 2) return { text: '⚪ غير كافٍ', score: 0 };
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (prev.squeeze_on && !last.squeeze_on) {
    return { text: '🚀 انطلاق الانفجار (Squeeze Fired)', score: 1.0 };
  }
  if (last.squeeze_on) {
    return { text: '🟡 انضغاط حاد (Squeeze)', score: 0.5 };
  }
  return { text: '⚪ حركة طبيعية', score: 0.25 };
}

export function evalTpo(candles) {
  const tpoRes = calculateTpoLevels(candles);
  if (!tpoRes || !candles || candles.length === 0) return { text: '⚠️ غير متاح', score: 0, tpoRes: null };
  const close = candles[candles.length - 1].close;

  if (close > tpoRes.vah) {
    return { text: '🟢 كسر صاعد لمنطقة القيمة (Above VAH)', score: 1.0, tpoRes };
  }
  if (close >= tpoRes.poc) {
    return { text: '📈 تداول إيجابي فوق POC', score: 0.75, tpoRes };
  }
  if (close < tpoRes.val) {
    return { text: '🔴 كسر هابط لمنطقة القيمة (Below VAL)', score: 0.0, tpoRes };
  }
  return { text: '🟡 داخل منطقة القيمة تحت POC', score: 0.5, tpoRes };
}
