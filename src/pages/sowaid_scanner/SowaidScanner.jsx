import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { SowaidHeader } from './components/SowaidHeader';
import { SowaidFavoritesGrid } from './components/SowaidFavoritesGrid';
import { SowaidStatsBar } from './components/SowaidStatsBar';
import { SowaidConfluenceGrid } from './components/SowaidConfluenceGrid';
import { SowaidTable } from './components/SowaidTable';
import { SowaidDetailModal } from './components/SowaidDetailModal';
import { useMultiExchangeScanner } from '../scanner/hooks/useMultiExchangeScanner';
import { useAudioAlert } from '../scanner/hooks/useAudioAlert';
import { analyzeCoinMultiTf, cleanCoinSymbol } from './utils/sowaidEngine';
import { SOWAID_DEFAULT_SETTINGS } from './utils/sowaidConstants';
import '../scanner/styles/scanner.css';

const FAVORITES_STORAGE_KEY = 'sowaid_scanner_favorites_v4';
const USER_DEFAULTS_STORAGE_KEY = 'sowaid_scanner_user_defaults_v4';

export default function SowaidScanner() {
  // قراءة الإعدادات الافتراضية المحفوظة للمستخدم إن وُجدت
  const userDefaults = useMemo(() => {
    try {
      const saved = localStorage.getItem(USER_DEFAULTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SOWAID_DEFAULT_SETTINGS;
    } catch {
      return SOWAID_DEFAULT_SETTINGS;
    }
  }, []);

  const [marketType, setMarketType] = useState(userDefaults.marketType || 'ALL');
  const [activeFilter, setActiveFilter] = useState(userDefaults.activeFilter || 'all');
  const [selectedTfFilters, setSelectedTfFilters] = useState(userDefaults.selectedTfFilters || []);
  const [tfMatchMode, setTfMatchMode] = useState(userDefaults.tfMatchMode || 'OR');
  const [searchQuery, setSearchQuery] = useState('');
  const [minVolume, setMinVolume] = useState(userDefaults.minVolume24h || 100000);
  const [soundEnabled, setSoundEnabled] = useState(userDefaults.soundEnabled || false);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(
    typeof userDefaults.autoRefreshInterval !== 'undefined' ? userDefaults.autoRefreshInterval : 30000
  );
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // حالات طي النوافذ
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [confluenceCollapsed, setConfluenceCollapsed] = useState(false);
  const [tableCollapsed, setTableCollapsed] = useState(false);

  // قائمة العملات المفضلة
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['BTCUSDT', 'SOLUSDT', 'ETHUSDT'];
    } catch {
      return ['BTCUSDT', 'SOLUSDT', 'ETHUSDT'];
    }
  });

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback((rawSymbol) => {
    const symbol = cleanCoinSymbol(rawSymbol);
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

  // حفظ الإعدادات الحالية كافتراضية
  const handleSaveAsDefault = useCallback(() => {
    const currentSettings = {
      marketType,
      activeFilter,
      selectedTfFilters,
      tfMatchMode,
      minVolume24h: minVolume,
      soundEnabled,
      autoRefreshInterval: refreshInterval
    };
    try {
      localStorage.setItem(USER_DEFAULTS_STORAGE_KEY, JSON.stringify(currentSettings));
      setSaveMessage('✅ تم حفظ الإعدادات الحالية كإعدادات افتراضية لك بنجاح!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  }, [marketType, activeFilter, selectedTfFilters, tfMatchMode, minVolume, soundEnabled, refreshInterval]);

  // استعادة الإعدادات الأصلية
  const handleResetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(USER_DEFAULTS_STORAGE_KEY);
      setMarketType(SOWAID_DEFAULT_SETTINGS.marketType);
      setActiveFilter(SOWAID_DEFAULT_SETTINGS.activeFilter);
      setSelectedTfFilters([]);
      setTfMatchMode('OR');
      setMinVolume(SOWAID_DEFAULT_SETTINGS.minVolume24h);
      setSoundEnabled(SOWAID_DEFAULT_SETTINGS.soundEnabled);
      setRefreshInterval(30000);
      setSaveMessage('🔄 تم استعادة الإعدادات الأصلية للمصنع.');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // تبديل فلتر فريم (دعم اختيار عدة فريمات معاً)
  const handleToggleTfFilter = useCallback((tfId) => {
    setSelectedTfFilters((prev) => {
      if (prev.includes(tfId)) {
        return prev.filter((id) => id !== tfId);
      } else {
        return [...prev, tfId];
      }
    });
  }, []);

  const handleClearTfFilters = useCallback(() => {
    setSelectedTfFilters([]);
  }, []);

  // استخدام هوك جلب البيانات مع التحديث الهادئ الصارم
  const {
    data,
    btcData,
    loading,
    connectionStatus,
    refresh
  } = useMultiExchangeScanner(marketType, ['BINANCE', 'BYBIT', 'DEX'], isPaused, refreshInterval);

  const { playAlert } = useAudioAlert();

  // خريطة لتخزين نتائج فحص EWO متعدد الفريمات للعملات
  const [multiTfAnalysisMap, setMultiTfAnalysisMap] = useState({});

  // دمج العملات المكررة في data
  const uniqueMarketData = useMemo(() => {
    const map = new Map();
    (data || []).forEach((c) => {
      const clean = cleanCoinSymbol(c.symbol);
      if (!map.has(clean)) {
        map.set(clean, c);
      } else {
        const existing = map.get(clean);
        if (c.market === 'FUTURES' || (c.quoteVolume || 0) > (existing.quoteVolume || 0)) {
          map.set(clean, c);
        }
      }
    });
    return Array.from(map.values());
  }, [data]);

  // تصفية العملات بدقة
  const filteredData = useMemo(() => {
    let result = uniqueMarketData;

    // 1. تصفية الحد الأدنى للسيولة
    if (minVolume > 0) {
      result = result.filter((c) => (c.quoteVolume || 0) >= minVolume);
    }

    // 2. البحث بالاسم
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      result = result.filter((c) => {
        const clean = cleanCoinSymbol(c.symbol);
        return clean.includes(q) || c.baseAsset?.toUpperCase().includes(q);
      });
    }

    // 3. فلترة الفريمات المتعددة (Multi-select TFs)
    if (selectedTfFilters.length > 0) {
      result = result.filter((c) => {
        const clean = cleanCoinSymbol(c.symbol);
        const analysis = multiTfAnalysisMap[clean];
        if (!analysis || !analysis.tfStatus) return false;

        if (tfMatchMode === 'AND') {
          // يجب أن تتحقق الإشارة على جميع الفريمات المختارة معاً
          return selectedTfFilters.every((tf) => analysis.tfStatus[tf]?.signalValid === true);
        } else {
          // تتحقق الإشارة على أي فريم من الفريمات المختارة
          return selectedTfFilters.some((tf) => analysis.tfStatus[tf]?.signalValid === true);
        }
      });
    }

    // 4. الفلاتر السريعة
    if (activeFilter === 'top_volume') {
      result = [...result].sort((a, b) => b.quoteVolume - a.quoteVolume);
    } else if (activeFilter === 'high_confluence') {
      result = result.filter((c) => {
        const clean = cleanCoinSymbol(c.symbol);
        const analysis = multiTfAnalysisMap[clean];
        return analysis ? analysis.activeSignalsCount >= 2 : false;
      });
    } else if (activeFilter === 'daily_active') {
      result = result.filter((c) => {
        const clean = cleanCoinSymbol(c.symbol);
        const analysis = multiTfAnalysisMap[clean];
        return analysis?.tfStatus?.['1d']?.signalValid;
      });
    } else if (activeFilter === 'fast_scalp') {
      result = result.filter((c) => {
        const clean = cleanCoinSymbol(c.symbol);
        const analysis = multiTfAnalysisMap[clean];
        return (
          analysis?.tfStatus?.['1m']?.signalValid ||
          analysis?.tfStatus?.['3m']?.signalValid ||
          analysis?.tfStatus?.['9m']?.signalValid
        );
      });
    }

    return result;
  }, [uniqueMarketData, searchQuery, activeFilter, selectedTfFilters, tfMatchMode, minVolume, multiTfAnalysisMap]);

  // قائمة العملات المفضلة (بدون تكرار)
  const favoriteCoinsList = useMemo(() => {
    if (!uniqueMarketData || uniqueMarketData.length === 0) return [];
    return uniqueMarketData.filter((c) => favoritesSet.has(cleanCoinSymbol(c.symbol)));
  }, [uniqueMarketData, favoritesSet]);

  // أعلى العملات لعرضها في رادار التوافق
  const topCandidates = useMemo(() => {
    return filteredData.slice(0, 6);
  }, [filteredData]);

  // مؤشر لمنع تكرار الفحص لنفس العملة في نفس الوقت
  const isAnalyzingRef = useRef(false);

  // فحص خلفي هادئ ومستقر للفريمات السبعة للعملات الأساسية والمفضلة
  useEffect(() => {
    if (isPaused || isAnalyzingRef.current) return;

    const coinsToScan = [
      ...favoriteCoinsList,
      ...uniqueMarketData.slice(0, 15)
    ];

    if (coinsToScan.length === 0) return;

    isAnalyzingRef.current = true;
    let isSubscribed = true;

    // فحص العملات على دفعات متباعدة لتجنب أي ضغط
    coinsToScan.forEach((coin, idx) => {
      setTimeout(() => {
        if (!isSubscribed) return;
        const clean = cleanCoinSymbol(coin.symbol);
        analyzeCoinMultiTf(clean).then((res) => {
          if (res && isSubscribed) {
            setMultiTfAnalysisMap((prev) => ({
              ...prev,
              [clean]: res
            }));

            if (soundEnabled && res.activeSignalsCount >= 4) {
              playAlert('BULLISH');
            }
          }
        });
      }, idx * 600);
    });

    const finishTimeout = setTimeout(() => {
      isAnalyzingRef.current = false;
    }, coinsToScan.length * 600 + 1000);

    return () => {
      isSubscribed = false;
      clearTimeout(finishTimeout);
      isAnalyzingRef.current = false;
    };
  }, [data?.length, isPaused, soundEnabled, playAlert]);

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

      {/* Header */}
      <SowaidHeader
        marketType={marketType}
        setMarketType={setMarketType}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedTfFilters={selectedTfFilters}
        onToggleTfFilter={handleToggleTfFilter}
        onClearTfFilters={handleClearTfFilters}
        tfMatchMode={tfMatchMode}
        setTfMatchMode={setTfMatchMode}
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
        onSaveAsDefault={handleSaveAsDefault}
        onResetToDefault={handleResetToDefault}
        saveMessage={saveMessage}
        totalCoinsCount={filteredData.length}
      />

      {/* 1. Pinned Favorites Section */}
      <SowaidFavoritesGrid
        favoriteCoins={favoriteCoinsList}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
        onToggleFavorite={toggleFavorite}
        isCollapsed={favoritesCollapsed}
        setIsCollapsed={setFavoritesCollapsed}
      />

      {/* 2. Stats Bar */}
      <SowaidStatsBar
        totalCoins={filteredData.length}
        btcData={btcData}
        activeReboundsCount={activeReboundsCount}
        isCollapsed={statsCollapsed}
        setIsCollapsed={setStatsCollapsed}
      />

      {/* 3. Multi-TF Confluence Cards Grid */}
      <SowaidConfluenceGrid
        topCoins={topCandidates}
        multiTfAnalysisMap={multiTfAnalysisMap}
        onSelectCoin={setSelectedCoin}
        favoritesSet={favoritesSet}
        onToggleFavorite={toggleFavorite}
        isCollapsed={confluenceCollapsed}
        setIsCollapsed={setConfluenceCollapsed}
      />

      {/* 4. Full Live Scanner Table */}
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
          isFavorite={favoritesSet.has(cleanCoinSymbol(selectedCoin.symbol))}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}
