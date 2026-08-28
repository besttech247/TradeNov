import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { ScannerHeader } from './components/ScannerHeader';
import { ScannerStatsBar } from './components/ScannerStatsBar';
import { LiveScannerTable } from './components/LiveScannerTable';
import { QuickMiniChartModal } from './components/QuickMiniChartModal';
import { useBinanceScanner } from './hooks/useBinanceScanner';
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
  const [selectedCoin, setSelectedCoin] = useState(null);

  const { data, btcData, loading, error, connectionStatus, refresh } = useBinanceScanner(marketType);
  const { playAlert } = useAudioAlert();

  // تتبع الصفقات لإطلاق التنبيهات الصوتية عند الصعود السريع
  const prevTopGainerRef = useRef(null);

  useEffect(() => {
    if (!soundEnabled || data.length === 0) return;
    // التحقق من وجود ارتفاع حاد مفاجئ لأحد العملات
    const topCoin = [...data].sort((a, b) => b.priceChangePercent - a.priceChangePercent)[0];
    if (topCoin && prevTopGainerRef.current && topCoin.symbol !== prevTopGainerRef.current.symbol) {
      if (topCoin.priceChangePercent > 10) {
        playAlert('BULLISH');
      }
    }
    prevTopGainerRef.current = topCoin;
  }, [data, soundEnabled, playAlert]);

  // تطبيق التصفية والبحث
  const filteredData = useMemo(() => {
    let result = data;

    // 1. تصفية البحث بالاسم أو الرمز
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      result = result.filter(
        (c) => c.symbol.includes(q) || c.baseAsset.includes(q)
      );
    }

    // 2. تصفية حسب الفلاتر السريعة
    if (activeFilter === 'volume_surge') {
      result = result.filter((c) => c.quoteVolume > 40000000 && Math.abs(c.priceChangePercent) > 4);
    } else if (activeFilter === 'top_gainers') {
      result = [...result].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 30);
    } else if (activeFilter === 'top_losers') {
      result = [...result].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 30);
    } else if (activeFilter === 'funding_negative') {
      result = result.filter((c) => (c.fundingRate || 0) < -0.0001);
    } else if (activeFilter === 'alpha_btc') {
      const btcChange = btcData?.priceChangePercent || 0;
      result = result.filter(
        (c) => calculateBtcRelativeStrength(c.priceChangePercent, btcChange) > 3
      );
    }

    return result;
  }, [data, searchQuery, activeFilter, btcData]);

  return (
    <div className="tradenov-scanner-container px-4 sm:px-8 pb-12">
      {/* Dynamic Top Navigation with Build Date */}
      <TopNav title="TradeNov Scanner (Beta)" />

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
              <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/40 px-2 py-0.5 rounded-full animate-pulse">
                BETA v1.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              ماسح السيولة والزخم اللحظي للسوق الفوري والعقود الآجلة - بث مباشر 60FPS عبر بينانس.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-white/[0.02] p-2 px-3 rounded-xl border border-white/5">
            <span>⏱️ التحديث: بث حي مستمر</span>
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
          onSelectCoin={(coin) => setSelectedCoin(coin)}
          loading={loading}
        />

        {/* Quick Candlestick Mini-Chart Modal */}
        {selectedCoin && (
          <QuickMiniChartModal
            coin={selectedCoin}
            marketType={marketType}
            onClose={() => setSelectedCoin(null)}
          />
        )}
      </div>
    </div>
  );
}
