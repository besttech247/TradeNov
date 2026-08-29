import React, { useState, useMemo, useEffect } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { SowaidHeader } from './components/SowaidHeader';
import { SowaidStatsBar } from './components/SowaidStatsBar';
import { SowaidConfluenceGrid } from './components/SowaidConfluenceGrid';
import { SowaidTable } from './components/SowaidTable';
import { SowaidDetailModal } from './components/SowaidDetailModal';
import { useMultiExchangeScanner } from '../scanner/hooks/useMultiExchangeScanner';
import { useAudioAlert } from '../scanner/hooks/useAudioAlert';
import { analyzeCoinMultiTf } from './utils/sowaidEngine';
import { SOWAID_DEFAULT_SETTINGS } from './utils/sowaidConstants';
import '../scanner/styles/scanner.css';

export default function SowaidScanner() {
  const [marketType, setMarketType] = useState(SOWAID_DEFAULT_SETTINGS.marketType);
  const [activeFilter, setActiveFilter] = useState(SOWAID_DEFAULT_SETTINGS.activeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [minVolume, setMinVolume] = useState(SOWAID_DEFAULT_SETTINGS.minVolume24h);
  const [soundEnabled, setSoundEnabled] = useState(SOWAID_DEFAULT_SETTINGS.soundEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  // استخدام نفس هوك جلب البيانات من الاسكانر الأول
  const {
    data,
    btcData,
    loading,
    connectionStatus,
    refresh
  } = useMultiExchangeScanner(marketType, ['BINANCE', 'BYBIT', 'DEX'], isPaused);

  const { playAlert } = useAudioAlert();

  // خريطة لتخزين نتائج فحص EWO متعدد الفريمات للعملات
  const [multiTfAnalysisMap, setMultiTfAnalysisMap] = useState({});

  // تصفية العملات
  const filteredData = useMemo(() => {
    let result = data || [];

    // 1. تصفية الحد الأدنى للسيولة
    if (minVolume > 0) {
      result = result.filter((c) => (c.quoteVolume || 0) >= minVolume);
    }

    // 2. البحث بالاسم
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      result = result.filter(
        (c) => c.symbol.toUpperCase().includes(q) || c.baseAsset?.toUpperCase().includes(q)
      );
    }

    // 3. الفلاتر السريعة
    if (activeFilter === 'top_volume') {
      result = [...result].sort((a, b) => b.quoteVolume - a.quoteVolume);
    } else if (activeFilter === 'high_confluence') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis ? analysis.activeSignalsCount >= 2 : c.priceChangePercent > 2;
      });
    } else if (activeFilter === 'daily_active') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis?.tfStatus?.['1d']?.signalValid;
      });
    } else if (activeFilter === 'fast_scalp') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis?.tfStatus?.['9m']?.signalValid || analysis?.tfStatus?.['27m']?.signalValid;
      });
    }

    return result;
  }, [data, searchQuery, activeFilter, minVolume, multiTfAnalysisMap]);

  // استخراج أعلى العملات لتشغيل فحص الفريمات الخمسة عليها في الخلفية
  const topCandidates = useMemo(() => {
    return filteredData.slice(0, 6);
  }, [filteredData]);

  // فحص خلفي ذكي للفريمات الخمسة للعملات الأهم
  useEffect(() => {
    if (isPaused || topCandidates.length === 0) return;

    let isSubscribed = true;

    // فحص العملات الأولى تدريجياً لتجنب إرهاق الـ API
    topCandidates.forEach((coin, idx) => {
      setTimeout(() => {
        if (!isSubscribed) return;
        analyzeCoinMultiTf(coin.symbol, coin.market).then((res) => {
          if (res && isSubscribed) {
            setMultiTfAnalysisMap((prev) => ({
              ...prev,
              [coin.symbol]: res
            }));

            // تنبيه صوتي عند اكتشاف توافق عالي 3+
            if (soundEnabled && res.activeSignalsCount >= 3) {
              playAlert('BULLISH');
            }
          }
        });
      }, idx * 600);
    });

    return () => {
      isSubscribed = false;
    };
  }, [topCandidates, isPaused, soundEnabled, playAlert]);

  // حساب إجمالي الإشارات النشطة
  const activeReboundsCount = useMemo(() => {
    let count = 0;
    Object.values(multiTfAnalysisMap).forEach((item) => {
      if (item && item.activeSignalsCount > 0) {
        count += item.activeSignalsCount;
      }
    });
    return count;
  }, [multiTfAnalysisMap]);

  return (
    <div className="tradenov-scanner-container px-4 sm:px-8 pb-12">
      <TopNav title="SOWAID Scanner v4.0" />

      {/* Header */}
      <SowaidHeader
        marketType={marketType}
        setMarketType={setMarketType}
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
        connectionStatus={connectionStatus}
        onRefresh={refresh}
        loading={loading}
        totalCoinsCount={filteredData.length}
      />

      {/* Stats Bar */}
      <SowaidStatsBar
        totalCoins={filteredData.length}
        btcData={btcData}
        activeReboundsCount={activeReboundsCount}
      />

      {/* Multi-TF Confluence Cards Grid */}
      <SowaidConfluenceGrid
        topCoins={topCandidates}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
      />

      {/* Full Live Scanner Table */}
      <SowaidTable
        coins={filteredData}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
      />

      {/* Full Analysis Modal */}
      {selectedCoin && (
        <SowaidDetailModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}
