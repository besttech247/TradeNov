// TradeNov Scanner Constants & Default Configurations

export const MARKET_TYPES = {
  ALL: 'ALL',
  FUTURES: 'FUTURES',
  SPOT: 'SPOT'
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
  { id: 'all', label: 'الكل (All Coins)', desc: 'عرض جميع الأزواج المتداولة النشطة' },
  { id: 'volume_surge', label: '🌊 انفجار سيولة', desc: 'فوليوم مرتفع بشكل غير اعتيادي' },
  { id: 'top_gainers', label: '🚀 الأكثر صعوداً', desc: 'أعلى نسبة ارتفاع سعري' },
  { id: 'top_losers', label: '📉 الأكثر هبوطاً', desc: 'فرص ارتداد من القيعان' },
  { id: 'funding_negative', label: '⚡ تمويل سلبي (Short Squeeze)', desc: 'عقود ذات معدل تمويل سلبي حاد' },
  { id: 'alpha_btc', label: '🎯 تفوق على BTC', desc: 'عملات تتفوق على حركة البيتكوين' }
];

export const DEFAULT_SETTINGS = {
  marketType: MARKET_TYPES.ALL,
  timeframe: '5m',
  activeFilter: 'all',
  soundEnabled: true,
  isPaused: false,
  showHeatmap: true,
  enabledPlatforms: ['BINANCE', 'BYBIT', 'DEX'],
  minVolume24h: 500000,
  autoRefreshInterval: 3000,
  searchQuery: '',
  sortBy: 'quoteVolume',
  sortDirection: 'desc'
};
