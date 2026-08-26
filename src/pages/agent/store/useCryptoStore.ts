import { create } from 'zustand';
import { TradingMode, ThemeMode, ExchangeApi, TradingBot, TradeOrder, NavigationTab, AssetBalance, BotLog } from '../types';

interface CryptoState {
  theme: ThemeMode;
  toggleTheme: () => void;
  mode: TradingMode;
  setMode: (mode: TradingMode) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Exchanges
  exchanges: ExchangeApi[];
  addExchange: (exchange: Omit<ExchangeApi, 'id' | 'lastSync' | 'pingMs'>) => void;
  toggleExchangeConnection: (id: string) => void;
  deleteExchange: (id: string) => void;
  
  // Bots
  bots: TradingBot[];
  selectedBotId: string | null;
  setSelectedBotId: (id: string | null) => void;
  createBot: (botData: Omit<TradingBot, 'id' | 'pnlUsdt' | 'pnlPercent' | 'winRate' | 'tradesCount' | 'createdAt' | 'updatedAt' | 'logs'>) => void;
  toggleBotStatus: (id: string) => void;
  updateBotConfig: (id: string, config: Partial<TradingBot['config']>) => void;
  deleteBot: (id: string) => void;
  
  // Risk & Emergency
  pauseAllBots: () => void;
  cancelAllOrders: () => void;
  panicEmergencyClose: () => void;
  panicSellAllMarket: () => void;
  panicSellAllLimit: () => void;
  
  // Telegram & Webhook Settings
  telegramToken: string;
  telegramChatId: string;
  setTelegramSettings: (token: string, chatId: string) => void;
  soundAlertsEnabled: boolean;
  toggleSoundAlerts: () => void;

  // Trades
  orders: TradeOrder[];
  addOrder: (order: Omit<TradeOrder, 'id' | 'timestamp'>) => void;

  // Assets & Rebalance
  assets: AssetBalance[];
  rebalancePortfolio: () => void;
  
  // Simulator Tick
  simulateMarketTick: () => void;
}

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore audio context errors if browser blocks auto-audio
  }
};

const initialExchanges: ExchangeApi[] = [
  {
    id: 'ex-mexc-1',
    name: 'MEXC',
    apiKey: 'mexc_live_pk_8f93****************',
    apiSecret: '********************************',
    isDemo: false,
    isConnected: true,
    pingMs: 24,
    totalBalanceUsdt: 14250.80,
    lastSync: 'الآن'
  },
  {
    id: 'ex-binance-1',
    name: 'Binance',
    apiKey: 'binance_pk_9a12****************',
    apiSecret: '********************************',
    isDemo: false,
    isConnected: true,
    pingMs: 18,
    totalBalanceUsdt: 28410.50,
    lastSync: 'قبل دقيقة'
  },
  {
    id: 'ex-bybit-1',
    name: 'Bybit',
    apiKey: 'bybit_demo_key_77a****************',
    apiSecret: '********************************',
    isDemo: true,
    isConnected: true,
    pingMs: 35,
    totalBalanceUsdt: 50000.00,
    lastSync: 'الآن'
  }
];

