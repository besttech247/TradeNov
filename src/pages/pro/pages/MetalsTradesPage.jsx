import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCryptoPrice, parseCommasToNumber, formatInputWithCommas } from '../utils/mathEngine';
import CloseTradeModal from '../components/trades/CloseTradeModal';
import { History, TrendingUp, TrendingDown, Clock, Search, ArrowRight, ArrowLeft, Filter, Wallet, DollarSign, Activity, Edit, XCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function MetalsTradesPage() {
  const { trades, lang, livePrices, updateTrade, deleteTrade, strategies, exchanges, t, fetchData } = useApp();
  const isRtl = lang === 'ar';
  
  const [filterType, setFilterType] = useState('ALL'); // ALL, XAU, XAG
  const [tab, setTab] = useState('OPEN'); // OPEN, CLOSED
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, TODAY, WEEK, MONTH, YEAR
  const [viewMode, setViewMode] = useState('SIMPLE'); // SIMPLE, PRO
  
  const [tradeToClose, setTradeToClose] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [editSymbol, setEditSymbol] = useState('');
  const [editStrategyId, setEditStrategyId] = useState('');
  const [editExchangeId, setEditExchangeId] = useState('');
  const [editEntryPriceStr, setEditEntryPriceStr] = useState('');
  const [editAmountUsdStr, setEditAmountUsdStr] = useState('');
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editStatus, setEditStatus] = useState('OPEN');
  const [editKarat, setEditKarat] = useState('');

  const metalsTrades = trades.filter(t => t.market_type === 'metals');

  const getLivePrice = (symbol) => {
    if (symbol === 'XAU') return livePrices['GC=F'] ? livePrices['GC=F'] / 31.1034768 : 0;
    if (symbol === 'XAG') return livePrices['SI=F'] ? livePrices['SI=F'] / 31.1034768 : 0;
    return 0;
  };

  const filteredTrades = metalsTrades.filter(t => {
    if (tab === 'OPEN' && t.status === 'CLOSED') return false;
    if (tab === 'CLOSED' && t.status !== 'CLOSED') return false;
    if (filterType !== 'ALL' && t.symbol !== filterType) return false;
    
    if (search) {
      const q = search.toLowerCase();
      if (!t.symbol.toLowerCase().includes(q) && !(t.strategy?.name || '').toLowerCase().includes(q)) {
        return false;
      }
    }

    if (dateRange !== 'ALL') {
      const tradeDate = new Date(t.created_at);
      const now = new Date();
      if (dateRange === 'TODAY') {
        if (tradeDate.toDateString() !== now.toDateString()) return false;
      } else if (dateRange === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (tradeDate < weekAgo) return false;
      } else if (dateRange === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (tradeDate < monthAgo) return false;
      } else if (dateRange === 'YEAR') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (tradeDate < yearAgo) return false;
      }
    }

    return true;
  });

  let totalInvested = 0;
  let totalUnrealizedPnL = 0;
  let totalRealizedPnL = 0;

  const getKaratMultiplier = (k, symbol) => {
    if (!k) return 1;
    if (symbol === 'XAU') {
      return parseInt(k) / 24;
    } else {
      return parseInt(k) / 999;
    }
  };

  filteredTrades.forEach(trade => {
    const livePrice = getLivePrice(trade.symbol);
    
    let remainingQty = trade.quantity;
    let realizedProfit = 0;
    
    if (trade.targets && Array.isArray(trade.targets)) {
      trade.targets.forEach(tgt => {
        if (tgt.status === 'EXECUTED') {
          const qtyToSell = tgt.quantityToSell || tgt.quantity_to_sell || 0;
          const targetPrice = tgt.targetPrice || tgt.target_price || 0;
          remainingQty -= qtyToSell;
          realizedProfit += (targetPrice - trade.entry_price) * qtyToSell;
        }
      });
    }
    
    remainingQty = Math.max(0, remainingQty);
    totalRealizedPnL += realizedProfit;

    if (trade.status !== 'CLOSED' && remainingQty > 0) {
        const proportion = remainingQty / trade.quantity;
        const remainingInvested = (trade.amount_usd + trade.calculated_fee) * proportion;
        totalInvested += remainingInvested;
        
        const k = trade.metal_karat || (trade.symbol === 'XAU' ? 24 : 999);
        const multiplier = getKaratMultiplier(k, trade.symbol);
        const pureWeight = remainingQty * multiplier;
        const currentValue = pureWeight * livePrice;
        
        totalUnrealizedPnL += (currentValue - remainingInvested);
    }
  });

  const handleOpenEditModal = (trade) => {
    setEditingTrade(trade);
    setEditSymbol(trade.symbol);
    setEditStrategyId(trade.strategy_id || '');
    setEditExchangeId(trade.exchange_id || '');
    setEditEntryPriceStr(formatInputWithCommas(trade.entry_price));
    setEditAmountUsdStr(formatInputWithCommas(trade.amount_usd));
    setEditQuantityStr(formatInputWithCommas(trade.quantity));
    setEditStatus(trade.status || 'OPEN');
    setEditKarat(trade.metal_karat || '');
    setShowEditModal(true);
  };

  const handleEditEntryPriceChange = (e) => {
    const val = e.target.value;
    setEditEntryPriceStr(formatInputWithCommas(val));
    const price = parseCommasToNumber(val);
    const qty = parseCommasToNumber(editQuantityStr);
    if (price >= 0 && qty >= 0) {
      setEditAmountUsdStr(formatInputWithCommas((price * qty).toFixed(2)));
    }
  };

  const handleEditAmountUsdChange = (e) => {
    const val = e.target.value;
    setEditAmountUsdStr(formatInputWithCommas(val));
    const amt = parseCommasToNumber(val);
    const qty = parseCommasToNumber(editQuantityStr);
    if (amt >= 0 && qty > 0) {
      setEditEntryPriceStr(formatInputWithCommas((amt / qty).toFixed(4)));
    }
  };

  const handleEditQuantityChange = (e) => {
    const val = e.target.value;
    setEditQuantityStr(formatInputWithCommas(val));
    const qty = parseCommasToNumber(val);
    const price = parseCommasToNumber(editEntryPriceStr);
    if (qty >= 0 && price >= 0) {
      setEditAmountUsdStr(formatInputWithCommas((price * qty).toFixed(2)));
    }
  };


  const handleSaveEditedTrade = async (e) => {
    e.preventDefault();
    if (!editingTrade || !editSymbol.trim()) return;

    const entryPrice = parseCommasToNumber(editEntryPriceStr);
    const amountUsd = parseCommasToNumber(editAmountUsdStr);
    const quantity = parseCommasToNumber(editQuantityStr);
    
    const stratObj = strategies.find((s) => String(s.id) === String(editStrategyId));
    const exObj = exchanges.find((ex) => String(ex.id) === String(editExchangeId));

    const updatedTrade = {
      ...editingTrade,
      symbol: editSymbol.toUpperCase(),
      strategy_id: editStrategyId ? parseInt(editStrategyId) : null,
      exchange_id: editExchangeId ? parseInt(editExchangeId) : null,
      entry_price: entryPrice,
      amount_usd: amountUsd,
      quantity: quantity,
      status: editStatus,
      metal_karat: parseInt(editKarat) || null
    };

    try {
      await updateTrade(updatedTrade);
      setShowEditModal(false);
    } catch (err) {
      alert(err.message || 'Error updating trade');
    }
  };

  const handleDeleteTrade = async (id) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure you want to delete this trade?')) return;
    try {
      await deleteTrade(id);
      await fetchData();
      setShowEditModal(false);
    } catch (err) {
      alert(err.message || 'Error deleting trade');
    }
  };

  const handleSaveCloseModal = async (finalTrade) => {
    try {
      await updateTrade(finalTrade);
      setTradeToClose(null);
    } catch (error) {
      console.error("Failed to update trade", error);
      alert(isRtl ? 'فشل حفظ التعديلات' : 'Failed to save changes');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8" />
            {isRtl ? 'سجل الصفقات للمعادن' : 'Metals Trades History'}
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            {isRtl ? 'إدارة صفقات الذهب والفضة مع إحصائيات دقيقة للأرباح والخسائر.' : 'Manage your gold and silver trades with accurate PnL statistics.'}
          </p>
        </div>
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 w-full md:w-auto">
          <button onClick={() => setViewMode('SIMPLE')} className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'SIMPLE' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            {isRtl ? 'مبسط' : 'Simple'}
          </button>
          <button onClick={() => setViewMode('PRO')} className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'PRO' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            {isRtl ? 'احترافي (Pro)' : 'Pro View'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="text-gray-400 font-semibold text-sm">{isRtl ? 'إجمالي المستثمر الفعال' : 'Active Invested'}</div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Wallet className="w-5 h-5" /></div>
          </div>
          <div className="text-2xl font-black text-white relative z-10" dir="ltr">${formatCryptoPrice(totalInvested)}</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all ${totalUnrealizedPnL >= 0 ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="text-gray-400 font-semibold text-sm">{isRtl ? 'الربح العائم' : 'Unrealized PnL'}</div>
            <div className={`p-2 rounded-xl ${totalUnrealizedPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}><Activity className="w-5 h-5" /></div>
          </div>
          <div className={`text-2xl font-black relative z-10 ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
            {totalUnrealizedPnL >= 0 ? '+' : ''}${formatCryptoPrice(totalUnrealizedPnL)}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all ${totalRealizedPnL >= 0 ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="text-gray-400 font-semibold text-sm">{isRtl ? 'الربح المحقق' : 'Realized PnL'}</div>
            <div className={`p-2 rounded-xl ${totalRealizedPnL >= 0 ? 'bg-purple-500/10 text-purple-400' : 'bg-rose-500/10 text-rose-400'}`}><DollarSign className="w-5 h-5" /></div>
          </div>
          <div className={`text-2xl font-black relative z-10 ${totalRealizedPnL >= 0 ? 'text-purple-400' : 'text-rose-400'}`} dir="ltr">
            {totalRealizedPnL >= 0 ? '+' : ''}${formatCryptoPrice(totalRealizedPnL)}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-300 shrink-0 sm:col-span-2 md:col-span-1">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{isRtl ? 'تصفية الصفقات:' : 'Filter Trades:'}</span>
        </div>

        <select value={tab} onChange={(e) => setTab(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold">
          <option value="OPEN" className="bg-gray-900">{isRtl ? 'مفتوحة' : 'Open'}</option>
          <option value="CLOSED" className="bg-gray-900">{isRtl ? 'مغلقة' : 'Closed'}</option>
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold">
          <option value="ALL" className="bg-gray-900">{isRtl ? 'كل المعادن' : 'All Metals'}</option>
          <option value="XAU" className="bg-gray-900">{isRtl ? 'الذهب' : 'Gold'}</option>
          <option value="XAG" className="bg-gray-900">{isRtl ? 'الفضة' : 'Silver'}</option>
        </select>

        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-bold">
          <option value="ALL" className="bg-gray-900">{isRtl ? 'كل الأوقات (All Time)' : 'All Time'}</option>
          <option value="TODAY" className="bg-gray-900">{isRtl ? 'اليوم' : 'Today'}</option>
          <option value="WEEK" className="bg-gray-900">{isRtl ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
          <option value="MONTH" className="bg-gray-900">{isRtl ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
          <option value="YEAR" className="bg-gray-900">{isRtl ? 'هذا العام' : 'This Year'}</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input type="text" placeholder={isRtl ? 'بحث...' : 'Search...'} value={search} onChange={(e) => setSearch(e.target.value)} className={`input-field w-full ${isRtl ? 'pr-9' : 'pl-9'} p-2.5 rounded-xl glass-input`} />
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'المعدن' : 'Metal'}</th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                {viewMode === 'PRO' && <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'الاستراتيجية' : 'Strategy'}</th>}
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'إجمالي الكمية' : 'Total Qty'}</th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'الكمية المتبقية' : 'Remaining'}</th>
                {viewMode === 'PRO' && <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'العيار' : 'Karat'}</th>}
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'سعر الدخول' : 'Entry Price'}</th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'الربح المحقق' : 'Realized PnL'}</th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'الربح العائم' : 'Unrealized PnL'}</th>
                {viewMode === 'PRO' && <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'المستثمر' : 'Invested'}</th>}
                {viewMode === 'PRO' && <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'المنصة' : 'Exchange'}</th>}
                {viewMode === 'PRO' && <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>{isRtl ? 'التاريخ' : 'Date'}</th>}
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-gray-500 font-bold">{isRtl ? 'لا توجد صفقات مطابقة.' : 'No trades match the current filters.'}</td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const livePrice = getLivePrice(trade.symbol);
                  const isGold = trade.symbol === 'XAU';
                  
                  let remainingQty = trade.quantity;
                  let realizedProfit = 0;
                  
                  if (trade.targets && Array.isArray(trade.targets)) {
                    trade.targets.forEach(tgt => {
                      if (tgt.status === 'EXECUTED') {
                        const qtyToSell = tgt.quantityToSell || tgt.quantity_to_sell || 0;
                        const targetPrice = tgt.targetPrice || tgt.target_price || 0;
                        remainingQty -= qtyToSell;
                        realizedProfit += (targetPrice - trade.entry_price) * qtyToSell;
                      }
                    });
                  }
                  
                  remainingQty = Math.max(0, remainingQty);
                  
                  const proportion = remainingQty / trade.quantity;
                  const remainingInvested = (trade.amount_usd + trade.calculated_fee) * proportion;
                  
                  const k = trade.metal_karat || (trade.symbol === 'XAU' ? 24 : 999);
                  const multiplier = getKaratMultiplier(k, trade.symbol);
                  const pureWeight = remainingQty * multiplier;
                  const currentValue = pureWeight * livePrice;
                  
                  const unrealizedPnL = remainingQty > 0 ? (currentValue - remainingInvested) : 0;
                  const isPositiveUnrealized = unrealizedPnL >= 0;
                  const isPositiveRealized = realizedProfit >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                      <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isGold ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}`}>
                            {isGold ? '🥇' : '🥈'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{isGold ? (isRtl ? 'ذهب' : 'Gold') : (isRtl ? 'فضة' : 'Silver')}</div>
                            {viewMode === 'SIMPLE' && <div className="text-[10px] text-gray-500 font-mono">{trade.strategy?.name || 'Manual'}</div>}
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 font-sans ${isRtl ? 'text-right' : ''}`}>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${trade.status === 'OPEN' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : trade.status === 'PARTIALLY_CLOSED' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'}`}>
                          {trade.status || 'OPEN'}
                        </span>
                      </td>
                      {viewMode === 'PRO' && (
                        <td className={`p-4 text-xs font-bold text-cyan-400 ${isRtl ? 'text-right' : ''}`}>
                          {trade.strategy?.name || trade.strategy_name || 'Manual'}
                        </td>
                      )}
                      <td className={`p-4 font-mono text-gray-400 ${isRtl ? 'text-right' : ''}`}>
                        {formatCryptoPrice(trade.quantity)} g
                      </td>
                      <td className={`p-4 font-mono font-bold text-white ${isRtl ? 'text-right' : ''}`}>
                        {formatCryptoPrice(remainingQty)} g
                      </td>
                      {viewMode === 'PRO' && (
                        <td className={`p-4 text-xs font-bold text-gray-300 ${isRtl ? 'text-right' : ''}`}>
                          {trade.metal_karat || (isGold ? '24' : '999')}
                        </td>
                      )}
                      <td className={`p-4 font-mono text-white ${isRtl ? 'text-right' : ''}`}>
                        ${formatCryptoPrice(trade.entry_price)}
                      </td>
                      <td className={`p-4 font-mono font-bold ${isRtl ? 'text-right' : ''} ${isPositiveRealized ? 'text-purple-400' : 'text-rose-400'}`}>
                        {isPositiveRealized ? '+' : ''}${formatCryptoPrice(realizedProfit)}
                      </td>
                      <td className={`p-4 font-mono font-bold ${isRtl ? 'text-right' : ''} ${isPositiveUnrealized ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.status === 'CLOSED' ? '-' : `${isPositiveUnrealized ? '+' : ''}$${formatCryptoPrice(unrealizedPnL)}`}
                      </td>
                      {viewMode === 'PRO' && (
                        <td className={`p-4 font-mono text-gray-300 ${isRtl ? 'text-right' : ''}`}>
                          ${formatCryptoPrice(remainingInvested)}
                        </td>
                      )}
                      {viewMode === 'PRO' && (
                        <td className={`p-4 text-xs text-gray-300 ${isRtl ? 'text-right' : ''}`}>
                          {trade.exchange?.name || trade.exchange_name || '-'}
                        </td>
                      )}
                      {viewMode === 'PRO' && (
                        <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                            <Clock className="w-3 h-3" />
                            {new Date(trade.created_at).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                      )}
                      <td className={`p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center justify-end gap-2`}>
                          <button
                            onClick={() => handleOpenEditModal(trade)}
                            className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-300 transition-all shadow-sm"
                            title="تعديل الصفقة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {trade.status !== 'CLOSED' && (
                            <button
                              onClick={() => setTradeToClose(trade)}
                              className="flex items-center justify-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 transition-all shadow-sm"
                              title="إغلاق الصفقة"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tradeToClose && (
        <CloseTradeModal trade={tradeToClose} onClose={() => setTradeToClose(null)} onSave={handleSaveCloseModal} livePrice={getLivePrice(tradeToClose.symbol)} />
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-4 sm:p-6 rounded-2xl border border-white/20 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>تعديل بيانات الصفقة #{editingTrade?.id}</span>
              </h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditedTrade} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('symbol')}</label>
                  <select value={editSymbol} onChange={(e) => setEditSymbol(e.target.value)} className="w-full p-3 rounded-xl glass-input font-bold text-cyan-300">
                    <option value="XAU" className="bg-gray-900">ذهب (XAU)</option>
                    <option value="XAG" className="bg-gray-900">فضة (XAG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{isRtl ? 'العيار' : 'Karat'}</label>
                  <input type="text" dir="ltr" value={editKarat} onChange={(e) => setEditKarat(e.target.value)} className="w-full p-3 rounded-xl glass-input font-bold text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{isRtl ? 'الاستراتيجية (اختياري)' : 'Strategy (Optional)'}</label>
                  <select value={editStrategyId} onChange={(e) => setEditStrategyId(e.target.value)} className="w-full p-3 rounded-xl glass-input font-bold text-white">
                    <option value="" className="bg-gray-900">{isRtl ? 'بدون استراتيجية' : 'No Strategy'}</option>
                    {strategies.filter(s => s.market_type === 'metals' || s.market_type === 'crypto' || !s.market_type).map(s => (
                      <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{isRtl ? 'المخزن / المنصة (اختياري)' : 'Vault / Exchange (Optional)'}</label>
                  <select value={editExchangeId} onChange={(e) => setEditExchangeId(e.target.value)} className="w-full p-3 rounded-xl glass-input font-bold text-white">
                    <option value="" className="bg-gray-900">{isRtl ? 'بدون مخزن' : 'No Vault'}</option>
                    {exchanges.filter(e => e.market_type === 'metals' || e.market_type === 'crypto' || !e.market_type).map(ex => (
                      <option key={ex.id} value={ex.id} className="bg-gray-900">{ex.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('entryPrice')}</label>
                  <input type="text" inputMode="decimal" dir="ltr" value={editEntryPriceStr} onChange={handleEditEntryPriceChange} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-white text-sm" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('amountUsd')}</label>
                  <input type="text" inputMode="decimal" dir="ltr" value={editAmountUsdStr} onChange={handleEditAmountUsdChange} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-emerald-400 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{isRtl ? 'تعديل الكمية الأساسية (الوزن الكلي بالجرام)' : 'Edit Total Quantity (Weight in g)'}</label>
                <input type="text" inputMode="decimal" dir="ltr" value={editQuantityStr} onChange={handleEditQuantityChange} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-cyan-300 text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('statusLabel')}</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-3 rounded-xl glass-input text-white font-bold">
                  <option value="OPEN" className="bg-gray-900">مفتوحة</option>
                  <option value="PARTIALLY_CLOSED" className="bg-gray-900">مغلقة جزئياً</option>
                  <option value="CLOSED" className="bg-gray-900">مغلقة</option>
                </select>
              </div>
              <div className="flex justify-between items-center gap-3 pt-5 border-t border-white/10 mt-6">
                <div className="flex gap-2">
                  {editingTrade && (
                    <button type="button" onClick={() => handleDeleteTrade(editingTrade.id)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all font-semibold">
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('actionDelete') || 'حذف'}</span>
                    </button>
                  )}
                  {editingTrade && editingTrade.status !== 'CLOSED' && (
                    <button type="button" onClick={() => { setShowEditModal(false); setTradeToClose(editingTrade); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all font-semibold">
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">إغلاق الصفقة</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans font-semibold transition-all">إلغاء</button>
                  <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold font-sans transition-all shadow-lg shadow-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
