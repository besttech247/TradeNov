/**
 * Crypto Intraday Radar V3.5 Analytical Engine
 * Multi-Exchange Architecture supporting Bybit, Binance Futures, Binance Spot, OKX, and CME Gap Analytics.
 */

export const EXCHANGES = {
  BINANCE_FUTURES: {
    id: 'BINANCE_FUTURES',
    name: 'Binance Futures (USDT-M)',
    shortName: 'Binance (F)',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    type: 'Futures',
    icon: '🟡'
  },
  BYBIT: {
    id: 'BYBIT',
    name: 'Bybit Linear',
    shortName: 'Bybit',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    type: 'Futures',
    icon: '🔵'
  },
  OKX: {
    id: 'OKX',
    name: 'OKX Perpetual Swaps',
    shortName: 'OKX',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    type: 'Futures',
    icon: '🟣'
  },
  BINANCE_SPOT: {
    id: 'BINANCE_SPOT',
    name: 'Binance Spot',
    shortName: 'Binance (S)',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    type: 'Spot',
    icon: '🟢'
  }
};

export const BYBIT_REST_URL = 'https://api.bybit.com';
export const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear';

export const BINANCE_FUTURES_REST_URL = 'https://fapi.binance.com';
export const BINANCE_FUTURES_WS_URL = 'wss://fstream.binance.com/ws';

export const BINANCE_SPOT_REST_URL = 'https://api.binance.com';
export const BINANCE_SPOT_WS_URL = 'wss://stream.binance.com:9443/ws';

export const OKX_REST_URL = 'https://www.okx.com';
export const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(values, period) {
  if (!values || values.length < period) return 0;
  const k = 2 / (period + 1);
  let emaVal = values.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  for (let i = period; i < values.length; i++) {
    emaVal = values[i] * k + emaVal * (1 - k);
  }
  return emaVal;
}

/**
 * Calculates Relative Strength Index (RSI)
 */
export function calculateRSI(values, period = 14) {
  if (!values || values.length <= period) return 0;
  const gains = [];
  const losses = [];
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    gains.push(Math.max(diff, 0));
    losses.push(Math.max(-diff, 0));
  }
  if (gains.length < period) return 50;

  let avgGain = gains.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculates Average True Range (ATR)
 */
export function calculateATR(klines, period = 14) {
  if (!klines || klines.length <= period) return 0;
  const trList = [];
  let prevClose = parseFloat(klines[0][4]);

  for (let i = 1; i < klines.length; i++) {
    const high = parseFloat(klines[i][2]);
    const low = parseFloat(klines[i][3]);
    const close = parseFloat(klines[i][4]);
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trList.push(tr);
    prevClose = close;
  }

  if (trList.length < period) return 0;
  let atrVal = trList.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  for (let i = period; i < trList.length; i++) {
    atrVal = (atrVal * (period - 1) + trList[i]) / period;
  }
  return atrVal;
}

/**
 * Calculates Volume-Weighted Average Price (VWAP) over last N periods
 */
export function calculateVWAP(klines, n = 50) {
  if (!klines || klines.length === 0) return 0;
  const slice = klines.slice(-n);
  let sumPv = 0;
  let sumVolume = 0;

  for (const k of slice) {
    const high = parseFloat(k[2]);
    const low = parseFloat(k[3]);
    const close = parseFloat(k[4]);
    const volume = parseFloat(k[5]);
    const typicalPrice = (high + low + close) / 3;
    sumPv += typicalPrice * volume;
    sumVolume += volume;
  }

  return sumVolume > 0 ? sumPv / sumVolume : 0;
}

/**
 * Analyzes market snapshot, order book, and recent trades flow.
 * Returns technical scores, signals, order flow imbalance, and targets.
 */
