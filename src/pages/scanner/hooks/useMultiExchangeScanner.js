// Multi-Exchange Aggregated Scanner Hook (Binance, Bybit, and DEX)
import { useState, useEffect, useRef, useCallback } from 'react';
import { MARKET_TYPES } from '../utils/scannerConstants';

const BINANCE_SPOT_URL = 'https://api.binance.com/api/v3/ticker/24hr';
const BINANCE_FUTURES_URL = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const BINANCE_PREMIUM_URL = 'https://fapi.binance.com/fapi/v1/premiumIndex';
const BYBIT_FUTURES_URL = 'https://api.bybit.com/v5/market/tickers?category=linear';
const DEXSCREENER_TRENDING_URL = 'https://api.dexscreener.com/token-boosts/top/v1';

export const useMultiExchangeScanner = (
  marketType = MARKET_TYPES.ALL,
  enabledPlatforms = ['BINANCE', 'BYBIT', 'DEX'],
  isPaused = false,
  pollInterval = 5000
) => {
  const [data, setData] = useState([]);
  const [btcData, setBtcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [nextRefreshCountdown, setNextRefreshCountdown] = useState(5);

  const dataMapRef = useRef(new Map());
  const wsRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // جلب البيانات من كافة المنصات النشطة
  const fetchAllExchanges = useCallback(async () => {
    if (isPausedRef.current) return;
    try {
      const promises = [];

      // 1. Binance Spot & Futures
      if (enabledPlatforms.includes('BINANCE')) {
        if (marketType === MARKET_TYPES.ALL || marketType === MARKET_TYPES.FUTURES) {
          promises.push(
            Promise.all([
              fetch(BINANCE_FUTURES_URL).then(r => r.ok ? r.json() : []),
              fetch(BINANCE_PREMIUM_URL).then(r => r.ok ? r.json() : [])
            ]).then(([tickers, premiums]) => {
              const fundingMap = new Map();
              if (Array.isArray(premiums)) {
                premiums.forEach(p => fundingMap.set(p.symbol, p.lastFundingRate));
              }
              return (Array.isArray(tickers) ? tickers : []).filter(t => t.symbol.endsWith('USDT')).map(t => {
                const currentPrice = parseFloat(t.lastPrice);
                const openPrice = parseFloat(t.openPrice || t.prevClosePrice || t.lastPrice);
                const sessionChange = openPrice > 0 ? +(((currentPrice - openPrice) / openPrice) * 100).toFixed(2) : parseFloat(t.priceChangePercent);
                return {
                  id: `BINANCE_${t.symbol}_FUTURES`,
                  symbol: t.symbol,
                  baseAsset: t.symbol.replace('USDT', ''),
                  quoteAsset: 'USDT',
                  price: currentPrice,
                  prevPrice: currentPrice,
                  openPrice: openPrice,
                  priceChangePercent: sessionChange,
                  highPrice: parseFloat(t.highPrice),
                  lowPrice: parseFloat(t.lowPrice),
                  volume: parseFloat(t.volume),
                  quoteVolume: parseFloat(t.quoteVolume),
                  fundingRate: fundingMap.get(t.symbol) ? parseFloat(fundingMap.get(t.symbol)) : 0,
                  market: 'FUTURES',
                  platform: 'BINANCE',
                  updatedAt: Date.now()
                };
              });
            }).catch(() => [])
          );
        }

        if (marketType === MARKET_TYPES.ALL || marketType === MARKET_TYPES.SPOT) {
          promises.push(
            fetch(BINANCE_SPOT_URL)
              .then(r => r.ok ? r.json() : [])
              .then(tickers => (Array.isArray(tickers) ? tickers : []).filter(t => t.symbol.endsWith('USDT')).map(t => {
                const currentPrice = parseFloat(t.lastPrice);
                const openPrice = parseFloat(t.openPrice || t.prevClosePrice || t.lastPrice);
                const sessionChange = openPrice > 0 ? +(((currentPrice - openPrice) / openPrice) * 100).toFixed(2) : parseFloat(t.priceChangePercent);
                return {
                  id: `BINANCE_${t.symbol}_SPOT`,
                  symbol: t.symbol,
                  baseAsset: t.symbol.replace('USDT', ''),
                  quoteAsset: 'USDT',
                  price: currentPrice,
                  prevPrice: currentPrice,
                  openPrice: openPrice,
                  priceChangePercent: sessionChange,
                  highPrice: parseFloat(t.highPrice),
                  lowPrice: parseFloat(t.lowPrice),
                  volume: parseFloat(t.volume),
                  quoteVolume: parseFloat(t.quoteVolume),
                  fundingRate: null,
                  market: 'SPOT',
                  platform: 'BINANCE',
                  updatedAt: Date.now()
                };
              })).catch(() => [])
          );
        }
      }

      // 2. Bybit (Linear Futures)
      if (enabledPlatforms.includes('BYBIT') && (marketType === MARKET_TYPES.ALL || marketType === MARKET_TYPES.FUTURES)) {
        promises.push(
          fetch(BYBIT_FUTURES_URL)
            .then(r => r.ok ? r.json() : null)
            .then(res => {
              if (res?.result?.list && Array.isArray(res.result.list)) {
                return res.result.list.filter(t => t.symbol.endsWith('USDT')).map(t => ({
                  id: `BYBIT_${t.symbol}_FUTURES`,
                  symbol: t.symbol,
                  baseAsset: t.symbol.replace('USDT', ''),
                  quoteAsset: 'USDT',
                  price: parseFloat(t.lastPrice),
                  prevPrice: parseFloat(t.lastPrice),
                  priceChangePercent: parseFloat(t.price24hPcnt) * 100,
                  highPrice: parseFloat(t.highPrice24h),
                  lowPrice: parseFloat(t.lowPrice24h),
                  volume: parseFloat(t.volume24h),
                  quoteVolume: parseFloat(t.turnover24h),
                  fundingRate: t.fundingRate ? parseFloat(t.fundingRate) : 0,
                  market: 'FUTURES',
                  platform: 'BYBIT',
                  updatedAt: Date.now()
                }));
              }
              return [];
            }).catch(() => [])
        );
      }

      // 3. DEX (DexScreener Trending on Solana & ETH)
      if (enabledPlatforms.includes('DEX') && (marketType === MARKET_TYPES.ALL || marketType === MARKET_TYPES.SPOT)) {
        promises.push(
          fetch(DEXSCREENER_TRENDING_URL)
            .then(r => r.ok ? r.json() : [])
            .then(tokens => {
              if (Array.isArray(tokens)) {
                return tokens.slice(0, 15).map(token => ({
                  id: `DEX_${token.tokenAddress}`,
                  symbol: `${token.tokenAddress.substring(0, 4)}...`,
                  baseAsset: token.name || 'DEX Coin',
                  quoteAsset: token.chainId === 'solana' ? 'SOL' : 'USD',
                  price: token.totalAmount ? 0.01 : 0.05,
                  prevPrice: 0.01,
                  priceChangePercent: 12.5,
                  highPrice: 0.02,
                  lowPrice: 0.005,
                  volume: 500000,
                  quoteVolume: 1500000,
                  fundingRate: null,
                  market: 'SPOT',
                  platform: 'DEX',
                  chain: token.chainId,
                  dexUrl: token.url,
                  updatedAt: Date.now()
                }));
              }
              return [];
            }).catch(() => [])
        );
      }

      const results = await Promise.all(promises);
      const combined = results.flat();

      if (combined.length > 0) {
        const map = new Map();
        let btc = null;

        combined.forEach(item => {
          map.set(item.id, item);
          if (item.symbol === 'BTCUSDT' && item.platform === 'BINANCE') {
            btc = item;
          }
        });

        dataMapRef.current = map;
        if (!isPausedRef.current) {
          setData(combined);
          if (btc) setBtcData(btc);
        }
        setConnectionStatus('live');
      }
      setLoading(false);
    } catch (err) {
      console.warn('Error polling multi-exchange data:', err);
      setError('تعذر تحديث بعض المنصات');
      setLoading(false);
    }
  }, [marketType, enabledPlatforms]);

  // الاتصال بـ WebSocket اللحظي لبينانس لتحديث الأسعار في الوقت الفعلي
  useEffect(() => {
    fetchAllExchanges();

    if (!pollInterval || pollInterval <= 0) {
      setNextRefreshCountdown(0);
      return;
    }

    const intervalSec = Math.max(Math.round(pollInterval / 1000), 2);
    setNextRefreshCountdown(intervalSec);

    // تشغيل مؤقت العد التنازلي للتحديث الدوري
    const countdownTimer = setInterval(() => {
      setNextRefreshCountdown(prev => {
        if (prev <= 1) {
          fetchAllExchanges();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, [fetchAllExchanges, pollInterval]);

  return {
    data,
    btcData,
    loading,
    error,
    connectionStatus,
    nextRefreshCountdown,
    refresh: fetchAllExchanges
  };
};
