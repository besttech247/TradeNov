// TradeNov INFO - Constants & Presets

export const INFO_VERSION = 'v1.0.0';

export const TIMEFRAMES = ['1d', '4h', '1h', '30m', '15m', '5m', '3m', '1m'];

export const TF_SECONDS = {
  '1d': 86400,
  '4h': 14400,
  '1h': 3600,
  '30m': 1800,
  '15m': 900,
  '5m': 300,
  '3m': 180,
  '1m': 60
};

export const SCREENS = [
  { id: 'overview', index: 0, label: '0. نظرة عامة شاملة', fullTitle: '⚡ 0. نظرة عامة شاملة (Overview Dashboard)', icon: '⚡' },
  { id: 'fundamental', index: 7, label: '7. التحليل الأساسي والسيولة الكلية', fullTitle: '🏛️ 7. التحليل الأساسي والسيولة الكلية (Fundamental & Fed)', icon: '🏛️' },
  { id: 'ewo', index: 1, label: '1. Elliott Wave Oscillator', fullTitle: '🌊 1. Elliott Wave Oscillator (EWO)', icon: '🌊' },
  { id: 'rsi', index: 2, label: '2. Relative Strength Index', fullTitle: '📊 2. Relative Strength Index (RSI)', icon: '📊' },
  { id: 'macd', index: 3, label: '3. MACD Momentum', fullTitle: '⚡ 3. Moving Average Convergence Divergence (MACD)', icon: '⚡' },
  { id: 'supertrend', index: 4, label: '4. Supertrend', fullTitle: '🏹 4. Supertrend (Directional Filter)', icon: '🏹' },
  { id: 'squeeze', index: 5, label: '5. TTM Squeeze & Bollinger', fullTitle: '💥 5. TTM Squeeze & Bollinger Bands', icon: '💥' },
  { id: 'tpo', index: 6, label: '6. TPO / Market Profile', fullTitle: '🎯 6. Time Price Opportunity (TPO / Market Profile)', icon: '🎯' }
];

export const MARKET_PRESETS = [
  { id: 'GOLD', name: '🟡 الذهب (Gold)', symbol: 'GC=F', cryptoPair: 'PAXGUSDT', type: 'COMMODITY', icon: '🟡', defaultPrice: 2515.4 },
  { id: 'OIL', name: '🛢️ النفط الخام (Crude Oil)', symbol: 'CL=F', cryptoPair: null, type: 'COMMODITY', icon: '🛢️', defaultPrice: 75.8 },
  { id: 'SILVER', name: '⚪ الفضة (Silver)', symbol: 'SI=F', cryptoPair: null, type: 'COMMODITY', icon: '⚪', defaultPrice: 29.2 },
  { id: 'SP500', name: '📈 مؤشر S&P 500', symbol: '^GSPC', cryptoPair: null, type: 'INDEX', icon: '📈', defaultPrice: 5648.4 },
  { id: 'US10Y', name: '🏛️ عوائد السندات 10 سنوات (10Y)', symbol: '^TNX', cryptoPair: null, type: 'BOND', icon: '🏛️', defaultPrice: 3.86 },
  { id: 'BTC', name: '₿ بيتكوين (BTC/USDT)', symbol: 'BTCUSDT', cryptoPair: 'BTCUSDT', type: 'CRYPTO', icon: '₿', defaultPrice: 59200.0 },
  { id: 'ETH', name: '🔷 إيثيريوم (ETH/USDT)', symbol: 'ETHUSDT', cryptoPair: 'ETHUSDT', type: 'CRYPTO', icon: '🔷', defaultPrice: 2520.0 },
  { id: 'SOL', name: '🟣 سولانا (SOL/USDT)', symbol: 'SOLUSDT', cryptoPair: 'SOLUSDT', type: 'CRYPTO', icon: '🟣', defaultPrice: 134.5 },
  { id: 'CUSTOM', name: '✍️ بحث يدوي مخصص', symbol: 'CUSTOM', cryptoPair: null, type: 'CUSTOM', icon: '✍️', defaultPrice: 100.0 }
];
