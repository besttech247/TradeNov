import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { ScannerHeader } from './components/ScannerHeader';
import { ScannerStatsBar } from './components/ScannerStatsBar';
import { MomentumCardsGrid } from './components/MomentumCardsGrid';
import { LiveScannerTable } from './components/LiveScannerTable';
import { QuickMiniChartModal } from './components/QuickMiniChartModal';
import { PlatformsFilterModal } from './components/PlatformsFilterModal';
import { useMultiExchangeScanner } from './hooks/useMultiExchangeScanner';
import { useAudioAlert } from './hooks/useAudioAlert';
import { MARKET_TYPES, DEFAULT_SETTINGS } from './utils/scannerConstants';
import { calculateBtcRelativeStrength } from './utils/technicalIndicators';
import './styles/scanner.css';

export default function TradeNovScanner() {
  const [marketType, setMarketType] = useState(DEFAULT_SETTINGS.marketType);
  const [timeframe, setTimeframe] = useState(DEFAULT_SETTINGS.timeframe);
  const [activeFilter, setActiveFilter] = useState(DEFAULT_SETTINGS.activeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState(DEFAULT_SETTINGS.enabledPlatforms);
  const [minVolume, setMinVolume] = useState(DEFAULT_SETTINGS.minVolume24h);
  const [isPlatformsModalOpen, setIsPlatformsModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

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

  // تتبع الصفقات لإطلاق التنبيهات الصوتية عند الصعود السريع
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

  // تطبيق التصفية والبحث
  const filteredData = useMemo(() => {
    let result = data;

    // 1. تصفية الحد الأدنى للسيولة
    result = result.filter(c => (c.quoteVolume || 0) >= minVolume);

    // 2. تصفية البحث بالاسم أو الرمز
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      result = result.filter(
        (c) => c.symbol.toUpperCase().includes(q) || c.baseAsset.toUpperCase().includes(q)
      );
    }

    // 3. تصفية حسب الفلاتر السريعة
    if (activeFilter === 'volume_surge') {
      result = result.filter((c) => c.quoteVolume > 30000000 && Math.abs(c.priceChangePercent) > 3.5);
    } else if (activeFilter === 'top_gainers') {
      result = [...result].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 40);
    } else if (activeFilter === 'top_losers') {
      result = [...result].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 40);
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

  return (
    <div className="tradenov-scanner-container px-4 sm:px-8 pb-12">
      {/* Dynamic Top Navigation with Build Date */}
      <TopNav title="TradeNov Scanner (Beta v1.5)" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Title & Beta Notice */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div className="text-right">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>🛰️</span>
                <span>TradeNov <span className="text-primary glow-text">Scanner</span></span>
              </h2>
              <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 rounded-full animate-pulse">
                PRO BETA v1.5
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              رادار السيولة المجمعة متعدد المنصات (Binance, Bybit, DEX) للسوق الفوري والعقود الآجلة.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-white/[0.02] p-2 px-3 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>بث حي متعدد المصادر (CEX & DEX)</span>
          </div>
        </div>

        {/* Header Controls */}
        <ScannerHeader
          marketType={marketType}
          setMarketType={setMarketType}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          onOpenPlatformsModal={() => setIsPlatformsModalOpen(true)}
          connectionStatus={connectionStatus}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Error Alert if any */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={refresh} className="underline hover:text-white">إعادة المحاولة</button>
          </div>
        )}

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

        {/* Live Interactive Scanner Table */}
        <LiveScannerTable
          items={filteredData}
          btcData={btcData}
          marketType={marketType}
          isPaused={isPaused}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
          loading={loading}
        />

        {/* Quick Candlestick Mini-Chart Modal */}
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
