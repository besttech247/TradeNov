import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { SowaidHeader } from './components/SowaidHeader';
import { SowaidFavoritesGrid } from './components/SowaidFavoritesGrid';
import { SowaidStatsBar } from './components/SowaidStatsBar';
import { SowaidConfluenceGrid } from './components/SowaidConfluenceGrid';
import { SowaidTable } from './components/SowaidTable';
import { SowaidDetailModal } from './components/SowaidDetailModal';
import { useMultiExchangeScanner } from '../scanner/hooks/useMultiExchangeScanner';
import { useAudioAlert } from '../scanner/hooks/useAudioAlert';
import { analyzeCoinMultiTf } from './utils/sowaidEngine';
import { SOWAID_DEFAULT_SETTINGS } from './utils/sowaidConstants';
import '../scanner/styles/scanner.css';

const FAVORITES_STORAGE_KEY = 'sowaid_scanner_favorites_v4';

export default function SowaidScanner() {
  const [marketType, setMarketType] = useState(SOWAID_DEFAULT_SETTINGS.marketType);
  const [activeFilter, setActiveFilter] = useState(SOWAID_DEFAULT_SETTINGS.activeFilter);
  const [selectedTfFilter, setSelectedTfFilter] = useState(SOWAID_DEFAULT_SETTINGS.selectedTfFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [minVolume, setMinVolume] = useState(SOWAID_DEFAULT_SETTINGS.minVolume24h);
  const [soundEnabled, setSoundEnabled] = useState(SOWAID_DEFAULT_SETTINGS.soundEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(SOWAID_DEFAULT_SETTINGS.autoRefreshInterval);
  const [selectedCoin, setSelectedCoin] = useState(null);

  // حالات طي النوافذ (Collapsible Sections)
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [confluenceCollapsed, setConfluenceCollapsed] = useState(false);
  const [tableCollapsed, setTableCollapsed] = useState(false);

  // قائمة العملات المفضلة المخزنة محلياً
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['BTCUSDT', 'SOLUSDT', 'ETHUSDT'];
    } catch {
      return ['BTCUSDT', 'SOLUSDT', 'ETHUSDT'];
    }
  });

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback((symbol) => {
    setFavorites((prev) => {
      let updated;
      if (prev.includes(symbol)) {
        updated = prev.filter((s) => s !== symbol);
      } else {
        updated = [...prev, symbol];
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // استخدام نفس هوك جلب البيانات الموحد من المنصات مع التحكم في التحديث الهادئ
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

  // مؤقت التحديث الهادئ التلقائي
  useEffect(() => {
    if (refreshInterval <= 0 || isPaused) return;
    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, isPaused, refresh]);

  // تصفية وتجهيز العملات
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

    // 3. فلتر الفريم المخصص (1d, 4h, 81m, 27m, 9m, 3m, 1m)
    if (selectedTfFilter && selectedTfFilter !== 'all') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis?.tfStatus?.[selectedTfFilter]?.signalValid === true;
      });
    }

    // 4. الفلاتر السريعة
    if (activeFilter === 'top_volume') {
      result = [...result].sort((a, b) => b.quoteVolume - a.quoteVolume);
    } else if (activeFilter === 'high_confluence') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis ? analysis.activeSignalsCount >= 2 : c.priceChangePercent > 1.5;
      });
    } else if (activeFilter === 'daily_active') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return analysis?.tfStatus?.['1d']?.signalValid;
      });
    } else if (activeFilter === 'fast_scalp') {
      result = result.filter((c) => {
        const analysis = multiTfAnalysisMap[c.symbol];
        return (
          analysis?.tfStatus?.['1m']?.signalValid ||
          analysis?.tfStatus?.['3m']?.signalValid ||
          analysis?.tfStatus?.['9m']?.signalValid
        );
      });
    }

    return result;
  }, [data, searchQuery, activeFilter, selectedTfFilter, minVolume, multiTfAnalysisMap]);

  // قائمة العملات المفضلة كعناصر بيانات كاملة
  const favoriteCoinsList = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((c) => favoritesSet.has(c.symbol));
  }, [data, favoritesSet]);

  // استخراج أعلى العملات لتشغيل فحص الفريمات الخمسة عليها في الخلفية
  const topCandidates = useMemo(() => {
    return filteredData.slice(0, 6);
  }, [filteredData]);

  // فحص خلفي هادئ وغير مزعج للفريمات السبعة للعملات المهمة والمفضلة
  useEffect(() => {
    if (isPaused) return;

    let isSubscribed = true;
    const coinsToAnalyze = [...new Set([...topCandidates, ...favoriteCoinsList])].slice(0, 12);

    coinsToAnalyze.forEach((coin, idx) => {
      setTimeout(() => {
        if (!isSubscribed) return;
        analyzeCoinMultiTf(coin.symbol, coin.market).then((res) => {
          if (res && isSubscribed) {
            setMultiTfAnalysisMap((prev) => ({
              ...prev,
              [coin.symbol]: res
            }));

            // تنبيه صوتي عند الرغبة فقط
            if (soundEnabled && res.activeSignalsCount >= 4) {
              playAlert('BULLISH');
            }
          }
        });
      }, idx * 750);
    });

    return () => {
      isSubscribed = false;
    };
  }, [topCandidates, favoriteCoinsList, isPaused, soundEnabled, playAlert]);

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
    <div className="tradenov-scanner-container px-4 sm:px-8 pb-16">
      <TopNav title="SOWAID Scanner v4.0" />

      {/* Header with Search, Timeframe Filters, and Refresh Controls */}
      <SowaidHeader
        marketType={marketType}
        setMarketType={setMarketType}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedTfFilter={selectedTfFilter}
        setSelectedTfFilter={setSelectedTfFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        minVolume={minVolume}
        setMinVolume={setMinVolume}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        connectionStatus={connectionStatus}
        onRefresh={refresh}
        loading={loading}
        totalCoinsCount={filteredData.length}
      />

      {/* 1. Pinned / Favorites Section (بطاقات ثابتة للعملات المفضلة قابلة للطي) */}
      <SowaidFavoritesGrid
        favoriteCoins={favoriteCoinsList}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
        onToggleFavorite={toggleFavorite}
        isCollapsed={favoritesCollapsed}
        setIsCollapsed={setFavoritesCollapsed}
      />

      {/* 2. Stats Bar (قابل للطي) */}
      <SowaidStatsBar
        totalCoins={filteredData.length}
        btcData={btcData}
        activeReboundsCount={activeReboundsCount}
        isCollapsed={statsCollapsed}
        setIsCollapsed={setStatsCollapsed}
      />

      {/* 3. Multi-TF Confluence Cards Grid (قابل للطي) */}
      <SowaidConfluenceGrid
        topCoins={topCandidates}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
        favoritesSet={favoritesSet}
        onToggleFavorite={toggleFavorite}
        isCollapsed={confluenceCollapsed}
        setIsCollapsed={setConfluenceCollapsed}
      />

      {/* 4. Full Live Scanner Table (مرتب بحسب الإشارات وقابل للطي) */}
      <SowaidTable
        coins={filteredData}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
        favoritesSet={favoritesSet}
        onToggleFavorite={toggleFavorite}
        isCollapsed={tableCollapsed}
        setIsCollapsed={setTableCollapsed}
      />

      {/* 5. Full Candlestick Chart & EWO Modal */}
      {selectedCoin && (
        <SowaidDetailModal
          coin={selectedCoin}
          isFavorite={favoritesSet.has(selectedCoin.symbol)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}
