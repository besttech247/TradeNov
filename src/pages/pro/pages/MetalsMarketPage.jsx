import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Globe, TrendingUp, TrendingDown, Coins, Activity, RefreshCw } from 'lucide-react';

function KaratRow({ name, price, unit, highlight }) {
  return (
    <div className={`flex justify-between items-center py-2 border-b last:border-0 ${highlight ? 'border-amber-500/20 bg-amber-500/5 -mx-4 px-4 rounded-lg' : 'border-white/5'}`}>
      <span className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-gray-300'}`}>{name}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-gray-500">{unit}</span>
      </span>
    </div>
  );
}

export default function MetalsMarketPage() {
  const { lang } = useApp();
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const commData = await api.getCommoditiesOverview();
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
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const isRtl = lang === 'ar';

  // Find Gold and Silver
  const goldData = commodities.find(c => c.id === 'GC=F') || { current_price: 0, price_change_percentage_24h: 0 };
  const silverData = commodities.find(c => c.id === 'SI=F') || { current_price: 0, price_change_percentage_24h: 0 };

  const TROY_OUNCE_TO_GRAM = 31.1034768;

  // Gold Calculations
  const goldOz = goldData.current_price;
  const gold24k = goldOz / TROY_OUNCE_TO_GRAM;
  const gold22k = gold24k * (22 / 24);
  const gold21k = gold24k * (21 / 24);
  const gold18k = gold24k * (18 / 24);
  const goldCoin = gold21k * 8;
  const isGoldPositive = goldData.price_change_percentage_24h >= 0;

  // Silver Calculations
  const silverOz = silverData.current_price;
  const silver999 = silverOz / TROY_OUNCE_TO_GRAM;
  const silver925 = silver999 * (925 / 999);
  const silver800 = silver999 * (800 / 999);
  const isSilverPositive = silverData.price_change_percentage_24h >= 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <div>
          <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8" />
            {isRtl ? 'سوق المعادن الثمينة' : 'Precious Metals Market'}
          </h1>
          <p className="text-sm text-amber-200/60 mt-1 font-medium">
            {isRtl ? 'أسعار الذهب والفضة الحية وتحليل العيارات' : 'Live Gold & Silver prices and karat analysis'}
          </p>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {isRtl ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {loading && commodities.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gold Widget */}
          <div className="glass-panel rounded-2xl border border-amber-500/20 overflow-hidden shadow-lg shadow-amber-500/5">
            <div className="bg-amber-500/10 p-5 flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">🥇 {isRtl ? 'الذهب' : 'Gold'}</h2>
                  <p className="text-xs text-amber-400/80 font-mono">XAU/USD</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono font-bold text-white">
                  ${goldOz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${isGoldPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isGoldPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isGoldPositive ? '+' : ''}{goldData.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                {isRtl ? 'سعر الجرام حسب العيار' : 'Price per Gram by Karat'}
              </h3>
              <KaratRow name={isRtl ? 'عيار 24 (صافي)' : '24K (Pure)'} price={gold24k} unit="USD / g" />
              <KaratRow name={isRtl ? 'عيار 22' : '22K'} price={gold22k} unit="USD / g" />
              <KaratRow name={isRtl ? 'عيار 21' : '21K'} price={gold21k} unit="USD / g" />
              <KaratRow name={isRtl ? 'عيار 18' : '18K'} price={gold18k} unit="USD / g" />
              <div className="pt-2 border-t border-white/5 mt-2">
                <KaratRow name={isRtl ? 'الجنيه الذهب (8ج عيار 21)' : 'Gold Coin (8g 21K)'} price={goldCoin} unit="USD" highlight />
              </div>
            </div>
          </div>

          {/* Silver Widget */}
          <div className="glass-panel rounded-2xl border border-gray-400/20 overflow-hidden shadow-lg shadow-gray-500/5">
            <div className="bg-gray-400/10 p-5 flex items-center justify-between border-b border-gray-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center border border-gray-400/40">
                  <Activity className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">🥈 {isRtl ? 'الفضة' : 'Silver'}</h2>
                  <p className="text-xs text-gray-400/80 font-mono">XAG/USD</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono font-bold text-white">
                  ${silverOz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                </div>
                <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${isSilverPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isSilverPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isSilverPositive ? '+' : ''}{silverData.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                {isRtl ? 'سعر الجرام حسب العيار' : 'Price per Purity'}
              </h3>
              <KaratRow name={isRtl ? '999 (صافي)' : '999 (Pure)'} price={silver999} unit="USD / g" />
              <KaratRow name={isRtl ? '925 (استرليني)' : '925 (Sterling)'} price={silver925} unit="USD / g" />
              <KaratRow name={isRtl ? '800' : '800'} price={silver800} unit="USD / g" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
