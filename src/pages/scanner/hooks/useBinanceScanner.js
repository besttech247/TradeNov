// Core Real-Time Scanner Hook for Binance Spot & Futures
import { useState, useEffect, useRef, useCallback } from 'react';
import { MARKET_TYPES } from '../utils/scannerConstants';

const SPOT_REST_URL = 'https://api.binance.com/api/v3/ticker/24hr';
const FUTURES_REST_URL = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const FUTURES_PREMIUM_URL = 'https://fapi.binance.com/fapi/v1/premiumIndex';

const SPOT_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const FUTURES_WS_URL = 'wss://fstream.binance.com/ws/!ticker@arr';

export const useBinanceScanner = (marketType = MARKET_TYPES.FUTURES) => {
  const [data, setData] = useState([]);
  const [btcData, setBtcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'live' | 'fallback'
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const wsRef = useRef(null);
  const dataMapRef = useRef(new Map());
  const pendingUpdatesRef = useRef(new Map());
  const throttleTimerRef = useRef(null);

  // 1. جلب البيانات الأولية عبر REST API
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (marketType === MARKET_TYPES.FUTURES) {
        const [tickerRes, premiumRes] = await Promise.all([
          fetch(FUTURES_REST_URL),
          fetch(FUTURES_PREMIUM_URL)
        ]);

        if (!tickerRes.ok) throw new Error('فشل جلب بيانات العقود من بينانس');
        const tickers = await tickerRes.json();
        
        let fundingMap = new Map();
        if (premiumRes.ok) {
          const premiums = await premiumRes.json();
          premiums.forEach(p => {
            fundingMap.set(p.symbol, {
              lastFundingRate: p.lastFundingRate,
              nextFundingTime: p.nextFundingTime
            });
          });
        }

        const map = new Map();
        let btc = null;

        tickers.forEach(t => {
          if (t.symbol.endsWith('USDT')) {
            const fundingInfo = fundingMap.get(t.symbol) || {};
            const item = {
              symbol: t.symbol,
              baseAsset: t.symbol.replace('USDT', ''),
              quoteAsset: 'USDT',
              price: parseFloat(t.lastPrice),
              prevPrice: parseFloat(t.lastPrice),
              priceChange: parseFloat(t.priceChange),
              priceChangePercent: parseFloat(t.priceChangePercent),
              highPrice: parseFloat(t.highPrice),
              lowPrice: parseFloat(t.lowPrice),
              volume: parseFloat(t.volume),
              quoteVolume: parseFloat(t.quoteVolume),
              fundingRate: fundingInfo.lastFundingRate ? parseFloat(fundingInfo.lastFundingRate) : 0,
              nextFundingTime: fundingInfo.nextFundingTime || null,
              market: 'FUTURES',
              updatedAt: Date.now()
            };
            map.set(t.symbol, item);
            if (t.symbol === 'BTCUSDT') btc = item;
          }
        });

        dataMapRef.current = map;
        setBtcData(btc);
        setData(Array.from(map.values()));
        setLoading(false);
      } else {
        // Spot
        const res = await fetch(SPOT_REST_URL);
        if (!res.ok) throw new Error('فشل جلب بيانات السوق الفوري من بينانس');
        const tickers = await res.json();

        const map = new Map();
        let btc = null;

        tickers.forEach(t => {
          if (t.symbol.endsWith('USDT')) {
            const item = {
              symbol: t.symbol,
              baseAsset: t.symbol.replace('USDT', ''),
              quoteAsset: 'USDT',
              price: parseFloat(t.lastPrice),
              prevPrice: parseFloat(t.lastPrice),
              priceChange: parseFloat(t.priceChange),
              priceChangePercent: parseFloat(t.priceChangePercent),
              highPrice: parseFloat(t.highPrice),
              lowPrice: parseFloat(t.lowPrice),
              volume: parseFloat(t.volume),
              quoteVolume: parseFloat(t.quoteVolume),
              fundingRate: null,
              market: 'SPOT',
              updatedAt: Date.now()
            };
            map.set(t.symbol, item);
            if (t.symbol === 'BTCUSDT') btc = item;
          }
        });

        dataMapRef.current = map;
        setBtcData(btc);
        setData(Array.from(map.values()));
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching Binance market data:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل بيانات السوق');
      setLoading(false);
    }
  }, [marketType]);

  // 2. تطبيق التحديثات المجمعة كل 1.5 ثانية لمنع تهنيج المتصفح (Smooth 60FPS UI)
  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.size === 0) return;

    let hasChanges = false;
    let updatedBtc = null;

    pendingUpdatesRef.current.forEach((update, symbol) => {
      const existing = dataMapRef.current.get(symbol);
      if (existing) {
        const newPrice = update.price;
        const priceChanged = newPrice !== existing.price;
        existing.prevPrice = existing.price;
        existing.price = newPrice;
        if (priceChanged) {
          existing.priceDirection = newPrice > existing.prevPrice ? 'up' : 'down';
        }
        if (update.priceChangePercent !== undefined) {
          existing.priceChangePercent = update.priceChangePercent;
        }
        if (update.quoteVolume !== undefined) {
          existing.quoteVolume = update.quoteVolume;
        }
        existing.updatedAt = Date.now();
        hasChanges = true;

        if (symbol === 'BTCUSDT') {
          updatedBtc = { ...existing };
        }
      }
    });

    pendingUpdatesRef.current.clear();

    if (hasChanges) {
      setData(Array.from(dataMapRef.current.values()));
      if (updatedBtc) setBtcData(updatedBtc);
      setLastUpdated(Date.now());
    }
  }, []);

  // 3. الاتصال بـ WebSocket اللحظي
  useEffect(() => {
    fetchInitialData();

    const wsUrl = marketType === MARKET_TYPES.FUTURES ? FUTURES_WS_URL : SPOT_WS_URL;
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus('live');
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            if (Array.isArray(rawData)) {
              rawData.forEach(item => {
                const s = item.s;
                if (s && s.endsWith('USDT')) {
                  const currentPrice = parseFloat(item.c);
                  const changePct = parseFloat(item.P || item.p || 0);
                  const qVol = parseFloat(item.q || item.Q || 0);

                  pendingUpdatesRef.current.set(s, {
                    price: currentPrice,
                    priceChangePercent: changePct,
                    quoteVolume: qVol
                  });
                }
              });
            }
          } catch (e) {
            // parse error ignore
          }
        };

        ws.onerror = (err) => {
          console.warn('WebSocket error, falling back to REST poll:', err);
          setConnectionStatus('fallback');
        };

        ws.onclose = () => {
          setConnectionStatus('connecting');
          // محاولة إعادة الاتصال التلقائي بعد 4 ثوانٍ
          reconnectTimeout = setTimeout(() => {
            connectWs();
          }, 4000);
        };
      } catch (err) {
        console.warn('Failed to start WebSocket, using REST mode:', err);
        setConnectionStatus('fallback');
      }
    };

    connectWs();

    // تشغيل مؤقت تفريغ التحديثات الدورية
    throttleTimerRef.current = setInterval(flushUpdates, 1500);

    return () => {
      if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [marketType, fetchInitialData, flushUpdates]);

  return {
    data,
    btcData,
    loading,
    error,
    connectionStatus,
    lastUpdated,
    refresh: fetchInitialData
  };
};
