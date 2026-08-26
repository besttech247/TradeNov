import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Database, TrendingUp, TrendingDown, Coins, ArrowUpRight, Gem, Table, Scale } from 'lucide-react';

export default function MetalsInventoryPage() {
  const { trades, lang, livePrices, setActiveScreen } = useApp();
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState('XAU'); // 'XAU' or 'XAG'
  const [topDisplayUnit, setTopDisplayUnit] = useState('oz'); // 'g' or 'oz'
  const [topDisplayKarat, setTopDisplayKarat] = useState('24'); // '24' or '21'
  const [tableDisplayUnit, setTableDisplayUnit] = useState('g'); // 'g' or 'oz'

  // Filter metals trades for the selected metal
  const metalsTrades = trades.filter(t => t.market_type === 'metals' && t.status !== 'CLOSED' && t.symbol === activeTab);

  const TROY_OUNCE_TO_GRAM = 31.1034768;
  const liveGoldPriceOz = livePrices['GC=F'] || 2500;
  const liveSilverPriceOz = livePrices['SI=F'] || 28;
  const liveGoldPriceGram = liveGoldPriceOz / TROY_OUNCE_TO_GRAM;
  const liveSilverPriceGram = liveSilverPriceOz / TROY_OUNCE_TO_GRAM;

  const livePureGramPrice = activeTab === 'XAU' ? liveGoldPriceGram : liveSilverPriceGram;

  const getKaratMultiplier = (k) => {
    if (!k) return 1;
    if (activeTab === 'XAU') {
      return parseInt(k) / 24;
    } else {
      return parseInt(k) / 999;
    }
  };

  // Aggregate Data
  const aggregatedData = useMemo(() => {
    let totalPureGrams = 0;
    let totalInvested = 0;
    const karatMap = {};

    metalsTrades.forEach(t => {
      let remainingQty = t.quantity;
      if (t.targets && Array.isArray(t.targets)) {
        t.targets.forEach(tgt => {
          if (tgt.status === 'EXECUTED') {
            const qtyToSell = tgt.quantityToSell || tgt.quantity_to_sell || 0;
            remainingQty -= qtyToSell;
          }
        });
      }
      remainingQty = Math.max(0, remainingQty);

      if (remainingQty === 0) return;

      const proportion = remainingQty / t.quantity;
      const cost = (t.amount_usd + t.calculated_fee) * proportion;

      const k = t.metal_karat || (activeTab === 'XAU' ? 24 : 999);
      const multiplier = getKaratMultiplier(k);
      const pureWeight = remainingQty * multiplier;

      totalPureGrams += pureWeight;
      totalInvested += cost;

      if (!karatMap[k]) {
        karatMap[k] = {
          karat: k,
          actualGrams: 0,
          pureGrams: 0,
          totalCost: 0
        };
      }
      karatMap[k].actualGrams += remainingQty;
      karatMap[k].pureGrams += pureWeight;
      karatMap[k].totalCost += cost;
    });

    const currentValue = totalPureGrams * livePureGramPrice;
    const pnl = currentValue - totalInvested;
    const breakEven = totalPureGrams > 0 ? totalInvested / totalPureGrams : 0;

    return {
      totalPureGrams,
      totalInvested,
      currentValue,
      pnl,
      breakEven,
      karats: Object.values(karatMap).sort((a, b) => b.karat - a.karat)
    };
  }, [metalsTrades, activeTab, livePureGramPrice]);

  const { totalPureGrams, totalInvested, currentValue, pnl, karats } = aggregatedData;
  const isPositive = pnl >= 0;

  // Top Cards formatting helpers
  const topUnitMultiplier = (topDisplayUnit === 'oz' && topDisplayKarat !== 'sovereign') ? (1 / TROY_OUNCE_TO_GRAM) : 1;
  const topUnitLabel = topDisplayKarat === 'sovereign' ? (isRtl ? 'جنيه' : 'Sovereigns') : (topDisplayUnit === 'oz' ? (isRtl ? 'أونصة' : 'oz') : 'g');
  
  const topEquivalentGrams = (activeTab === 'XAU' && (topDisplayKarat === '21' || topDisplayKarat === 'sovereign')) 
    ? totalPureGrams * (24 / 21) 
    : totalPureGrams;

  const topDisplayTotalPure = topDisplayKarat === 'sovereign'
    ? (topEquivalentGrams / 8)
    : (topEquivalentGrams * topUnitMultiplier);

  const topDisplayBreakEven = topDisplayTotalPure > 0 ? totalInvested / topDisplayTotalPure : 0;

  // Table formatting helpers
  const tableUnitMultiplier = tableDisplayUnit === 'oz' ? (1 / TROY_OUNCE_TO_GRAM) : 1;
  const tableUnitLabel = tableDisplayUnit === 'oz' ? (isRtl ? 'أونصة' : 'oz') : 'g';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <div>
          <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8" />
            {isRtl ? 'مخزن الذهب والمقتنيات 🏦' : 'Gold Vault 🏦'}
          </h1>
          <p className="text-sm text-amber-200/60 mt-1 font-medium">
            {isRtl ? 'نظرة تفصيلية على إجمالي مقتنياتك من السبائك والعملات وقيمتها الحالية.' : 'Detailed summary of your gold and silver holdings.'}
          </p>
        </div>
        <button
          onClick={() => setActiveScreen('metals-trades')}
          className="px-6 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
        >
          {isRtl ? 'تفاصيل الصفقات' : 'View Trades'}
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Toggles Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Metal Toggle Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl w-full sm:max-w-md border border-white/5">
          <button
            onClick={() => setActiveTab('XAU')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'XAU' 
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-lg border border-amber-500/30' 
              : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Coins className="w-5 h-5" />
            {isRtl ? 'مخزن الذهب' : 'Gold Inventory'}
          </button>
          <button
            onClick={() => setActiveTab('XAG')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'XAG' 
              ? 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 text-gray-200 shadow-lg border border-gray-400/30' 
              : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Gem className="w-5 h-5" />
            {isRtl ? 'مخزن الفضة' : 'Silver Inventory'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
          {/* Top Karat Toggle Tab (Gold Only) */}
          {activeTab === 'XAU' && (
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 flex-1 sm:flex-none">
              <button
                onClick={() => setTopDisplayKarat('24')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                  topDisplayKarat === '24' 
                  ? 'bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isRtl ? 'عيار 24' : '24K'}
              </button>
              <button
                onClick={() => setTopDisplayKarat('21')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                  topDisplayKarat === '21' 
                  ? 'bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isRtl ? 'عيار 21' : '21K'}
              </button>
              <button
                onClick={() => setTopDisplayKarat('sovereign')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                  topDisplayKarat === 'sovereign' 
                  ? 'bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isRtl ? 'جنيه 21' : 'Sovereign 21'}
              </button>
            </div>
          )}

          {/* Top Unit Toggle Tab (Hidden if Sovereign) */}
          {topDisplayKarat !== 'sovereign' && (
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 flex-1 sm:flex-none">
              <button
              onClick={() => setTopDisplayUnit('g')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                topDisplayUnit === 'g' 
                ? 'bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Scale className="w-4 h-4" />
              {isRtl ? 'جرام' : 'Grams'}
            </button>
            <button
              onClick={() => setTopDisplayUnit('oz')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                topDisplayUnit === 'oz' 
                ? 'bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Scale className="w-4 h-4" />
              {isRtl ? 'أونصة' : 'Ounces'}
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Main Stats (Aggregated) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors col-span-1">
          <div className="text-gray-400 font-medium text-sm mb-2">
            {activeTab === 'XAU' ? (isRtl ? `إجمالي الذهب (عيار ${topDisplayKarat})` : `Net Gold (${topDisplayKarat}K)`) : (isRtl ? 'صافي الفضة (999)' : 'Net Pure Silver (999)')}
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {topDisplayTotalPure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} <span className="text-sm font-sans font-normal text-gray-500">{topUnitLabel}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors col-span-1">
          <div className="text-gray-400 font-medium text-sm mb-2">{isRtl ? 'إجمالي التكلفة' : 'Total Invested'}</div>
          <div className="text-2xl font-mono font-bold text-white">
            ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors col-span-1">
          <div className="text-gray-400 font-medium text-sm mb-2 flex items-center justify-between">
            <span>{isRtl ? 'متوسط سعر التعادل' : 'Avg Break-Even'}</span>
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400">
            ${topDisplayBreakEven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-sm text-gray-500 ml-1 font-sans font-normal">/{topUnitLabel}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors col-span-1">
          <div className="text-gray-400 font-medium text-sm mb-2">{isRtl ? 'القيمة الحالية' : 'Current Value'}</div>
          <div className="text-2xl font-mono font-bold text-white">
            ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`glass-panel p-6 rounded-2xl border transition-colors col-span-1 md:col-span-1 ${isPositive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
          <div className="text-gray-400 font-medium text-sm mb-2 flex items-center justify-between">
            {isRtl ? 'صافي الربح / الخسارة' : 'Net PnL'}
            {isPositive ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
          </div>
          <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-sm px-2 py-1 rounded bg-black/20">
              {totalInvested > 0 ? ((pnl / totalInvested) * 100).toFixed(2) : '0.00'}%
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden mt-8">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
          <div className="flex items-center gap-3">
            <Table className={`w-5 h-5 ${activeTab === 'XAU' ? 'text-amber-400' : 'text-gray-300'}`} />
            <h2 className="text-lg font-bold text-white">
              {isRtl ? 'تفصيل المخزون حسب العيار' : 'Inventory Breakdown by Karat'}
            </h2>
          </div>
          
          {/* Table Unit Toggle Tab */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => setTableDisplayUnit('g')}
              className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                tableDisplayUnit === 'g' 
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/30' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Scale className="w-3 h-3" />
              {isRtl ? 'الجدول بالجرام' : 'Table in Grams'}
            </button>
            <button
              onClick={() => setTableDisplayUnit('oz')}
              className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                tableDisplayUnit === 'oz' 
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/30' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Scale className="w-3 h-3" />
              {isRtl ? 'الجدول بالأونصة' : 'Table in Ounces'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'العيار' : 'Karat'}</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الوزن الفعلي' : 'Actual Weight'} ({tableUnitLabel})</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? (activeTab === 'XAU' ? 'الوزن الصافي (عيار 24)' : 'الوزن الصافي (عيار 999)') : (activeTab === 'XAU' ? 'Net Weight (24K)' : 'Net Weight (999)')} ({tableUnitLabel})</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'إجمالي التكلفة' : 'Total Cost'}</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'سعر التعادل' : 'Break-Even'}/{tableUnitLabel}</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'القيمة الحالية' : 'Current Value'}</th>
                <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الربح/الخسارة' : 'PnL'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {karats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    {isRtl ? 'لا يوجد صفقات مسجلة لهذا المعدن' : 'No trades recorded for this metal'}
                  </td>
                </tr>
              ) : (
                karats.map((k, idx) => {
                  const karatCurrentValue = k.pureGrams * livePureGramPrice;
                  const karatPnL = karatCurrentValue - k.totalCost;
                  const karatIsPositive = karatPnL >= 0;
                  
                  const displayActual = k.actualGrams * tableUnitMultiplier;
                  const displayPure = k.pureGrams * tableUnitMultiplier;
                  const karatBreakEven = displayActual > 0 ? k.totalCost / displayActual : 0;
                  
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className={`p-4 font-bold ${activeTab === 'XAU' ? 'text-amber-400' : 'text-gray-300'} ${isRtl ? 'text-right' : 'text-left'}`}>
                        {activeTab === 'XAU' ? `${k.karat}K` : k.karat}
                      </td>
                      <td className={`p-4 font-mono text-sm text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {displayActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                      </td>
                      <td className={`p-4 font-mono text-sm text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {displayPure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                      </td>
                      <td className={`p-4 font-mono text-sm text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                        ${k.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 font-mono text-sm text-cyan-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                        ${karatBreakEven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 font-mono text-sm text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                        ${karatCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 font-mono text-sm font-bold ${karatIsPositive ? 'text-emerald-400' : 'text-rose-400'} ${isRtl ? 'text-right' : 'text-left'}`}>
                        {karatIsPositive ? '+' : ''}${karatPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
