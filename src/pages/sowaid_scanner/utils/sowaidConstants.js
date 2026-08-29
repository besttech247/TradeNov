// SOWAID Scanner v4.0 Constants & Strategy Specifications

export const SCANNER_NAME = 'SOWAID Scanner';
export const SCANNER_VERSION = 'v4.0';

export const TF_SPECS = {
  "1d": {
    label: "1 يوم (1D)",
    minutes: 1440,
    sl: 0.0700,      // 7.00%
    trail: 0.0150,   // 1.50%
    max: 1,
    filter: "none",
    size_usd: 650.0,
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30"
  },
  "4h": {
    label: "4 ساعات (4H)",
    minutes: 240,
    sl: 0.0350,      // 3.50%
    trail: 0.0080,   // 0.80%
    max: 2,
    filter: "none",
    size_usd: 250.0,
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
  },
  "81m": {
    label: "81 دقيقة (81m)",
    minutes: 81,
    sl: 0.0220,      // 2.20%
    trail: 0.0050,   // 0.50%
    max: 2,
    filter: "1d",
    size_usd: 150.0,
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  "27m": {
    label: "27 دقيقة (27m)",
    minutes: 27,
    sl: 0.0120,      // 1.20%
    trail: 0.0030,   // 0.30%
    max: 3,
    filter: "1d",
    size_usd: 100.0,
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  },
  "9m": {
    label: "9 دقائق (9m)",
    minutes: 9,
    sl: 0.0065,      // 0.65%
    trail: 0.0020,   // 0.20%
    max: 4,
    filter: "81m",
    size_usd: 60.0,
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  }
};

export const PRIORITY_ORDER = ["1d", "4h", "81m", "27m", "9m"];

export const SOWAID_FILTER_PRESETS = [
  { id: 'all', label: '🌐 الكل (All Coins)', desc: 'عرض جميع العملات النشطة' },
  { id: 'high_confluence', label: '🔥 أعلى توافق (Confluence 3+)', desc: 'عملات تظهر إشارات ارتداد على 3 فريمات فأكثر' },
  { id: 'daily_active', label: '👑 الفريم اليومي (1D Active)', desc: 'ارتدادات الفريم اليومي الأكبر وزناً ($650)' },
  { id: 'fast_scalp', label: '⚡ ارتداد سريع (9m/27m)', desc: 'صفقات المضاربة السريعة المتوافقة مع فلتر الترند' },
  { id: 'top_volume', label: '🌊 أعلى سيولة', desc: 'أعلى حجم تداول 24 ساعة' }
];

export const SOWAID_DEFAULT_SETTINGS = {
  marketType: 'ALL',
  activeFilter: 'all',
  searchQuery: '',
  minVolume24h: 100000,
  soundEnabled: true,
  isPaused: false,
  selectedTf: 'all'
};
