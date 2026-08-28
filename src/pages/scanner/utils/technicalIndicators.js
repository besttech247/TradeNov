// Technical and Mathematical Utilities for TradeNov Scanner

/**
 * تنسيق الأسعار بدقة ديناميكية تناسب العملات ذات الأصفار الكثيرة
 */
export const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return '0.00';
  if (num === 0) return '0.00';
  if (num < 0.0001) return num.toFixed(7);
  if (num < 0.01) return num.toFixed(5);
  if (num < 1) return num.toFixed(4);
  if (num < 100) return num.toFixed(2);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * تنسيق أحجام التداول (M للملايين، K للآلاف، B للمليارات)
 */
export const formatVolume = (vol) => {
  const num = parseFloat(vol);
  if (isNaN(num)) return '$0';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

/**
 * تنسيق النسبة المئوية
 */
export const formatPercent = (percent) => {
  const num = parseFloat(percent);
  if (isNaN(num)) return '0.00%';
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(2)}%`;
};

/**
 * حساب التغير من سعر الافتتاح/الإغلاق السابق (Session Close/Open) وليس مجرد 24 ساعة عشوائية
 */
export const calculateSessionChange = (currentPrice, openPrice) => {
  const curr = parseFloat(currentPrice);
  const open = parseFloat(openPrice);
  if (!curr || !open || open === 0) return 0;
  return +(((curr - open) / open) * 100).toFixed(2);
};

/**
 * تنسيق معدل التمويل (Funding Rate) مع التحويل لنسبة مئوية
 */
export const formatFundingRate = (rate) => {
  if (rate === undefined || rate === null) return 'N/A';
  const num = parseFloat(rate) * 100;
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(4)}%`;
};

/**
 * حساب قوة العملة أمام البيتكوين (Alpha vs BTC)
 */
export const calculateBtcRelativeStrength = (coinChange, btcChange) => {
  const coin = parseFloat(coinChange) || 0;
  const btc = parseFloat(btcChange) || 0;
  return +(coin - btc).toFixed(2);
};

/**
 * رصد إشارة المضاربة السريعة مع وزن النقطة
 */
export const detectScalpSignal = (item, btcChange = 0) => {
  const signals = [];
  const change = parseFloat(item.priceChangePercent) || 0;
  const vol = parseFloat(item.quoteVolume) || 0;
  const funding = item.fundingRate ? parseFloat(item.fundingRate) * 100 : 0;
  const alpha = calculateBtcRelativeStrength(change, btcChange);

  // 1. إشارة انفجار الفوليوم (وزن 3)
  if (vol > 40000000 && Math.abs(change) > 4) {
    signals.push({ type: 'SURGE', weight: 3, label: 'انفجار سيولة 🌊', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' });
  }

  // 2. إشارة الاختراق السعري الصاعد (وزن 2)
  if (change >= 7) {
    signals.push({ type: 'PUMP', weight: 2, label: 'زخم صاعد 🚀', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' });
  } else if (change <= -7) {
    signals.push({ type: 'DUMP', weight: 1, label: 'هبوط حاد 📉', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' });
  }

  // 3. إشارة انضغاط الشورت (وزن 2)
  if (funding <= -0.04) {
    signals.push({ type: 'SQUEEZE', weight: 2, label: 'ضغط شورت ⚡', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' });
  }

  // 4. تفوق قوي على البيتكوين (وزن 2)
  if (alpha >= 4) {
    signals.push({ type: 'ALPHA', weight: 2, label: 'ألفا قوية 🎯', color: 'text-purple-400 bg-purple-950/60 border-purple-500/30' });
  }

  return signals;
};

/**
 * حساب مجموع وزن الإشارات لترتيب الجدول حسب قوة الإشارة
 */
export const getSignalsTotalWeight = (item, btcChange = 0) => {
  const signals = detectScalpSignal(item, btcChange);
  return signals.reduce((acc, curr) => acc + (curr.weight || 1), 0);
};

/**
 * حساب درجة الزخم (Momentum Score)
 */
export const calculateMomentumScore = (item, btcChange = 0) => {
  return getSignalsTotalWeight(item, btcChange);
};