const initialBots: TradingBot[] = [
  {
    id: 'bot-1',
    name: 'MEXC Spot Grid Alpha',
    pair: 'BTC/USDT',
    exchange: 'MEXC',
    strategy: 'Spot Grid',
    mode: 'real',
    status: 'active',
    pnlUsdt: 428.50,
    pnlPercent: 8.57,
    winRate: 92.4,
    tradesCount: 142,
    config: {
      gridLevels: 20,
      upperPrice: 72000,
      lowerPrice: 58000,
      takeProfitPct: 2.5,
      stopLossPct: 4.0,
      investmentUsdt: 5000
    },
    createdAt: '2026-08-01',
    updatedAt: '2026-08-19',
    logs: [
      { id: 'l1', timestamp: '01:42:10', type: 'success', message: 'تم تنفيذ أمر شراء شبكي بسعر $62,450.00 USDT' },
      { id: 'l2', timestamp: '01:38:05', type: 'info', message: 'البوت يقوم بفحص مؤشر الإشارات لزوج BTC/USDT' },
      { id: 'l3', timestamp: '01:20:00', type: 'success', message: 'جني أرباح الشبكة #14 بسعر $63,100.00 USDT (+12.40 USDT)' }
    ]
  },
  {
    id: 'bot-2',
    name: 'ETH DCA Smart Accumulator',
    pair: 'ETH/USDT',
    exchange: 'MEXC',
    strategy: 'DCA Bot',
    mode: 'real',
    status: 'active',
    pnlUsdt: 215.10,
    pnlPercent: 5.38,
    winRate: 88.0,
    tradesCount: 64,
    config: {
      investmentUsdt: 4000,
      takeProfitPct: 3.0,
      stopLossPct: 5.0
    },
    createdAt: '2026-08-05',
    updatedAt: '2026-08-19',
    logs: [
      { id: 'l4', timestamp: '02:01:15', type: 'success', message: 'تم تجميع 0.5 ETH بسعر $3,410.00 USDT' },
      { id: 'l5', timestamp: '00:15:30', type: 'info', message: 'انتظار نقطة ارتداد مؤشر RSI تحت 35' }
    ]
  },
  {
    id: 'bot-3',
    name: 'SOL RSI + MACD Scalper',
    pair: 'SOL/USDT',
    exchange: 'MEXC',
    strategy: 'RSI + MACD Signal',
    mode: 'demo',
    status: 'active',
    pnlUsdt: 850.40,
    pnlPercent: 17.01,
    winRate: 94.1,
    tradesCount: 98,
    config: {
      investmentUsdt: 5000,
      takeProfitPct: 4.5,
      stopLossPct: 3.0
    },
    createdAt: '2026-08-10',
    updatedAt: '2026-08-19',
    logs: [
      { id: 'l6', timestamp: '02:08:22', type: 'success', message: 'تحقق إشارة الشراء الذهبية لـ MACD وتم الدخول بسعر $141.20' }
    ]
  },
  {
    id: 'bot-4',
    name: 'MEXC Arbitrage Hunter',
    pair: 'BTC/USDT',
    exchange: 'MEXC',
    strategy: 'Triangular Arbitrage',
    mode: 'demo',
    status: 'paused',
    pnlUsdt: 120.00,
    pnlPercent: 2.40,
    winRate: 100.0,
    tradesCount: 32,
    config: {
      investmentUsdt: 5000,
      takeProfitPct: 0.8,
      stopLossPct: 0.5
    },
    createdAt: '2026-08-12',
    updatedAt: '2026-08-19',
    logs: [
      { id: 'l7', timestamp: '01:00:00', type: 'info', message: 'البوت في وضع الاستعداد بانتظار فروقات أسعار السيولة' }
    ]
  }
];

const initialOrders: TradeOrder[] = [
  {
    id: 'ord-101',
    botId: 'bot-1',
    pair: 'BTC/USDT',
    exchange: 'MEXC',
    type: 'BUY',
    price: 63100.50,
    amount: 0.05,
    total: 3155.025,
    status: 'FILLED',
    timestamp: 'منذ دقيقة'
  },
  {
    id: 'ord-102',
    botId: 'bot-2',
    pair: 'ETH/USDT',
    exchange: 'MEXC',
    type: 'BUY',
    price: 3420.00,
    amount: 0.50,
    total: 1710.00,
    status: 'FILLED',
    timestamp: 'منذ 5 دقائق'
  },
  {
    id: 'ord-103',
    botId: 'bot-1',
    pair: 'BTC/USDT',
    exchange: 'MEXC',
    type: 'SELL',
    price: 63850.00,
    amount: 0.05,
    total: 3192.50,
    status: 'FILLED',
    timestamp: 'منذ 18 دقيقة'
  }
];

