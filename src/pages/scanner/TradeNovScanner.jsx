import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { ScannerHeader } from './components/ScannerHeader';
import { ScannerStatsBar } from './components/ScannerStatsBar';
import { SniperTradeCard } from './components/SniperTradeCard';
import { ScalpSignalsGrid } from './components/ScalpSignalsGrid';
import { RecentSignalsTracker } from './components/RecentSignalsTracker';
import { MomentumCardsGrid } from './components/MomentumCardsGrid';
import { LiveScannerTable } from './components/LiveScannerTable';
import { QuickMiniChartModal } from './components/QuickMiniChartModal';
import { PlatformsFilterModal } from './components/PlatformsFilterModal';
import { IconsLegendDrawer } from './components/IconsLegendDrawer';
import { useMultiExchangeScanner } from './hooks/useMultiExchangeScanner';
import { useAudioAlert } from './hooks/useAudioAlert';
import {
  MARKET_TYPES,
  STRATEGY_MODES,
  DEFAULT_SETTINGS,
  SCANNER_NAME,
  SCANNER_VERSION
} from './utils/scannerConstants';
import {
  calculateBtcRelativeStrength,
  evaluateDailySniper,
  evaluateScalpSignal
} from './utils/technicalIndicators';
import './styles/scanner.css';

const LOCAL_STORAGE_KEY = 'tradenov_scanner_recent_signals';

