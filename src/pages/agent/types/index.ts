export type TradingMode = 'demo' | 'real';
export type ThemeMode = 'dark' | 'light';

export type ExchangeName = 'MEXC' | 'Binance' | 'Bybit' | 'KuCoin';

export interface ExchangeApi {
  id: string;
  name: ExchangeName;
  apiKey: string;
  apiSecret: string;
  isDemo: boolean;
  isConnected: boolean;
  pingMs: number;
  totalBalanceUsdt: number;
  lastSync: string;
}

export type StrategyType = 'Spot Grid' | 'DCA Bot' | 'RSI + MACD Signal' | 'Triangular Arbitrage';

export interface BotConfig {
  gridLevels?: number;
  upperPrice?: number;
  lowerPrice?: number;
  takeProfitPct?: number;
  stopLossPct?: number;
  rsiBuyThreshold?: number;
  rsiSellThreshold?: number;
  investmentUsdt: number;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface TradeOrder {
  id: string;
  botId: string;
  pair: string;
  exchange: ExchangeName;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  total: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  timestamp: string;
  pnl?: number;
}

export interface TradingBot {
  id: string;
  name: string;
  pair: string;
  exchange: ExchangeName;
  strategy: StrategyType;
  mode: TradingMode;
  status: 'active' | 'paused' | 'stopped';
  pnlUsdt: number;
  pnlPercent: number;
  winRate: number;
  tradesCount: number;
  config: BotConfig;
  createdAt: string;
  updatedAt: string;
  logs: BotLog[];
}

export interface AssetBalance {
  symbol: string;
  name: string;
  amount: number;
  priceUsdt: number;
  valueUsdt: number;
  change24h: number;
  icon: string;
}

export type NavigationTab = 
  | 'overview' 
  | 'bots' 
  | 'exchanges' 
  | 'strategy' 
  | 'trading' 
  | 'assistant' 
  | 'analytics' 
  | 'settings';
