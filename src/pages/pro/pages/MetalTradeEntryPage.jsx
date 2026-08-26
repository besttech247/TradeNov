import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { PlusCircle, Activity, Info, Coins, ShieldCheck, Calculator, Globe, Check } from 'lucide-react';
import { formatCryptoPrice, convertArabicNumerals, generateTradeTargets } from '../utils/mathEngine';

export default function MetalTradeEntryPage() {
  const { addTrade, strategies, exchanges, livePrices, t, lang, setActiveScreen, addStrategy, addExchange } = useApp();
  const isRtl = lang === 'ar';

  const [metalType, setMetalType] = useState('XAU'); // XAU (Gold) or XAG (Silver)
  
  const [karat, setKarat] = useState('24');
  const [weight, setWeight] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  
  const [strategyId, setStrategyId] = useState(strategies.filter(s => s.market_type === 'metals')[0]?.id || '');
  const [exchangeId, setExchangeId] = useState(exchanges.filter(e => e.market_type === 'metals')[0]?.id || '');

  // Sync defaults when context data loads asynchronously
  useEffect(() => {
    const metalsEx = exchanges.filter(e => e.market_type === 'metals' || !e.market_type || e.market_type === 'crypto');
    const metalsStrat = strategies.filter(s => s.market_type === 'metals' || !s.market_type || s.market_type === 'crypto');
    
    if (!strategyId && metalsStrat.length > 0) {
      setStrategyId(metalsStrat[0].id);
    }
    if (!exchangeId && metalsEx.length > 0) {
      setExchangeId(metalsEx[0].id);
    }
  }, [exchanges, strategies, strategyId, exchangeId]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showVaultWarning, setShowVaultWarning] = useState(false);
  const [showStrategyWarning, setShowStrategyWarning] = useState(false);
  const [pendingTradeData, setPendingTradeData] = useState(null);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [unitPrice, setUnitPrice] = useState('');
  const [ozQuantity, setOzQuantity] = useState('');
  const [unitPriceType, setUnitPriceType] = useState('g'); // 'g' or 'oz'

  const TROY_OUNCE_TO_GRAM = 31.1034768;

  // Set defaults when metal type changes
  useEffect(() => {
    if (metalType === 'XAU') {
      setKarat('24');
    } else {
      setKarat('999');
    }
  }, [metalType]);

  // Set karat based on metalType
  useEffect(() => {
    if (metalType === 'XAU') {
      setKarat('24');
    } else {
      setKarat('999');
    }
  }, [metalType]);

  const metalsExchanges = exchanges.filter(e => e.market_type === 'metals' || !e.market_type || e.market_type === 'crypto'); // Fallback if none exist
  const metalsStrategies = strategies.filter(s => s.market_type === 'metals' || !s.market_type || s.market_type === 'crypto');

  // Live Price Calculation
  const liveOzPrice = metalType === 'XAU' ? (livePrices['GC=F'] || 2500) : (livePrices['SI=F'] || 28);
  const livePureGramPrice = liveOzPrice / TROY_OUNCE_TO_GRAM;
  
  // Calculate specific karat gram price
  const getKaratMultiplier = (k) => {
    if (metalType === 'XAU') {
      return parseInt(k) / 24;
    } else {
      return parseInt(k) / 999;
    }
  };
  
  const liveKaratGramPrice = livePureGramPrice * getKaratMultiplier(karat);

  const handleUseLivePrice = () => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      setTotalPrice((w * liveKaratGramPrice).toFixed(2));
      setUnitPrice(liveKaratGramPrice.toFixed(2));
    }
  };

  const handleWeightChange = (val) => {
    const parsedVal = convertArabicNumerals(val);
    setWeight(parsedVal);
    const w = parseFloat(parsedVal);
    if (!isNaN(w) && w > 0) {
      setOzQuantity((w / TROY_OUNCE_TO_GRAM).toFixed(4));
    } else {
      setOzQuantity('');
    }
  };

  const handleKaratClick = (k) => {
    setKarat(k);
  };

  const handlePriceChange = (val) => {
    setTotalPrice(convertArabicNumerals(val));
  };

  const handleUnitPriceChange = (val, currentType = unitPriceType) => {
    const parsedVal = convertArabicNumerals(val);
    setUnitPrice(parsedVal);
    const p = parseFloat(parsedVal);
    const w = parseFloat(weight);
    if (!isNaN(p) && p > 0 && !isNaN(w) && w > 0) {
      if (currentType === 'oz') {
        const oz = w / TROY_OUNCE_TO_GRAM;
        setTotalPrice((p * oz).toFixed(2));
      } else {
        setTotalPrice((p * w).toFixed(2));
      }
    }
  };

  const toggleUnitPriceType = (type) => {
    setUnitPriceType(type);
    if (unitPrice) handleUnitPriceChange(unitPrice, type);
  };

  const handleOzChange = (val) => {
    const parsedVal = convertArabicNumerals(val);
    setOzQuantity(parsedVal);
    const oz = parseFloat(parsedVal);
    if (!isNaN(oz) && oz > 0) {
      const g = (oz * TROY_OUNCE_TO_GRAM).toFixed(4);
      setWeight(g);
    } else {
      setWeight('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const w = parseFloat(weight);
      const total = parseFloat(totalPrice);
      
      if (isNaN(w) || w <= 0) throw new Error(isRtl ? 'الوزن غير صحيح' : 'Invalid weight');
      if (isNaN(total) || total <= 0) throw new Error(isRtl ? 'السعر غير صحيح' : 'Invalid total price');

      const pricePerGram = total / w;

      const tradeData = {
        symbol: metalType,
        order_type: 'Market',
        entry_price: pricePerGram,
        amount_usd: total,
        quantity: w,
        metal_karat: parseInt(karat),
        market_type: 'metals',
        calculated_fee: 0,
        targets: []
      };

      if (strategyId) {
        tradeData.strategy_id = parseInt(strategyId);
        const selectedStrategy = strategies.find(s => s.id === parseInt(strategyId));
        if (selectedStrategy && selectedStrategy.tp_levels) {
          tradeData.targets = generateTradeTargets(pricePerGram, w, selectedStrategy);
        }
      }

      if (exchangeId) {
        tradeData.exchange_id = parseInt(exchangeId);
      }

      if (!strategyId && !tradeData.strategy_warning_accepted) {
        setPendingTradeData(tradeData);
        setShowStrategyWarning(true);
        setIsSubmitting(false);
        return;
      }

      if (!exchangeId && !tradeData.vault_warning_accepted) {
        setPendingTradeData(tradeData);
        setShowVaultWarning(true);
        setIsSubmitting(false);
        return;
      }

      await saveFinalTrade(tradeData);
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      setIsSubmitting(false);
    }
  };

  const saveFinalTrade = async (tradeData) => {
    try {
      setIsSubmitting(true);
      await addTrade(tradeData);
      setActiveScreen('metals-inventory');
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
    } finally {
      setIsSubmitting(false);
      setShowVaultWarning(false);
      setShowStrategyWarning(false);
    }
  };

  const handleCreateDummyStrategy = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newStrat = await addStrategy({
        name: isRtl ? "استراتيجية تجريبية (للذهب)" : "Dummy Strategy (Metals)",
        category: "Short-Term",
        market_type: "metals",
        default_order_type: "Limit",
        tp_rules: [{ stage: 1, gain_pct: 5, sell_portion_pct: 100 }],
        sl_rules: [{ stage: 1, loss_pct: 5, sell_portion_pct: 100 }],
        is_active: true
      });
      setStrategyId(newStrat.id);
      
      const updatedPending = { 
        ...pendingTradeData, 
        strategy_id: newStrat.id,
        strategy_warning_accepted: true 
      };
      setPendingTradeData(updatedPending);
      setShowStrategyWarning(false);
      
      if (!exchangeId) {
        setShowVaultWarning(true);
      } else {
        await saveFinalTrade(updatedPending);
      }
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      setShowStrategyWarning(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDummyVault = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newEx = await addExchange({
        name: isRtl ? "مخزن تجريبي (تلقائي)" : "Dummy Vault (Auto)",
        market_type: "metals",
        maker_fee_pct: 0.1,
        taker_fee_pct: 0.1,
        initial_cash_balance: 10000
      });
      setExchangeId(newEx.id);
      
      const updatedPending = { 
        ...pendingTradeData, 
        exchange_id: newEx.id,
        vault_warning_accepted: true 
      };
      setPendingTradeData(updatedPending);
      setShowVaultWarning(false);
      
      await saveFinalTrade(updatedPending);
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      setShowVaultWarning(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goldKarats = ['24', '22', '21', '18'];
  const silverKarats = ['999', '925', '800'];
  const activeKarats = metalType === 'XAU' ? goldKarats : silverKarats;

  const presetWeights = [
    { label: '1g', value: '1' },
    { label: '4g', value: '4' },
    { label: '8g', value: '8' },
    { label: 'Ounce', value: '31.103' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className={`glass-panel p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg ${
        metalType === 'XAU' 
        ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 shadow-amber-500/10'
        : 'border-gray-400/20 bg-gradient-to-r from-gray-400/10 to-slate-400/10 shadow-gray-500/10'
      }`}>
        <div>
          <h1 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${metalType === 'XAU' ? 'text-amber-400' : 'text-gray-200'}`}>
            <PlusCircle className="w-8 h-8" />
            {isRtl ? 'إدخال صفقة معدن جديدة' : 'New Metal Trade'}
          </h1>
          <p className={`text-sm mt-1 font-medium ${metalType === 'XAU' ? 'text-amber-200/60' : 'text-gray-400'}`}>
            {isRtl ? 'إضافة ذهب أو فضة إلى مخزونك' : 'Add gold or silver to your inventory'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Form */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Metal Toggle */}
            <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5 relative z-10">
              <button
                type="button"
                onClick={() => setMetalType('XAU')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  metalType === 'XAU' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-amber-400'
                }`}
              >
                <span>🥇</span> {isRtl ? 'ذهب' : 'Gold'}
              </button>
              <button
                type="button"
                onClick={() => setMetalType('XAG')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  metalType === 'XAG' ? 'bg-gradient-to-r from-gray-300 to-slate-400 text-black shadow-lg shadow-gray-500/20' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>🥈</span> {isRtl ? 'فضة' : 'Silver'}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Karat Selection (Buttons) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? 'العيار (النقاء)' : 'Karat / Purity'}</label>
              <div className="grid grid-cols-4 gap-2">
                {activeKarats.map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKaratClick(k)}
                    className={`py-2 rounded-lg text-sm font-bold transition-all border ${
                      karat === k
                      ? (metalType === 'XAU' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-gray-400/20 border-gray-400/50 text-gray-200')
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {k}{metalType === 'XAU' ? 'K' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? 'الوزن (بالجرام)' : 'Weight (Grams)'}</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 mb-1">
                  {presetWeights.map(pw => (
                    <button
                      key={pw.label}
                      type="button"
                      onClick={() => handleWeightChange(pw.value)}
                      className="flex-1 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      {pw.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="e.g. 10.5"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {isRtl ? 'إجمالي التكلفة (USD)' : 'Total Cost (USD)'}
                </label>
                <button
                  type="button"
                  onClick={handleUseLivePrice}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded"
                >
                  <Calculator className="w-3 h-3" />
                  {isRtl ? 'حساب بالسعر العالمي' : 'Use Spot Price'}
                </button>
              </div>
              <div className="relative">
                <div className={`absolute top-1/2 -translate-y-1/2 text-gray-500 font-bold ${isRtl ? 'right-4' : 'left-4'}`}>$</div>
                <input
                type="text"
                inputMode="decimal"
                value={totalPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-amber-500/50"
                required
              />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer w-fit group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showAdvanced ? 'bg-amber-500 border-amber-500' : 'border-gray-500 bg-white/5 group-hover:border-amber-500/50'}`}>
                  {showAdvanced && <Check className="w-3 h-3 text-black" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={showAdvanced}
                  onChange={() => setShowAdvanced(!showAdvanced)}
                />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                  {isRtl ? 'إدخال متقدم' : 'Advanced Input'}
                </span>
              </label>
              
              {showAdvanced && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-black/20 border border-white/5 shadow-inner">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">{isRtl ? 'الكمية (بالأونصة)' : 'Quantity (Oz)'}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={ozQuantity}
                      onChange={(e) => handleOzChange(e.target.value)}
                      placeholder="e.g. 0.15"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-gray-400">{isRtl ? 'سعر الوحدة' : 'Unit Price'}</label>
                      <div className="flex bg-black/40 p-0.5 rounded border border-white/5">
                        <button type="button" onClick={() => toggleUnitPriceType('g')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${unitPriceType === 'g' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>جرام</button>
                        <button type="button" onClick={() => toggleUnitPriceType('oz')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${unitPriceType === 'oz' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>أونصة</button>
                      </div>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      placeholder="e.g. 80.5"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  {isRtl ? 'الاستراتيجية' : 'Strategy'}
                </label>
                <select
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                  className="input-field w-full"
                >
                  {metalsStrategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  {isRtl ? 'المخزن / المنصة' : 'Vault / Exchange'}
                </label>
                <select
                  value={exchangeId}
                  onChange={(e) => setExchangeId(e.target.value)}
                  className="input-field w-full"
                >
                  {metalsExchanges.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-black font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                metalType === 'XAU' 
                ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' 
                : 'bg-gray-300 hover:bg-white shadow-gray-500/20'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {isRtl ? 'حفظ الصفقة' : 'Save Trade'}
            </button>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className={`w-5 h-5 ${metalType === 'XAU' ? 'text-amber-500' : 'text-gray-300'}`} />
              {isRtl ? 'ملخص الصفقة' : 'Trade Summary'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">{isRtl ? 'المعدن' : 'Metal'}</span>
                <span className={`font-bold ${metalType === 'XAU' ? 'text-amber-400' : 'text-gray-300'}`}>
                  {metalType === 'XAU' ? (isRtl ? 'ذهب' : 'Gold') : (isRtl ? 'فضة' : 'Silver')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">{isRtl ? 'العيار' : 'Karat'}</span>
                <span className="font-bold text-white">{karat}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">{isRtl ? 'سعر الجرام الواحد' : 'Price per Gram'}</span>
                <span className="font-mono text-white">
                  ${(parseFloat(totalPrice) / parseFloat(weight) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 text-sm">{isRtl ? 'الإجمالي' : 'Total'}</span>
                <span className={`text-xl font-mono font-bold ${metalType === 'XAU' ? 'text-amber-400' : 'text-gray-200'}`}>
                  ${parseFloat(totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Global Spot Info */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-3">
               <Globe className={`w-4 h-4 ${metalType === 'XAU' ? 'text-amber-500' : 'text-gray-400'}`} />
               <span className="text-sm font-bold text-gray-300">{isRtl ? 'السعر العالمي المباشر' : 'Live Spot Price'}</span>
             </div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-[10px] text-gray-500 mb-1">{isRtl ? `للجرام (عيار ${karat})` : `Per Gram (${karat}K)`}</div>
                 <div className="text-lg font-mono font-bold text-white">
                   ${liveKaratGramPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-[10px] text-gray-500 mb-1">{isRtl ? 'للأونصة' : 'Per Ounce'}</div>
                 <div className="text-sm font-mono text-gray-400">
                   ${liveOzPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
      {/* Warning Modal for Missing Vault/Exchange */}
      {showVaultWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full shrink-0">
                <Info className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isRtl ? 'لم تقم بإضافة مخزن' : 'No Vault Selected'}
                </h3>
                <p className="text-sm text-gray-300 mb-6">
                  {isRtl
                    ? 'أنت على وشك حفظ الصفقة بدون تحديد مخزن أو تاجر. هل تريد الاستمرار على أي حال؟'
                    : 'You are about to save the trade without specifying a vault or dealer. Do you want to continue anyway?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCreateDummyVault}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      isRtl ? 'إنشاء مخزن تجريبي' : 'Create Dummy Vault'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVaultWarning(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-all flex items-center justify-center"
                  >
                    {isRtl ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for Missing Strategy */}
      {showStrategyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full shrink-0">
                <Info className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isRtl ? 'لم تقم بتحديد استراتيجية' : 'No Strategy Selected'}
                </h3>
                <p className="text-sm text-gray-300 mb-6">
                  {isRtl
                    ? 'لا يمكن فتح صفقة بشكل منظم دون تحديد استراتيجية تحدد أهداف البيع والشراء. هل تريد الاستمرار على أي حال؟'
                    : 'It is not recommended to open a trade without a strategy. Do you want to continue anyway?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCreateDummyStrategy}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      isRtl ? 'إنشاء استراتيجية تجريبية' : 'Create Dummy Strategy'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStrategyWarning(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-all flex items-center justify-center"
                  >
                    {isRtl ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