export default function TradeNovScanner() {
  const [marketType, setMarketType] = useState(DEFAULT_SETTINGS.marketType);
  const [strategyMode, setStrategyMode] = useState(DEFAULT_SETTINGS.strategyMode);
  const [timeframe, setTimeframe] = useState(DEFAULT_SETTINGS.timeframe);
  const [activeFilter, setActiveFilter] = useState(DEFAULT_SETTINGS.activeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState(DEFAULT_SETTINGS.enabledPlatforms);
  const [minVolume, setMinVolume] = useState(DEFAULT_SETTINGS.minVolume24h);
  const [isPlatformsModalOpen, setIsPlatformsModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  // سجل آخر 5 صفقات المحفوظ محلياً
  const [recentSignals, setRecentSignals] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const {
    data,
    btcData,
    loading,
    error,
    connectionStatus,
    nextRefreshCountdown,
    refresh
  } = useMultiExchangeScanner(marketType, enabledPlatforms, isPaused);

  const { playAlert } = useAudioAlert();

  // خريطة سريعة لجلب السعر اللحظي لأي عملة
  const currentDataMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(data)) {
      data.forEach((c) => {
        map.set(c.id, c);
        map.set(c.symbol, c);
      });
    }
    return map;
  }, [data]);

  // تتبع الصفقات لإطلاق التنبيهات الصوتية عند الصعود السريع أو إشارة القناص
  const prevTopGainerRef = useRef(null);

  useEffect(() => {
    if (!soundEnabled || isPaused || data.length === 0) return;
    const topCoin = [...data].sort((a, b) => b.priceChangePercent - a.priceChangePercent)[0];
    if (topCoin && prevTopGainerRef.current && topCoin.symbol !== prevTopGainerRef.current.symbol) {
      if (topCoin.priceChangePercent > 10) {
        playAlert('BULLISH');
      }
    }
    prevTopGainerRef.current = topCoin;
  }, [data, soundEnabled, isPaused, playAlert]);

  // تطبيق التصفية والبحث عبر كافة العملات دون حدود
  const filteredData = useMemo(() => {
    let result = data;

    // 1. تصفية الحد الأدنى للسيولة (إذا تم تعيينها > 0)
    if (minVolume > 0) {
      result = result.filter((c) => (c.quoteVolume || 0) >= minVolume);
    }

    // 2. تصفية البحث بالاسم أو الرمز
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      result = result.filter(
        (c) => c.symbol.toUpperCase().includes(q) || c.baseAsset.toUpperCase().includes(q)
      );
    }

    // 3. تصفية حسب الفلاتر السريعة
    if (activeFilter === 'sniper') {
      result = result.filter((c) => evaluateDailySniper(c, btcData) !== null);
    } else if (activeFilter === 'scalp') {
      result = result.filter((c) => evaluateScalpSignal(c, btcData) !== null);
    } else if (activeFilter === 'volume_surge') {
      result = result.filter((c) => c.quoteVolume > 30000000 && Math.abs(c.priceChangePercent) > 3.5);
    } else if (activeFilter === 'top_gainers') {
      result = [...result].sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    } else if (activeFilter === 'funding_negative') {
      result = result.filter((c) => (c.fundingRate || 0) < -0.0001);
    } else if (activeFilter === 'alpha_btc') {
      const btcChange = btcData?.priceChangePercent || 0;
      result = result.filter(
        (c) => calculateBtcRelativeStrength(c.priceChangePercent, btcChange) > 3
      );
    }

    return result;
  }, [data, searchQuery, activeFilter, minVolume, btcData]);

  // استخراج "صفقة القناص اليومية" (صفقة واحدة فقط عالية الثقة والوزن)
  const dailySniperCandidate = useMemo(() => {
    if (!data || data.length === 0) return null;
    const candidates = [];
    for (const item of data) {
      const sniper = evaluateDailySniper(item, btcData);
      if (sniper) {
        candidates.push(sniper);
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score * b.quoteVolume - a.score * a.quoteVolume);
    return candidates[0];
  }, [data, btcData]);

  // استخراج "صفقات السكالب السريعة" (2 إلى 5 صفقات يومياً)
  const activeScalpSignals = useMemo(() => {
    if (!data || data.length === 0) return [];
    const signals = [];
    for (const item of data) {
      const scalp = evaluateScalpSignal(item, btcData);
      if (scalp) {
        signals.push(scalp);
      }
    }
    signals.sort((a, b) => b.score - a.score);
    return signals.slice(0, 5);
  }, [data, btcData]);

  // حفظ وتحديث آخر 5 صفقات تلقائياً في السجل
  useEffect(() => {
    const toAdd = [];
    if (dailySniperCandidate) {
      toAdd.push({
        id: dailySniperCandidate.id || dailySniperCandidate.symbol,
        symbol: dailySniperCandidate.symbol,
        strategy: 'DAILY_SNIPER',
        signalPrice: dailySniperCandidate.price,
        platform: dailySniperCandidate.platform || 'BINANCE',
        timestamp: Date.now()
      });
    }

    if (activeScalpSignals.length > 0) {
      activeScalpSignals.slice(0, 3).forEach((s) => {
        toAdd.push({
          id: s.id || s.symbol,
          symbol: s.symbol,
          strategy: 'FAST_SCALP',
          signalPrice: s.price,
          platform: s.platform || 'BINANCE',
          timestamp: Date.now()
        });
      });
    }

    if (toAdd.length === 0) return;

    setRecentSignals((prev) => {
      let updated = [...prev];
      toAdd.forEach((newItem) => {
        // إذا لم تكن مضافة خلال آخر ساعتين
        const existingIdx = updated.findIndex((u) => u.symbol === newItem.symbol && u.strategy === newItem.strategy);
        if (existingIdx === -1) {
          updated = [newItem, ...updated];
        }
      });
      const trimmed = updated.slice(0, 5);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
      } catch (e) {
        console.error('Failed to save recent signals:', e);
      }
      return trimmed;
    });
  }, [dailySniperCandidate, activeScalpSignals]);

  const handleClearHistory = () => {
    setRecentSignals([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="tradenov-scanner-container px-4 sm:px-8 pb-12">
      {/* Dynamic Top Navigation with Build Date */}
      <TopNav title={`${SCANNER_NAME} (${SCANNER_VERSION})`} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header Controls with Strategy Mode Tabs */}
        <ScannerHeader
          marketType={marketType}
          setMarketType={setMarketType}
          strategyMode={strategyMode}
          setStrategyMode={setStrategyMode}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minVolume={minVolume}
          setMinVolume={setMinVolume}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          onOpenPlatformsModal={() => setIsPlatformsModalOpen(true)}
          connectionStatus={connectionStatus}
          onRefresh={refresh}
          loading={loading}
          totalCoinsCount={data.length}
        />

        {/* Error Alert if any */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={refresh} className="underline hover:text-white">إعادة المحاولة</button>
          </div>
        )}

        {/* 1. Daily Sniper Engine (المعروض دائماً في وضع القناص أو العرض الشامل) */}
        {(strategyMode === STRATEGY_MODES.ALL || strategyMode === STRATEGY_MODES.SNIPER) && (
          <SniperTradeCard
            sniperSignal={dailySniperCandidate}
            onSelectCoin={(coin) => setSelectedCoin(coin)}
          />
        )}

        {/* 2. Fast Scalping Signals Grid (المعروض في وضع السكالب أو العرض الشامل) */}
        {(strategyMode === STRATEGY_MODES.ALL || strategyMode === STRATEGY_MODES.SCALP) && (
          <ScalpSignalsGrid
            signals={activeScalpSignals}
            onSelectCoin={(coin) => setSelectedCoin(coin)}
          />
        )}

        {/* 3. Recent 5 Signals Live Performance Tracker (سجل آخر 5 صفقات مع عداد الوقت والتغير السعري) */}
        <RecentSignalsTracker
          recentSignals={recentSignals}
          currentDataMap={currentDataMap}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
          onClearHistory={handleClearHistory}
        />

        {/* Collapsible Smart Momentum Grid */}
        <MomentumCardsGrid
          items={filteredData}
          btcData={btcData}
          countdown={nextRefreshCountdown}
          isPaused={isPaused}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
        />

        {/* Summary Stats Bar */}
        <ScannerStatsBar
          items={data}
          btcData={btcData}
          marketType={marketType}
        />

        {/* Live Interactive Scanner Table (مسح شامل بدون قيود لجميع العملات) */}
        <LiveScannerTable
          items={filteredData}
          btcData={btcData}
          marketType={marketType}
          isPaused={isPaused}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
          loading={loading}
        />

        {/* Collapsible Icons & Signals Legend Drawer */}
        <IconsLegendDrawer />

        {/* Quick Candlestick Mini-Chart Modal (with Volume Profile POC and Levels) */}
        {selectedCoin && (
          <QuickMiniChartModal
            coin={selectedCoin}
            marketType={selectedCoin.market}
            onClose={() => setSelectedCoin(null)}
          />
        )}

        {/* Platforms & Volume Customization Modal */}
        <PlatformsFilterModal
          enabledPlatforms={enabledPlatforms}
          setEnabledPlatforms={setEnabledPlatforms}
          minVolume={minVolume}
          setMinVolume={setMinVolume}
          isOpen={isPlatformsModalOpen}
          onClose={() => setIsPlatformsModalOpen(false)}
        />
      </div>
    </div>
  );
}
