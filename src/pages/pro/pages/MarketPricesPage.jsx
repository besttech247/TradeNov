import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Globe, Search, RefreshCw, TrendingUp, TrendingDown, ChevronDown, Coins, Database, Droplet } from 'lucide-react';
import { usePriceFlash } from '../hooks/usePriceFlash';

function CommodityCard({ item }) {
  const isPositive = item.price_change_percentage_24h >= 0;
  const flashClass = usePriceFlash(item.current_price);

  let Icon = Database;
  if (item.name === 'Gold') Icon = Coins;
  if (item.name === 'Crude Oil') Icon = Droplet;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-amber-500/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Icon className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">{item.name}</h3>
          <p className="text-[10px] text-gray-400 font-mono tracking-wider">{item.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-mono font-bold text-white transition-colors ${flashClass}`} dir="ltr">
          ${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
        </p>
        <p className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{item.price_change_percentage_24h.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}



function CoinRow({ coin, index }) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const flashClass = usePriceFlash(coin.current_price);

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="p-4 text-xs text-gray-500 font-mono">
        {coin.market_cap_rank || index + 1}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shadow-lg shadow-purple-500/10" />
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm">{coin.name}</span>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{coin.symbol}</span>
          </div>
        </div>
      </td>
      <td className="p-4 text-right">
        <div className={`font-mono font-bold text-white transition-colors ${flashClass}`} dir="ltr">
          ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </div>
      </td>
      <td className="p-4 text-right">
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
          dir="ltr"
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
        </div>
      </td>
      <td className="p-4 text-right hidden sm:table-cell">
        <div className="text-gray-300 font-mono text-xs" dir="ltr">
          ${coin.total_volume?.toLocaleString()}
        </div>
      </td>
      <td className="p-4 text-right hidden md:table-cell">
        <div className="text-gray-300 font-mono text-xs" dir="ltr">
          ${coin.market_cap?.toLocaleString()}
        </div>
      </td>
    </tr>
  );
}

export default function MarketPricesPage() {
  const { t, lang } = useApp();
  const [coins, setCoins] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resCoins, commData] = await Promise.all([
        api.getMarketOverview(),
        api.getCommoditiesOverview()
      ]);
      
      if (!resCoins.success) {
        throw new Error('Failed to fetch from backend API');
      }
      
      setCoins(resCoins.data || []);
      setCommodities(Array.isArray(commData) ? commData : (commData.data || []));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  
  const visibleCoins = filteredCoins.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const isRtl = lang === 'ar';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400 shrink-0" />
            <span>{t('marketPricesTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('marketPricesDesc')}</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={t('searchCoin')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full p-2.5 rounded-xl glass-input text-sm ${
                isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
              }`}
            />
            <Search className={`w-4 h-4 text-gray-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          Error: {error}
        </div>
      )}

      {/* Traditional Commodities Widgets */}
      {commodities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {commodities.map((item) => (
            <CommodityCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" dir={isRtl ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <th className="p-4">#</th>
                <th className="p-4">{t('colCoin')}</th>
                <th className="p-4 text-right">{t('colPrice')}</th>
                <th className="p-4 text-right">{t('colChange24h')}</th>
                <th className="p-4 text-right hidden sm:table-cell">{t('colVolume')}</th>
                <th className="p-4 text-right hidden md:table-cell">{t('colMarketCap')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && coins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading Market Data...
                  </td>
                </tr>
              ) : visibleCoins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 font-semibold">
                    No coins found matching your search.
                  </td>
                </tr>
              ) : (
                visibleCoins.map((coin, index) => (
                  <CoinRow key={coin.id} coin={coin} index={index} />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {visibleCount < filteredCoins.length && (
          <div className="p-4 border-t border-white/5 flex justify-center bg-white/5">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-sm font-bold transition-all flex items-center gap-2"
            >
              <span>{isRtl ? 'عرض المزيد...' : 'Load More...'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
