import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateTradeTargets, calculateTradePurchase, formatCryptoPrice } from '../utils/mathEngine';
import { PlusCircle, Zap, Target, ShieldAlert, CheckCircle2, Sparkles, Building2, Copy, Check, Settings2, Search } from 'lucide-react';

export default function TradeEntryPage() {
  const { strategies, exchanges, addTrade, addStrategy, addExchange, livePrices, t, lang, setActiveScreen } = useApp();

  const [symbol, setSymbol] = useState('SOLUSDT');
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showManualQuantity, setShowManualQuantity] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showStrategyWarning, setShowStrategyWarning] = useState(false);
  const [showExchangeWarning, setShowExchangeWarning] = useState(false);
  const [pendingTradeData, setPendingTradeData] = useState(null);
  
  // Selected strategy details
  const currentStrategy = strategies.find((s) => String(s.id) === String(selectedStrategyId));

  // Selected exchange state
  const [selectedExchangeId, setSelectedExchangeId] = useState(currentStrategy?.default_exchange_id || exchanges[0]?.id || '');

  // Sync defaults when context data loads asynchronously
  useEffect(() => {
    if (!selectedStrategyId && strategies.length > 0) {
      setSelectedStrategyId(strategies[0].id);
    }
    if (!selectedExchangeId && exchanges.length > 0) {
      setSelectedExchangeId(currentStrategy?.default_exchange_id || exchanges[0].id);
    }
  }, [strategies, exchanges, selectedStrategyId, selectedExchangeId, currentStrategy]);

  // Formatted Input Strings with Auto Thousand Separators & Digit Normalization
  const [entryPriceStr, setEntryPriceStr] = useState('100');
  const [amountUsdStr, setAmountUsdStr] = useState('1,000');
  const [manualQuantityStr, setManualQuantityStr] = useState('');

  const isRtl = lang === 'ar';

  // Helper: Converts Eastern Arabic digits (٠١٢٣٤٥٦٧٨٩) to English digits (0123456789)
  const convertArabicToEnglishDigits = (str) => {
    if (str === undefined || str === null) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = String(str);
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    // Replace Arabic decimal comma or separator with standard dot
    result = result.replace(/٫/g, '.');
    return result;
  };

  // Format Helper: Normalizes Arabic numerals and adds commas to string input as user types
  const formatInputWithCommas = (val) => {
    if (val === undefined || val === null || val === '') return '';
    
    // First, convert any Eastern Arabic numerals to English digits
    const normalized = convertArabicToEnglishDigits(val);
    
    // Strip existing commas for calculation
    const clean = normalized.replace(/,/g, '');
    if (isNaN(clean) && clean !== '.') return normalized;
    
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Parse Helper: Strips commas to raw float number for math calculations
  const parseCommasToNumber = (val) => {
    if (!val) return 0;
    const normalized = convertArabicToEnglishDigits(val);
    const clean = normalized.replace(/,/g, '');
    return parseFloat(clean) || 0;
  };

  const entryPrice = parseCommasToNumber(entryPriceStr);
  const amountUsd = parseCommasToNumber(amountUsdStr);
  const manualQuantity = parseCommasToNumber(manualQuantityStr);

  const handleQuantityChange = (val) => {
    const formatted = formatInputWithCommas(val);
    setManualQuantityStr(formatted);
    const q = parseCommasToNumber(formatted);
    if (q > 0 && entryPrice > 0) {
      const feeMultiplier = (1 - (currentExchange?.maker_fee_pct || 0) / 100);
      const newAmount = (q * entryPrice) / feeMultiplier;
      setAmountUsdStr(formatInputWithCommas(newAmount.toFixed(2)));
    }
  };

  const copyToClipboard = (text, targetId) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(targetId);
    setTimeout(() => setCopiedTarget(null), 1500);
  };

  const coinOptions = Object.keys(livePrices).filter(k => k.includes(symbol.toUpperCase())).slice(0, 8);

  // Update selected exchange when strategy changes
  useEffect(() => {
    if (currentStrategy?.default_exchange_id) {
      setSelectedExchangeId(currentStrategy.default_exchange_id);
    }
  }, [selectedStrategyId]);

  // Current active exchange object
  const currentExchange = exchanges.find((ex) => String(ex.id) === String(selectedExchangeId));

  // Auto-fetch price if user types a known symbol
  useEffect(() => {
    if (symbol && livePrices[symbol.toUpperCase()]) {
      const fetched = livePrices[symbol.toUpperCase()];
      setEntryPriceStr(formatInputWithCommas(fetched.toString()));
    }
  }, [symbol, livePrices]);

  // Instant calculation of Quantity and Targets based on selected exchange fee
  const purchaseInfo = calculateTradePurchase({
    amountUsd,
    entryPrice,
    feePct: currentExchange?.maker_fee_pct || 0.1
  });
  
  const finalQuantity = manualQuantity > 0 ? manualQuantity : purchaseInfo.quantity;

  const { tpTargets, slTargets } = generateTradeTargets({
    entryPrice,
    amountUsd,
    quantity: finalQuantity,
    tpRules: currentStrategy?.tp_rules || [],
    slRules: currentStrategy?.sl_rules || []
  });

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    if (!symbol || entryPrice <= 0 || amountUsd <= 0) return;

    const newTrade = {
      symbol: symbol.toUpperCase(),
      order_type: currentStrategy?.default_order_type || 'Limit',
      entry_price: entryPrice,
      amount_usd: amountUsd,
      quantity: finalQuantity,
      calculated_fee: purchaseInfo.feeUsd,
      status: 'OPEN',
      targets: [...tpTargets, ...slTargets],
      market_type: 'crypto',
      strategy_id: currentStrategy ? currentStrategy.id : null,
      exchange_id: currentExchange ? currentExchange.id : null
    };

    if (currentStrategy) {
      newTrade.strategy_name = currentStrategy.name;
      newTrade.category = currentStrategy.category;
    }

    if (currentExchange) {
      newTrade.exchange_name = currentExchange.name;
    }

    if (!currentStrategy && !newTrade.strategy_warning_accepted) {
      setPendingTradeData(newTrade);
      setShowStrategyWarning(true);
      return;
    }

    if (!currentExchange && !newTrade.exchange_warning_accepted) {
      setPendingTradeData(newTrade);
      setShowExchangeWarning(true);
      return;
    }

    saveFinalTrade(newTrade);
  };

  const saveFinalTrade = async (tradeData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await addTrade(tradeData);
      setShowStrategyWarning(false);
      setShowExchangeWarning(false);
      setActiveScreen('coin-portfolio');
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDummyStrategy = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newStrat = await addStrategy({
        name: isRtl ? "استراتيجية تجريبية (تلقائية)" : "Dummy Strategy (Auto)",
        category: "Short-Term",
        market_type: "crypto",
        default_order_type: "Limit",
        tp_rules: [{ stage: 1, gain_pct: 5, sell_portion_pct: 100 }],
        sl_rules: [{ stage: 1, loss_pct: 5, sell_portion_pct: 100 }],
        is_active: true
      });
      setSelectedStrategyId(newStrat.id);
      
      const updatedPending = { 
        ...pendingTradeData, 
        strategy_id: newStrat.id,
        strategy_name: newStrat.name,
        category: newStrat.category,
        strategy_warning_accepted: true 
      };
      setPendingTradeData(updatedPending);
      setShowStrategyWarning(false);
      
      if (!currentExchange && !updatedPending.exchange_warning_accepted) {
        setShowExchangeWarning(true);
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

  const handleCreateDummyExchange = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newEx = await addExchange({
        name: isRtl ? "منصة تجريبية (تلقائية)" : "Dummy Exchange (Auto)",
        market_type: "crypto",
        maker_fee_pct: 0.1,
        taker_fee_pct: 0.1,
        initial_cash_balance: 10000
      });
      setSelectedExchangeId(newEx.id);
      
      const updatedPending = { 
        ...pendingTradeData, 
        exchange_id: newEx.id,
        exchange_name: newEx.name,
        exchange_warning_accepted: true 
      };
      setPendingTradeData(updatedPending);
      setShowExchangeWarning(false);
      
      await saveFinalTrade(updatedPending);
    } catch (err) {
      setError(err.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      setShowExchangeWarning(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <span>{t('tradeEntryTitle')}</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">{t('tradeEntryDesc')}</p>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Trade Form & Instant Dynamic Targets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{t('quickInputsTitle')}</span>
          </h3>

          <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
            {/* Symbol Input (Searchable) */}
            <div className="relative">
              <label className="block text-gray-300 mb-1 font-semibold">{t('symbol')}</label>
              <div className="relative flex items-center">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-gray-400 pointer-events-none z-10`} />
                <input
                  type="text"
                  dir="ltr"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value.toUpperCase());
                    setShowSymbolDropdown(true);
                  }}
                  onFocus={() => setShowSymbolDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSymbolDropdown(false), 200)}
                  placeholder="e.g. BTCUSDT, SOLUSDT"
                  required
                  className={`w-full p-3 rounded-xl glass-input uppercase font-mono font-bold text-cyan-300 text-sm tracking-wider ${
                    isRtl ? 'pl-16 pr-10 text-right' : 'pr-16 pl-10 text-left'
                  }`}
                />
                <span
                  className={`absolute ${
                    isRtl ? 'left-3' : 'right-3'
                  } top-3 text-[10px] text-gray-400 font-mono font-bold px-2 py-0.5 rounded bg-white/10 pointer-events-none`}
                >
                  SPOT
                </span>
              </div>
              
              {showSymbolDropdown && coinOptions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden custom-scrollbar">
                  {coinOptions.map(coin => (
                    <button
                      key={coin}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                      onClick={() => {
                        setSymbol(coin);
                        setShowSymbolDropdown(false);
                        const fetched = livePrices[coin];
                        if(fetched) setEntryPriceStr(formatInputWithCommas(fetched.toString()));
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-mono text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex justify-between items-center"
                      dir="ltr"
                    >
                      <span className="font-bold">{coin}</span>
                      <span className="text-gray-500 text-xs">${livePrices[coin]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Strategy Select */}
            <div>
              <label className="block text-gray-300 mb-1 font-semibold">{t('strategy')}</label>
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-white font-semibold text-xs"
              >
                {strategies.map((st) => (
                  <option key={st.id} value={st.id} className="bg-gray-900">
                    {st.name} ({st.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Exchange Select Dropdown */}
            <div>
              <label className="block text-gray-300 mb-1 font-semibold flex items-center justify-between">
                <span>{t('exchange')}</span>
                <span className="text-[10px] text-cyan-400 font-mono">تحديث العمولة تلقائياً</span>
              </label>
              <select
                value={selectedExchangeId}
                onChange={(e) => setSelectedExchangeId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full p-3 rounded-xl glass-input text-white font-bold text-xs"
              >
                {exchanges.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-gray-900">
                    {ex.name} (الكاش المتاح: ${ex.initial_cash_balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Calculated Fee Card based on selected exchange */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-gray-300 font-semibold">{t('appliedFee')}:</span>
              </div>
              <span className="text-cyan-300 font-mono font-bold" dir="ltr">
                ${purchaseInfo.feeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({currentExchange?.maker_fee_pct}%)
              </span>
            </div>

            {/* Price & Amount Inputs with Automatic Eastern Arabic to English Digit Conversion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1 font-semibold flex items-center justify-between">
                  <span>{t('entryPrice')}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">يقبل ٠١٢٣٤٥٦٧٨٩</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  value={entryPriceStr}
                  onChange={(e) => setEntryPriceStr(formatInputWithCommas(e.target.value))}
                  placeholder="e.g. 1,000 / ١٠٠٠"
                  className="w-full p-3 rounded-xl glass-input font-mono font-bold text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold flex items-center justify-between">
                  <span>{t('amountUsd')}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">تحويل آلي للإنجليزي</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  value={amountUsdStr}
                  onChange={(e) => setAmountUsdStr(formatInputWithCommas(e.target.value))}
                  placeholder="e.g. 10,000 / ١٠٠٠٠"
                  className="w-full p-3 rounded-xl glass-input font-mono font-bold text-emerald-400 text-sm"
                  required
                />
              </div>
            </div>

            {/* Manual Quantity Override */}
            <div>
              <button 
                type="button" 
                onClick={() => setShowManualQuantity(!showManualQuantity)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 text-gray-300 font-semibold">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <span>تعديل الكمية يدوياً (اختياري)</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  الكمية الآلية: {purchaseInfo.quantity.toLocaleString()}
                </span>
              </button>
              
              {showManualQuantity && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={manualQuantityStr}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="سيتم حساب المبلغ المستثمر آلياً عند الإدخال"
                    className="w-full p-3 rounded-xl glass-input font-mono font-bold text-cyan-300 text-sm focus:border-cyan-500/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">ملاحظة: إدخال الكمية سيقوم بتحديث حقل "المبلغ المستثمر" فوراً لتتطابق الحسابات.</p>
                </div>
              )}
            </div>

            {/* Calculated Quantity Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/30">
              <span className="text-gray-400 text-[11px] block">{t('calculatedQuantity')}:</span>
              <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block" dir="ltr">
                {finalQuantity.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {symbol.replace('USDT', '')}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 font-sans"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{t('executeTradeBtn')}</span>
            </button>
          </form>
        </div>

        {/* Right Instant Target Auto-Generation Output Panel */}
        <div className="lg:col-span-7 glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('autoTargetsTitle')}</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold animate-pulse shrink-0">
              {t('instantGenerationBadge')}
            </span>
          </div>

          {/* TP Targets Generated Table */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 shrink-0" />
              <span>{t('tpTargetsHeading')}</span>
            </h4>
            <div className="space-y-2">
              {tpTargets.map((tp) => (
                <div key={tp.stage} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2 items-center text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('targetStageLabel')}</span>
                    <span className="text-emerald-400 font-bold">TP{tp.stage} (+{tp.gainPct}%)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('targetPrice')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold" dir="ltr">${formatCryptoPrice(tp.targetPrice)}</span>
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(tp.targetPrice.toString(), `tp${tp.stage}`)}
                        className="text-gray-500 hover:text-emerald-400 transition-colors"
                      >
                        {copiedTarget === `tp${tp.stage}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('quantityToSell')}</span>
                    <span className="text-gray-200" dir="ltr">{tp.quantityToSell.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ({tp.sellPortionPct}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] font-sans">{t('expectedPnl')}</span>
                    <span className="text-emerald-400 font-bold" dir="ltr">+${tp.expectedGainUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SL Targets Generated Table */}
          <div>
            <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('slTargetsHeading')}</span>
            </h4>
            <div className="space-y-2">
              {slTargets.map((sl) => (
                <div key={sl.stage} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2 items-center text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('stopStageLabel')}</span>
                    <span className="text-rose-400 font-bold">SL{sl.stage} (-{sl.lossPct}%)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('targetPrice')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold" dir="ltr">${formatCryptoPrice(sl.targetPrice)}</span>
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(sl.targetPrice.toString(), `sl${sl.stage}`)}
                        className="text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        {copiedTarget === `sl${sl.stage}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-sans">{t('quantityToSell')}</span>
                    <span className="text-gray-200" dir="ltr">{sl.quantityToSell.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ({sl.sellPortionPct}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] font-sans">{t('expectedPnl')}</span>
                    <span className="text-rose-400 font-bold" dir="ltr">-${sl.expectedLossUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Modal for Missing Exchange */}
      {showExchangeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isRtl ? 'لم تقم بتحديد منصة' : 'No Exchange Selected'}
                </h3>
                <p className="text-sm text-gray-300 mb-6">
                  {isRtl
                    ? 'أنت على وشك حفظ الصفقة بدون تحديد منصة تداول. هل تريد الاستمرار على أي حال؟'
                    : 'You are about to save the trade without specifying an exchange. Do you want to continue anyway?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCreateDummyExchange}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      isRtl ? 'إنشاء منصة تجريبية' : 'Create Dummy Exchange'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExchangeWarning(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-all flex items-center justify-center"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
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
                <ShieldAlert className="w-6 h-6 text-amber-400" />
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
                    {isRtl ? 'إلغاء' : 'Cancel'}
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
