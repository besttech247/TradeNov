import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BYBIT_REST_URL,
  BYBIT_WS_URL,
  analyzeMarket,
  determineMarketRegime
} from '../utils/radarEngine';

const DEFAULT_SCAN_LIMIT = 100;
const UPDATE_INTERVAL_SEC = 5;

export function useRadarScanner() {
  const [isRunning, setIsRunning] = useState(true);
  const [status, setStatus] = useState('CONNECTING');
  const [regime, setRegime] = useState('UNKNOWN');
  const [rows, setRows] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [logs, setLogs] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('radar_sound_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(UPDATE_INTERVAL_SEC);
  const [marketCount, setMarketCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [scanLimit, setScanLimit] = useState(DEFAULT_SCAN_LIMIT);

  // References to keep state across intervals without triggering re-renders
  const snapshotsRef = useRef({});
  const tradesRef = useRef({});
  const booksRef = useRef({});
  const symbolsRef = useRef([]);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const isRunningRef = useRef(true);
  const audioContextRef = useRef(null);
  const prevTopSymbolRef = useRef(null);

  isRunningRef.current = isRunning;

  // Sound generator
  const playAlertSound = useCallback((frequency = 880, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }, [soundEnabled]);

  const addLog = useCallback((text, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time: timeStr, text, type },
      ...prev.slice(0, 99)
    ]);
  }, []);

  // Fetch Klines for a single symbol
  const fetchSymbolKline = async (symbol) => {
    try {
      const resp = await fetch(
        `${BYBIT_REST_URL}/v5/market/kline?category=linear&symbol=${symbol}&interval=5&limit=160`
      );
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data.retCode === 0 && data.result?.list) {
        return {
          symbol,
          klines: [...data.result.list].reverse()
        };
      }
    } catch (e) {
      // Ignore individual fetch failure
    }
    return null;
  };

  // Bootstrap top markets and klines
  const bootstrapMarkets = async (limitToFetch = scanLimit) => {
    setStatus('BOOTSTRAP');
    addLog(`🚀 جاري فحص أسواق Bybit Linear للعقود الدائمة (أعلى ${limitToFetch} زوج سيولة)...`);

    try {
      // 1. Get Instruments Info
      const infoResp = await fetch(
        `${BYBIT_REST_URL}/v5/market/instruments-info?category=linear&status=Trading&limit=1000`
      );
      const infoData = await infoResp.json();
      const validSymbols = (infoData.result?.list || [])
        .filter(x => x.status === 'Trading' && x.quoteCoin === 'USDT' && x.settleCoin === 'USDT' && x.contractType === 'LinearPerpetual')
        .map(x => x.symbol);

      // 2. Get 24h Tickers for Turnover sorting
      const tickResp = await fetch(`${BYBIT_REST_URL}/v5/market/tickers?category=linear`);
      const tickData = await tickResp.json();
      const tickerMap = {};
      (tickData.result?.list || []).forEach(x => {
        tickerMap[x.symbol] = parseFloat(x.turnover24h || 0);
      });

      // Sort by turnover desc
      let selected = validSymbols
        .sort((a, b) => (tickerMap[b] || 0) - (tickerMap[a] || 0))
        .slice(0, limitToFetch);

      if (!selected.includes('BTCUSDT')) {
        selected.push('BTCUSDT');
      }

      symbolsRef.current = selected;
      setMarketCount(selected.length);
      addLog(`✅ تم تحديد ${selected.length} زوج عملة للتتبع اللحظي. جاري تحميل الشموع الفنية (5M)...`);

      // 3. Batch fetch klines with concurrency limit
      const chunkSize = 12;
      const newSnapshots = {};

      for (let i = 0; i < selected.length; i += chunkSize) {
        const chunk = selected.slice(i, i + chunkSize);
        const promises = chunk.map(s => fetchSymbolKline(s));
        const results = await Promise.all(promises);
        results.forEach(res => {
          if (res) newSnapshots[res.symbol] = res;
        });
      }

      snapshotsRef.current = newSnapshots;
      addLog(`✨ تم تحميل بيانات الشموع بنجاح لـ ${Object.keys(newSnapshots).length} زوج!`);

      // Perform initial scoring run
      runAnalysisPass();
      setStatus('LIVE');
      initWebSocket(selected);

    } catch (err) {
      addLog(`❌ خطأ في تحميل بيانات السوق: ${err.message}`, 'error');
      setStatus('ERROR');
    }
  };

  // Run calculation cycle across all snapshots
  const runAnalysisPass = useCallback(() => {
    if (!isRunningRef.current) return;

    const snapshots = snapshotsRef.current;
    const trades = tradesRef.current;
    const books = booksRef.current;

    const analyzed = [];
    for (const sym of Object.keys(snapshots)) {
      const snap = snapshots[sym];
      const res = analyzeMarket(snap, trades, books);
      if (res) {
        analyzed.push(res);
      }
    }

    analyzed.sort((a, b) => b.score - a.score);

    // BTC Market Regime
    const btcSnap = snapshots['BTCUSDT'];
    const currentRegime = determineMarketRegime(btcSnap);
    setRegime(currentRegime);

    setRows(analyzed);
    const nowTime = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    setLastUpdated(nowTime);
    setCountdown(UPDATE_INTERVAL_SEC);

    // Audio Alert if new top score >= 78
    if (analyzed.length > 0 && analyzed[0].score >= 78) {
      if (prevTopSymbolRef.current !== analyzed[0].symbol) {
        prevTopSymbolRef.current = analyzed[0].symbol;
        playAlertSound(1046, 'triangle');
        addLog(`🔥 إشارة قوية جديدة: ${analyzed[0].symbol} [${analyzed[0].signal}] بنقاط ${analyzed[0].score}/100`, 'highlight');
      }
    }

    if (!selectedSymbol && analyzed.length > 0) {
      setSelectedSymbol(analyzed[0].symbol);
    }
  }, [selectedSymbol, playAlertSound, addLog]);

  // Connect Bybit WebSocket
  const initWebSocket = (symbols) => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }

    const ws = new WebSocket(BYBIT_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('LIVE');
      addLog('⚡ تم الاتصال المباشر بمجرى Bybit WebSocket بنجاح.');

      // Subscribe in chunks (Bybit max args per subscribe message is 10)
      const topics = [];
      symbols.forEach(s => {
        topics.push(`publicTrade.${s}`);
        topics.push(`tickers.${s}`);
      });

      const batchSize = 10;
      for (let i = 0; i < topics.length; i += batchSize) {
        const batch = topics.slice(i, i + batchSize);
        ws.send(JSON.stringify({ op: 'subscribe', args: batch }));
      }
    };

    ws.onmessage = (event) => {
      if (!isRunningRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.op === 'ping') {
          ws.send(JSON.stringify({ op: 'pong' }));
          return;
        }

        const topic = msg.topic || '';
        const data = msg.data;

        if (topic.startsWith('publicTrade')) {
          if (Array.isArray(data)) {
            data.forEach(trade => {
              const sym = trade.s;
              const price = parseFloat(trade.p);
              const vol = parseFloat(trade.v);
              const isBuy = trade.S === 'Buy';

              if (!tradesRef.current[sym]) tradesRef.current[sym] = [];
              tradesRef.current[sym].push({
                ts: Date.now() / 1000,
                quote: price * vol,
                buy: isBuy
              });

              // Keep last 1000 trades per symbol
              if (tradesRef.current[sym].length > 1000) {
                tradesRef.current[sym] = tradesRef.current[sym].slice(-500);
              }
            });
          }
        } else if (topic.startsWith('tickers') && data) {
          const sym = data.symbol;
          const bid = parseFloat(data.bid1Price || 0);
          const ask = parseFloat(data.ask1Price || 0);
          const mid = (bid + ask) / 2;

          if (sym && mid > 0) {
            booksRef.current[sym] = {
              bid_qty: parseFloat(data.bid1Size || 0),
              ask_qty: parseFloat(data.ask1Size || 0),
              spread_pct: ((ask - bid) / mid) * 100
            };
          }
        }
      } catch (e) {
        // Parse error ignore
      }
    };

    ws.onclose = () => {
      if (isRunningRef.current) {
        setStatus('RECONNECTING');
        addLog('⚠️ انقطع اتصال WebSocket. جاري إعادة الاتصال...', 'warning');
        setTimeout(() => {
          if (isRunningRef.current && symbolsRef.current.length > 0) {
            initWebSocket(symbolsRef.current);
          }
        }, 3000);
      }
    };

    ws.onerror = () => {
      // Error handled by onclose
    };
  };

  // Start / Stop controls
  const startScanner = () => {
    setIsRunning(true);
    isRunningRef.current = true;
    setStatus('LIVE');
    addLog('▶️ تم تشغيل الرادار واستئناف الفحص اللحظي.');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (symbolsRef.current.length > 0) {
        initWebSocket(symbolsRef.current);
      } else {
        bootstrapMarkets();
      }
    }
  };

  const stopScanner = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setStatus('STOPPED');
    addLog('⏸️ تم إيقاف الرادار مؤقتاً.');
  };

  const refreshNow = () => {
    addLog('🔄 جاري تحديث الحسابات والشموع فوراً...');
    bootstrapMarkets(scanLimit);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('radar_sound_enabled', String(next));
      } catch {}
      if (next) {
        playAlertSound(784, 'sine');
      }
      return next;
    });
  };

  const clearLogs = () => setLogs([]);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    addLog('📋 تم نسخ سجل الأحداث بنجاح.');
  };

  // Main lifecycle
  useEffect(() => {
    bootstrapMarkets(scanLimit);

    // Setup periodic calculation loop (1s interval for countdown, 5s for calculations)
    let secondCounter = 0;
    intervalRef.current = setInterval(() => {
      if (!isRunningRef.current) return;
      secondCounter++;
      setCountdown(prev => (prev > 1 ? prev - 1 : UPDATE_INTERVAL_SEC));

      if (secondCounter % UPDATE_INTERVAL_SEC === 0) {
        runAnalysisPass();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, []);

  // Filtered rows
  const filteredRows = rows.filter(item => {
    if (searchQuery) {
      const q = searchQuery.trim().toUpperCase();
      if (!item.symbol.includes(q)) return false;
    }
    if (minScoreFilter > 0 && item.score < minScoreFilter) {
      return false;
    }
    if (directionFilter === 'LONG') {
      return item.direction === 'LONG';
    }
    if (directionFilter === 'SHORT') {
      return item.direction === 'SHORT';
    }
    if (directionFilter === 'STRONG') {
      return item.signal.startsWith('STRONG');
    }
    return true;
  });

  const selectedItem = rows.find(r => r.symbol === selectedSymbol) || (rows.length > 0 ? rows[0] : null);

  return {
    isRunning,
    status,
    regime,
    rows: filteredRows,
    totalRowsCount: rows.length,
    selectedSymbol,
    setSelectedSymbol,
    selectedItem,
    logs,
    soundEnabled,
    toggleSound,
    directionFilter,
    setDirectionFilter,
    minScoreFilter,
    setMinScoreFilter,
    searchQuery,
    setSearchQuery,
    countdown,
    marketCount,
    lastUpdated,
    scanLimit,
    setScanLimit,
    startScanner,
    stopScanner,
    refreshNow,
    clearLogs,
    copyLogs
  };
}