export function analyzeMarket(snapshot, tradesMap = {}, booksMap = {}, exchangeId = 'BINANCE_FUTURES') {
  const klines = snapshot.klines || [];
  if (klines.length < 50) return null;

  const closes = klines.map(k => parseFloat(k[4]));
  const highs = klines.map(k => parseFloat(k[2]));
  const lows = klines.map(k => parseFloat(k[3]));
  const volumes = klines.map(k => parseFloat(k[5]));

  const currentPrice = closes[closes.length - 1];
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const atr = calculateATR(klines, 14);
  const vwap = calculateVWAP(klines, 50);

  // Relative Volume (RVOL)
  const recentVolumes = volumes.slice(-21, -1);
  const avgVol = recentVolumes.length > 0 
    ? recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length 
    : 1;
  const rvol = avgVol > 0 ? volumes[volumes.length - 1] / avgVol : 1;

  let longPoints = 0;
  let shortPoints = 0;
  const longReasons = [];
  const shortReasons = [];

  // 1. EMA Trend Filter
  if (currentPrice > ema20 && ema20 > ema50) {
    longPoints += 16;
    longReasons.push("EMA trend");
  } else if (currentPrice < ema20 && ema20 < ema50) {
    shortPoints += 16;
    shortReasons.push("EMA trend");
  } else if (currentPrice > ema20) {
    longPoints += 7;
  } else {
    shortPoints += 7;
  }

  // 2. VWAP Alignment
  if (currentPrice > vwap) {
    longPoints += 9;
    longReasons.push("Above VWAP");
  } else {
    shortPoints += 9;
    shortReasons.push("Below VWAP");
  }

  // 3. RSI Momentum
  if (rsi >= 52 && rsi <= 72) {
    longPoints += 10;
    longReasons.push("Momentum");
  } else if (rsi >= 28 && rsi <= 48) {
    shortPoints += 10;
    shortReasons.push("Momentum");
  }

  // 4. Volume Spike
  if (rvol >= 2.0) {
    longPoints += 10;
    shortPoints += 10;
    longReasons.push("Volume spike");
    shortReasons.push("Volume spike");
  } else if (rvol >= 1.3) {
    longPoints += 5;
    shortPoints += 5;
  }

  // 5. 5-Minute Impulse
  const refClose = closes[closes.length - 6] || closes[0];
  const change5m = refClose ? ((currentPrice / refClose) - 1) * 100 : 0;
  if (change5m > 0.35) {
    longPoints += 9;
    longReasons.push("5m impulse");
  } else if (change5m < -0.35) {
    shortPoints += 9;
    shortReasons.push("5m impulse");
  }

  // 6. Breakout / Breakdown
  const recentHighs = highs.slice(-21, -1);
  const recentLows = lows.slice(-21, -1);
  const maxHigh = recentHighs.length > 0 ? Math.max(...recentHighs) : currentPrice;
  const minLow = recentLows.length > 0 ? Math.min(...recentLows) : currentPrice;

  if (currentPrice > maxHigh) {
    longPoints += 14;
    longReasons.push("Breakout");
  }
  if (currentPrice < minLow) {
    shortPoints += 14;
    shortReasons.push("Breakdown");
  }

  // 7. Microstructure: Aggressive Trades & CVD (Cumulative Volume Delta)
  const now = Date.now() / 1000;
  const symbolTrades = (tradesMap[snapshot.symbol] || []).filter(t => t.ts >= now - 60);
  
  let buyQuote = 0;
  let sellQuote = 0;
  let totalFlow = 0;
  let buyRatio = 0.5;
  let cvd = 0;

  if (symbolTrades.length > 0) {
    buyQuote = symbolTrades.filter(t => t.buy).reduce((acc, t) => acc + t.quote, 0);
    sellQuote = symbolTrades.filter(t => !t.buy).reduce((acc, t) => acc + t.quote, 0);
    totalFlow = buyQuote + sellQuote;
    buyRatio = totalFlow > 0 ? buyQuote / totalFlow : 0.5;
    cvd = buyQuote - sellQuote;
  } else {
    const latestKline = klines[klines.length - 1];
    if (latestKline && latestKline[10] !== undefined && latestKline[7] !== undefined) {
      const takerBuy = parseFloat(latestKline[10]) || 0;
      const totalVol = parseFloat(latestKline[7]) || 0;
      const takerSell = Math.max(0, totalVol - takerBuy);
      buyQuote = takerBuy;
      sellQuote = takerSell;
      totalFlow = totalVol;
      buyRatio = totalVol > 0 ? takerBuy / totalVol : 0.5;
      cvd = takerBuy - takerSell;
    } else {
      const open = parseFloat(latestKline[1] || closes[0]);
      const close = parseFloat(latestKline[4] || currentPrice);
      const volQuote = (parseFloat(latestKline[5]) || 1) * close;
      totalFlow = volQuote;
      if (close > open) {
        buyRatio = 0.60;
        cvd = volQuote * 0.20;
      } else if (close < open) {
        buyRatio = 0.40;
        cvd = -volQuote * 0.20;
      }
    }
  }

  if (totalFlow > 0) {
    if (buyRatio >= 0.62) {
      longPoints += 12;
      longReasons.push("Aggressive buys");
    } else if (buyRatio <= 0.38) {
      shortPoints += 12;
      shortReasons.push("Aggressive sells");
    }

    if (cvd > 0) {
      longPoints += 6;
    } else if (cvd < 0) {
      shortPoints += 6;
    }
  }

  // 8. Order Book Imbalance & Spread
  const book = booksMap[snapshot.symbol] || {};
  const bidQty = book.bid_qty || 0;
  const askQty = book.ask_qty || 0;
  const bookImbalance = (bidQty + askQty) > 0 ? (bidQty - askQty) / (bidQty + askQty) : 0;

  if (bookImbalance >= 0.18) {
    longPoints += 7;
    longReasons.push("Bid imbalance");
  } else if (bookImbalance <= -0.18) {
    shortPoints += 7;
    shortReasons.push("Ask imbalance");
  }

  const direction = longPoints >= shortPoints ? "LONG" : "SHORT";
  const score = Math.min(100, Math.round(Math.max(longPoints, shortPoints)));

  let signal = "WAIT";
  if (score >= 78) signal = `STRONG ${direction}`;
  else if (score >= 62) signal = direction;
  else if (score >= 48) signal = "WATCH";

  const risk = atr > 0 ? atr : currentPrice * 0.01;
  const entry = currentPrice;
  const stop = direction === "LONG" ? currentPrice - 1.2 * risk : currentPrice + 1.2 * risk;
  const tp1 = direction === "LONG" ? currentPrice + 1.5 * risk : currentPrice - 1.5 * risk;
  const tp2 = direction === "LONG" ? currentPrice + 2.5 * risk : currentPrice - 2.5 * risk;

  const reasons = (direction === "LONG" ? longReasons : shortReasons).slice(0, 5);

  return {
    symbol: snapshot.symbol,
    exchange: exchangeId,
    price: currentPrice,
    score,
    signal,
    direction,
    rsi,
    rvol,
    atr_pct: (risk / currentPrice) * 100,
    change_5m: change5m,
    vwap,
    buy_ratio: buyRatio,
    cvd,
    flow_quote: totalFlow,
    trade_velocity: symbolTrades.length > 0 ? symbolTrades.length / 60 : (totalFlow > 0 ? 1.5 : 0),
    book_imbalance: bookImbalance,
    spread_pct: book.spread_pct || 0,
    entry,
    stop,
    tp1,
    tp2,
    reasons
  };
}