const initialAssets: AssetBalance[] = [
  { symbol: 'USDT', name: 'Tether USD', amount: 24500.00, priceUsdt: 1.00, valueUsdt: 24500.00, change24h: 0.01, icon: '💵' },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.45, priceUsdt: 63200.00, valueUsdt: 28440.00, change24h: 3.45, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', amount: 4.80, priceUsdt: 3450.00, valueUsdt: 16560.00, change24h: 1.85, icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', amount: 35.00, priceUsdt: 143.80, valueUsdt: 5033.00, change24h: 8.75, icon: '◎' },
  { symbol: 'XRP', name: 'Ripple', amount: 4200.00, priceUsdt: 0.584, valueUsdt: 2452.80, change24h: 4.20, icon: '✕' },
];

export const useCryptoStore = create<CryptoState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: nextTheme };
  }),

  mode: 'real',
  setMode: (mode) => set({ mode }),

  activeTab: 'overview',
  setActiveTab: (activeTab) => set({ activeTab }),

  exchanges: initialExchanges,
  addExchange: (exchangeData) => set((state) => {
    const newEx: ExchangeApi = {
      ...exchangeData,
      id: `ex-${Date.now()}`,
      pingMs: Math.floor(Math.random() * 30) + 15,
      lastSync: 'الآن'
    };
    return { exchanges: [...state.exchanges, newEx] };
  }),
  toggleExchangeConnection: (id) => set((state) => ({
    exchanges: state.exchanges.map(e => e.id === id ? { ...e, isConnected: !e.isConnected } : e)
  })),
  deleteExchange: (id) => set((state) => ({
    exchanges: state.exchanges.filter(e => e.id !== id)
  })),

  bots: initialBots,
  selectedBotId: null,
  setSelectedBotId: (id) => set({ selectedBotId: id }),

  createBot: (botData) => set((state) => {
    const newBot: TradingBot = {
      ...botData,
      id: `bot-${Date.now()}`,
      pnlUsdt: 0.00,
      pnlPercent: 0.00,
      winRate: 100.0,
      tradesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      logs: [
        { id: `log-${Date.now()}`, timestamp: new Date().toLocaleTimeString('ar-EG'), type: 'info', message: `تم إنشاء وتهيئة البوت بنجاح على منصة ${botData.exchange}` }
      ]
    };
    return { bots: [newBot, ...state.bots] };
  }),

  toggleBotStatus: (id) => set((state) => ({
    bots: state.bots.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'active' ? 'paused' : 'active';
        return {
          ...b,
          status: nextStatus,
          logs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('ar-EG'),
              type: nextStatus === 'active' ? 'success' : 'warning',
              message: nextStatus === 'active' ? 'تم استئناف تشغيل البوت' : 'تم إيقاف البوت مؤقتاً'
            },
            ...b.logs
          ]
        };
      }
      return b;
    })
  })),

  updateBotConfig: (id, config) => set((state) => ({
    bots: state.bots.map(b => b.id === id ? { ...b, config: { ...b.config, ...config }, updatedAt: new Date().toISOString().split('T')[0] } : b)
  })),

  deleteBot: (id) => set((state) => ({
    bots: state.bots.filter(b => b.id !== id),
    selectedBotId: state.selectedBotId === id ? null : state.selectedBotId
  })),

  // Emergency & Risk Actions
  pauseAllBots: () => set((state) => ({
    bots: state.bots.map(b => ({ ...b, status: 'paused' }))
  })),

  cancelAllOrders: () => set((state) => ({
    orders: state.orders.map(o => o.status === 'PENDING' ? { ...o, status: 'CANCELLED' } : o)
  })),

  panicEmergencyClose: () => set((state) => {
    return {
      bots: state.bots.map(b => ({ ...b, status: 'stopped' })),
      orders: state.orders.map(o => ({ ...o, status: 'CANCELLED' }))
    };
  }),

  panicSellAllMarket: () => set((state) => {
    // Liquidate all volatile assets into USDT via Market Order
    let liquidatedTotal = 0;
    const marketSellOrders: TradeOrder[] = [];

    state.assets.forEach(a => {
      if (a.symbol !== 'USDT' && a.amount > 0) {
        liquidatedTotal += a.valueUsdt;
        marketSellOrders.push({
          id: `ord-panic-mkt-${Date.now()}-${a.symbol}`,
          botId: 'emergency-market',
          pair: `${a.symbol}/USDT`,
          exchange: 'MEXC',
          type: 'SELL',
          price: a.priceUsdt,
          amount: a.amount,
          total: a.valueUsdt,
          status: 'FILLED',
          timestamp: 'الآن (Market Emergency)'
        });
      }
    });

    const updatedAssets = state.assets.map(a => {
      if (a.symbol === 'USDT') {
        return { ...a, amount: a.amount + liquidatedTotal, valueUsdt: a.valueUsdt + liquidatedTotal };
      }
      return { ...a, amount: 0, valueUsdt: 0 };
    });

    return {
      bots: state.bots.map(b => ({ ...b, status: 'stopped' })),
      orders: [...marketSellOrders, ...state.orders],
      assets: updatedAssets
    };
  }),

  panicSellAllLimit: () => set((state) => {
    // Place Limit Orders for all assets at current best price
    const limitSellOrders: TradeOrder[] = [];

    state.assets.forEach(a => {
      if (a.symbol !== 'USDT' && a.amount > 0) {
        limitSellOrders.push({
          id: `ord-panic-lmt-${Date.now()}-${a.symbol}`,
          botId: 'emergency-limit',
          pair: `${a.symbol}/USDT`,
          exchange: 'MEXC',
          type: 'SELL',
          price: a.priceUsdt * 1.002, // best ask/limit price
          amount: a.amount,
          total: a.valueUsdt * 1.002,
          status: 'PENDING',
          timestamp: 'الآن (Limit Emergency)'
        });
      }
    });

    return {
      bots: state.bots.map(b => ({ ...b, status: 'paused' })),
      orders: [...limitSellOrders, ...state.orders]
    };
  }),

  // Telegram Settings
  telegramToken: '7192839182:AAH_mexc_trading_bot_token_demo',
  telegramChatId: '984128491',
  setTelegramSettings: (token, chatId) => set({ telegramToken: token, telegramChatId: chatId }),
  
  soundAlertsEnabled: true,
  toggleSoundAlerts: () => set((state) => ({ soundAlertsEnabled: !state.soundAlertsEnabled })),

  orders: initialOrders,
  addOrder: (orderData) => {
    const { soundAlertsEnabled } = get();
    if (soundAlertsEnabled) {
      playNotificationSound();
    }

    set((state) => {
      const newOrder: TradeOrder = {
        ...orderData,
        id: `ord-${Date.now()}`,
        timestamp: 'الآن'
      };
      return { orders: [newOrder, ...state.orders] };
    });
  },

  assets: initialAssets,
  rebalancePortfolio: () => set((state) => {
    // Simulated rebalancing
    return {
      assets: state.assets.map(a => ({
        ...a,
        amount: parseFloat((a.amount * 1.01).toFixed(3)),
        valueUsdt: parseFloat((a.valueUsdt * 1.01).toFixed(2))
      }))
    };
  }),

  simulateMarketTick: () => set((state) => {
    const randomDelta = (Math.random() - 0.47) * 2.5;
    const updatedBots = state.bots.map((b) => {
      if (b.status !== 'active') return b;
      const newPnl = parseFloat((b.pnlUsdt + randomDelta).toFixed(2));
      const newPct = parseFloat(((newPnl / (b.config.investmentUsdt || 5000)) * 100).toFixed(2));
      return {
        ...b,
        pnlUsdt: newPnl,
        pnlPercent: newPct,
        tradesCount: b.tradesCount + (Math.random() > 0.6 ? 1 : 0)
      };
    });

    return { bots: updatedBots };
  })
}));
