import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';
import { api } from '../api/client';
import { calculateCoinPortfolio, calculateOverviewMetrics } from '../utils/mathEngine';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ar');
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  // App Mode & Workspace States
  const [platformMode, setPlatformMode] = useState(() => localStorage.getItem('platform_mode') || 'both'); // 'both', 'crypto_only', 'metals_only'
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const savedMode = localStorage.getItem('platform_mode');
    return savedMode === 'metals_only' ? 'metals' : 'crypto';
  }); // 'crypto' or 'metals'

  const [activeScreen, setActiveScreen] = useState('overview');
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);
  
  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [exchanges, setExchanges] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [trades, setTrades] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const [livePrices, setLivePrices] = useState({});
  const [priceSource, setPriceSource] = useState('Connecting...');
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  
  const { token } = useAuth();
  const isAuthenticated = !!token;
  
  // Fetch initial data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    try {
        const [
          exData,
          stData,
          trData,
          pricesData,
          commoditiesData,
          transactionsData
        ] = await Promise.all([
          api.getExchanges(),
          api.getStrategies(),
          api.getTrades(),
          api.getLivePrices().catch(() => ({})),
          api.getCommoditiesOverview().catch(() => []),
          api.getWalletTransactions().catch((err) => { console.error("Wallet Fetch Error:", err); return []; })
        ]);

        setExchanges(exData);
        setStrategies(stData);
        
        // Merge crypto and commodities prices
        const basePrices = pricesData.prices || {};
        const commoditiesPrices = {};
        if (Array.isArray(commoditiesData)) {
          commoditiesData.forEach(c => { commoditiesPrices[c.id] = c.current_price; });
        }
        setLivePrices({ ...basePrices, ...commoditiesPrices });
        
        setWalletTransactions(transactionsData);
        
        // Enrich trades with strategy and exchange info for mathEngine
        const enrichedTrades = trData.map(tr => {
          const strat = stData.find(s => s.id === tr.strategy_id);
          const ex = exData.find(e => e.id === tr.exchange_id);
          return {
            ...tr,
            strategy_name: strat ? strat.name : 'Unknown',
            category: strat ? strat.category : 'Short-Term',
            exchange_name: ex ? ex.name : 'Unknown'
          };
        });
        setTrades(enrichedTrades);
    } catch (err) {
      console.error("Failed to load initial data from backend:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setExchanges([]);
      setStrategies([]);
      setTrades([]);
      setWalletTransactions([]);
    } else {
      fetchData();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // Sync theme with body element and localStorage
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
  }, [theme]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // Sync platform mode with localStorage
  useEffect(() => {
    localStorage.setItem('platform_mode', platformMode);
    if (platformMode === 'crypto_only' && activeWorkspace !== 'crypto') {
      setActiveWorkspace('crypto');
      setActiveScreen('overview');
    } else if (platformMode === 'metals_only' && activeWorkspace !== 'metals') {
      setActiveWorkspace('metals');
      setActiveScreen('metals-market');
    }
  }, [platformMode, activeWorkspace]);

  // Poll Backend for Binance Live Prices
  useEffect(() => {
    let isMounted = true;
    const updatePrices = async () => {
      setIsFetchingPrices(true);
      try {
        const [pricesData, commoditiesData] = await Promise.all([
          api.getLivePrices().catch(() => ({})),
          api.getCommoditiesOverview().catch(() => [])
        ]);
        
        const basePrices = pricesData.prices || {};
        const commoditiesPrices = {};
        if (Array.isArray(commoditiesData)) {
          commoditiesData.forEach(c => { commoditiesPrices[c.id] = c.current_price; });
        }
        
        setLivePrices(prev => ({ ...prev, ...basePrices, ...commoditiesPrices }));
        setIsFetchingPrices(false);
        setPriceSource(pricesData.source || 'Connecting...');
      } catch (err) {
        if (isMounted) {
          setPriceSource("Offline");
        }
      } finally {
        if (isMounted) setIsFetchingPrices(false);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper translation function
  const t = (key) => {
    return translations[lang]?.[key] || translations['ar']?.[key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // --- CRUD Wrappers ---

  // Add Exchange
  const addExchange = async (exchangeData) => {
    try {
      const newEx = await api.createExchange(exchangeData);
      setExchanges((prev) => [...prev, newEx]);
      return newEx;
    } catch (err) {
      console.error("Failed to create exchange:", err);
      throw err;
    }
  };

  // Update Exchange
  const updateExchange = async (updatedExchange) => {
    try {
      const res = await api.updateExchange(updatedExchange.id, updatedExchange);
      setExchanges((prev) =>
        prev.map((ex) => (String(ex.id) === String(res.id) ? res : ex))
      );
    } catch (err) {
      console.error("Failed to update exchange:", err);
      throw err;
    }
  };

  // Add Strategy
  const addStrategy = async (strategyData) => {
    try {
      const newStrat = await api.createStrategy(strategyData);
      setStrategies((prev) => [...prev, newStrat]);
      return newStrat;
    } catch (err) {
      console.error("Failed to create strategy:", err);
      throw err;
    }
  };

  // Update Strategy
  const updateStrategy = async (updatedStrategy) => {
    try {
      const res = await api.updateStrategy(updatedStrategy.id, updatedStrategy);
      setStrategies((prev) =>
        prev.map((st) => (String(st.id) === String(res.id) ? res : st))
      );
    } catch (err) {
      console.error("Failed to update strategy:", err);
      throw err;
    }
  };

  // Add Trade
  const addTrade = async (tradeData) => {
    try {
      const newTrade = await api.createTrade(tradeData);
      
      // Enrich before adding to state
      const strat = strategies.find(s => s.id === newTrade.strategy_id);
      const ex = exchanges.find(e => e.id === newTrade.exchange_id);
      const enrichedTrade = {
        ...newTrade,
        strategy_name: strat ? strat.name : 'Unknown',
        category: strat ? strat.category : 'Short-Term',
        exchange_name: ex ? ex.name : 'Unknown'
      };

      setTrades((prev) => [enrichedTrade, ...prev]);
    } catch (err) {
      console.error("Failed to create trade:", err);
      throw err;
    }
  };

  // Update Trade
  const updateTrade = async (updatedTrade) => {
    try {
      const res = await api.updateTrade(updatedTrade.id, updatedTrade);
      
      const strat = strategies.find(s => s.id === res.strategy_id);
      const ex = exchanges.find(e => e.id === res.exchange_id);
      const enrichedTrade = {
        ...res,
        strategy_name: strat ? strat.name : 'Unknown',
        category: strat ? strat.category : 'Short-Term',
        exchange_name: ex ? ex.name : 'Unknown'
      };

      setTrades((prev) =>
        prev.map((tr) => (String(tr.id) === String(enrichedTrade.id) ? enrichedTrade : tr))
      );
    } catch (err) {
      console.error("Failed to update trade:", err);
      throw err;
    }
  };

  const deleteExchange = async (id) => {
    await api.deleteExchange(id);
    setExchanges((prev) => prev.filter((ex) => String(ex.id) !== String(id)));
  };

  const deleteStrategy = async (id) => {
    await api.deleteStrategy(id);
    setStrategies((prev) => prev.filter((st) => String(st.id) !== String(id)));
  };

  const deleteTrade = async (id) => {
    await api.deleteTrade(id);
    setTrades((prev) => prev.filter((tr) => String(tr.id) !== String(id)));
  };

  // Derived calculations
  const coinPortfolios = calculateCoinPortfolio({ trades, livePrices });
  const overviewMetrics = calculateOverviewMetrics({ exchanges, coinPortfolios });

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        theme,
        toggleTheme,
        t,
        platformMode,
        setPlatformMode,
        activeWorkspace,
        setActiveWorkspace,
        activeScreen,
        setActiveScreen,
        selectedStrategyId,
        setSelectedStrategyId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        exchanges,
        addExchange,
        updateExchange,
        deleteExchange,
        strategies,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        trades,
        addTrade,
        updateTrade,
        deleteTrade,
        livePrices,
        priceSource,
        isFetchingPrices,
        coinPortfolios,
        overviewMetrics,
        fetchData,
        walletTransactions
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
