// TradeNov Scanner Constants & Default Configurations (Beta v2.0)

export const SCANNER_NAME = 'TradeNov Scanner';
export const SCANNER_VERSION = 'Beta v2.0';

export const MARKET_TYPES = {
  ALL: 'ALL',
  FUTURES: 'FUTURES',
  SPOT: 'SPOT'
};

export const STRATEGY_MODES = {
  ALL: 'ALL',
  SCALP: 'SCALP',   // صفقات سريعة (2 إلى 5 يومياً)
  SNIPER: 'SNIPER'  // صفقة القناص اليومية (صفقة واحدة عالية الثقة)
};

export const PLATFORMS = [
  { id: 'BINANCE', label: 'Binance', icon: '🟡', type: 'CEX' },
  { id: 'BYBIT', label: 'Bybit', icon: '🟠', type: 'CEX' },
  { id: 'DEX', label: 'DEX (Raydium/Uniswap)', icon: '🦄', type: 'DEX' }
];

export const TIMEFRAMES = [
  { label: '1m', value: '1m', seconds: 60 },
  { label: '3m', value: '3m', seconds: 180 },
  { label: '5m', value: '5m', seconds: 300 },
  { label: '15m', value: '15m', seconds: 900 },
  { label: '1h', value: '1h', seconds: 3600 }
];

export const FILTER_PRESETS = [
  { id: 'all', label: '🌐 الكل (All Coins)', desc: 'عرض جميع الأزواج المتداولة النشطة بدون قيود' },
  { id: 'sniper', label: '🎯 صفقة القناص (Sniper)', desc: 'صفقة اليوم الذهبية باختراق POC وتأكيد CVD' },
  { id: 'scalp', label: '⚡ صفقات سريعة (2-5)', desc: 'انفجار TTM Squeeze مع زخم حجم ودلتا' },
  { id: 'volume_surge', label: '🌊 انفجار سيولة', desc: 'فوليوم مرتفع بشكل غير اعتيادي' },
  { id: 'top_gainers', label: '🚀 الأكثر صعوداً', desc: 'أعلى نسبة ارتفاع سعري' },
  { id: 'funding_negative', label: '⚡ تمويل سلبي (Short Squeeze)', desc: 'عقود ذات معدل تمويل سلبي حاد' },
  { id: 'alpha_btc', label: '🏆 تفوق على BTC', desc: 'عملات تتفوق على حركة البيتكوين' }
];

export const DEFAULT_SETTINGS = {
  marketType: MARKET_TYPES.ALL,
  strategyMode: STRATEGY_MODES.ALL,
  timeframe: '15m',
  activeFilter: 'all',
  soundEnabled: true,
  isPaused: false,
  showHeatmap: true,
  enabledPlatforms: ['BINANCE', 'BYBIT', 'DEX'],
  minVolume24h: 100000, // فلتر مرن يسمح بمسح أوسع للعملات
  autoRefreshInterval: 3000,
  searchQuery: '',
  sortBy: 'quoteVolume',
  sortDirection: 'desc'
};