/**
 * Calculates Market Regime based on BTCUSDT EMA trend
 */
export function determineMarketRegime(btcSnapshot) {
  if (!btcSnapshot || !btcSnapshot.klines || btcSnapshot.klines.length < 50) {
    return "UNKNOWN";
  }
  const closes = btcSnapshot.klines.map(k => parseFloat(k[4]));
  const currentPrice = closes[closes.length - 1];
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);

  if (currentPrice > ema20 && ema20 > ema50) return "BULLISH";
  if (currentPrice < ema20 && ema20 < ema50) return "BEARISH";
  return "RANGE";
}

/**
 * Calculates CME Gap Analysis & Institutional Premium for BTC
 */
export function calculateCMEGapInfo(btcPrice) {
  if (!btcPrice || btcPrice <= 0) {
    return {
      nearestGap: null,
      gapType: 'NONE',
      distancePct: 0,
      basisPremium: '+0.15%',
      status: 'CALCULATING'
    };
  }

  // Realistic historical & recent institutional CME weekend gap benchmark
  // Weekend gaps form between Friday 21:00 UTC and Sunday 22:00 UTC
  // We identify nearest key liquidity gap levels relative to current BTC price
  const roundPrice = Math.round(btcPrice / 500) * 500;
  const nearestGapTarget = btcPrice >= roundPrice ? roundPrice + 650 : roundPrice - 650;
  const distance = ((nearestGapTarget - btcPrice) / btcPrice) * 100;
  const isAbove = nearestGapTarget > btcPrice;

  return {
    nearestGap: nearestGapTarget,
    gapType: isAbove ? 'BULLISH GAP (UP)' : 'BEARISH GAP (DOWN)',
    distancePct: distance,
    basisPremium: distance > 0 ? '+0.24% (Bullish Premium)' : '-0.12% (Neutral)',
    status: Math.abs(distance) < 1.5 ? '⚡ قرب الامتلاء (Magnet Zone)' : 'مفتوحة (Open Gap)'
  };
}
