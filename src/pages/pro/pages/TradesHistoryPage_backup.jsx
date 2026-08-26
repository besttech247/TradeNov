import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Filter, Edit, CheckCircle2, Trash2, XCircle } from 'lucide-react';
import { calculateTradePurchase, generateTradeTargets } from '../utils/mathEngine';
import CloseTradeModal from '../components/trades/CloseTradeModal';

export default function TradesHistoryPage() {
  const { trades, updateTrade, deleteTrade, fetchData, exchanges, strategies, t } = useApp();

  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Trade Editing Modal State
  const [editingTrade, setEditingTrade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal Form Inputs State
  const [editSymbol, setEditSymbol] = useState('');
  const [editStrategyId, setEditStrategyId] = useState(strategies[0]?.id || 1);
  const [editExchangeId, setEditExchangeId] = useState(exchanges[0]?.id || 1);
  const [editEntryPriceStr, setEditEntryPriceStr] = useState('');
  const [editAmountUsdStr, setEditAmountUsdStr] = useState('');
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editStatus, setEditStatus] = useState('OPEN');

  // Trade Closing Modal State
  const [closingTrade, setClosingTrade] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleOpenCloseModal = (trade) => {
    setClosingTrade(trade);
    setShowCloseModal(true);
  };

  const handleSaveCloseModal = (finalTrade) => {
    updateTrade(finalTrade);
    setShowCloseModal(false);
    setClosingTrade(null);
  };

  const convertArabicToEnglishDigits = (str) => {
    if (str === undefined || str === null) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = String(str);
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    result = result.replace(/٫/g, '.');
    return result;
  };

  const formatInputWithCommas = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const normalized = convertArabicToEnglishDigits(val);
    const clean = normalized.replace(/,/g, '');
    if (isNaN(clean) && clean !== '.') return normalized;
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const parseCommasToNumber = (val) => {
    if (!val) return 0;
    const normalized = convertArabicToEnglishDigits(val);
    const clean = normalized.replace(/,/g, '');
    return parseFloat(clean) || 0;
  };

  const fmt = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const coinsList = Array.from(new Set(trades.map((item) => item.symbol)));
  const exchangesList = Array.from(new Set(trades.map((item) => item.exchange_name)));
  const strategiesList = Array.from(new Set(trades.map((item) => item.strategy_name)));

  const filteredTrades = trades.filter((tr) => {
    const matchCoin = selectedCoin === 'ALL' || tr.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || tr.exchange_name === selectedExchange;
    const matchStrat = selectedStrategy === 'ALL' || tr.strategy_name === selectedStrategy;
    const matchStatus = selectedStatus === 'ALL' || tr.status === selectedStatus;
    return matchCoin && matchEx && matchStrat && matchStatus;
  });

  const handleOpenEditModal = (trade) => {
    setEditingTrade(trade);
    setEditSymbol(trade.symbol);
    setEditStrategyId(trade.strategy_id);
    setEditExchangeId(trade.exchange_id);
    setEditEntryPriceStr(formatInputWithCommas(trade.entry_price));
    setEditAmountUsdStr(formatInputWithCommas(trade.amount_usd));
    setEditQuantityStr(formatInputWithCommas(trade.quantity));
    setEditStatus(trade.status || 'OPEN');
    setShowEditModal(true);
  };

  const handleSaveEditedTrade = (e) => {
    e.preventDefault();
    if (!editingTrade || !editSymbol.trim()) return;

    const entryPrice = parseCommasToNumber(editEntryPriceStr);
    const amountUsd = parseCommasToNumber(editAmountUsdStr);
    const manualQuantity = parseCommasToNumber(editQuantityStr);

    const stratObj = strategies.find((s) => String(s.id) === String(editStrategyId)) || strategies[0];
    const exObj = exchanges.find((ex) => String(ex.id) === String(editExchangeId)) || exchanges[0];

    const purchaseInfo = calculateTradePurchase({ amountUsd, entryPrice, feePct: exObj?.maker_fee_pct || 0.1 });
    const finalQuantity = manualQuantity > 0 ? manualQuantity : purchaseInfo.quantity;
    
    const { tpTargets, slTargets } = generateTradeTargets({
      entryPrice, amountUsd, quantity: finalQuantity, tpRules: stratObj?.tp_rules || [], slRules: stratObj?.sl_rules || []
    });

    const updatedTrade = {
      ...editingTrade,
      symbol: editSymbol.toUpperCase(),
      strategy_id: stratObj.id,
      strategy_name: stratObj.name,
      category: stratObj.category,
      exchange_id: exObj.id,
      exchange_name: exObj.name,
      entry_price: entryPrice,
      amount_usd: amountUsd,
      quantity: finalQuantity,
      calculated_fee: purchaseInfo.feeUsd,
      status: editStatus,
      targets: editingTrade.targets && editingTrade.targets.length > 0 ? editingTrade.targets : [...tpTargets, ...slTargets]
    };

    updateTrade(updatedTrade);
    setShowEditModal(false);
  };

  const handleDeleteTrade = async (id) => {
    if (!window.confirm(t('confirmDelete') || 'هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      await deleteTrade(id);
      await fetchData();
      setShowEditModal(false);
    } catch (err) {
      alert(err.message || 'Error deleting trade');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400 shrink-0" />
            <span>سجل الصفقات الفردية</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">تتبع وإدارة صفقاتك الفردية وتعديل بياناتها.</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-300 shrink-0 sm:col-span-2 md:col-span-1">
          <Filter className="w-4 h-4 text-purple-400 shrink-0" />
          <span>تصفية الصفقات:</span>
        </div>

        <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[130px]">
          <option value="ALL" className="bg-gray-900">الكل</option>
          {coinsList.map((symbol) => (<option key={symbol} value={symbol} className="bg-gray-900">{symbol}</option>))}
        </select>

        <select value={selectedExchange} onChange={(e) => setSelectedExchange(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[140px]">
          <option value="ALL" className="bg-gray-900">الكل</option>
          {exchangesList.map((exName) => (<option key={exName} value={exName} className="bg-gray-900">{exName}</option>))}
        </select>

        <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[150px]">
          <option value="ALL" className="bg-gray-900">الكل</option>
          {strategiesList.map((stName) => (<option key={stName} value={stName} className="bg-gray-900">{stName}</option>))}
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-bold min-w-[160px]">
          <option value="ALL" className="bg-gray-900">الكل</option>
          <option value="OPEN" className="bg-gray-900">مفتوحة</option>
          <option value="PARTIALLY_CLOSED" className="bg-gray-900">مغلقة جزئياً</option>
          <option value="CLOSED" className="bg-gray-900">مغلقة</option>
        </select>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400 shrink-0" />
            <span>سجل الصفقات الفردية</span>
          </h3>
          <span className="text-xs font-mono text-cyan-300">إجمالي الصفقات: {filteredTrades.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-3 md:p-4">الرمز</th>
                <th className="p-3 md:p-4">المنصة</th>
                <th className="p-3 md:p-4">الاستراتيجية</th>
                <th className="p-3 md:p-4">الحالة</th>
                <th className="p-3 md:p-4">سعر الدخول</th>
                <th className="p-3 md:p-4">المبلغ المستثمر</th>
                <th className="p-3 md:p-4">الكمية</th>
                <th className="p-3 md:p-4">العمولة</th>
                <th className="p-3 md:p-4 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {filteredTrades.length === 0 ? (
                <tr><td colSpan="9" className="p-4 sm:p-6 text-center text-gray-500 font-sans">لا يوجد صفقات مسجلة.</td></tr>
              ) : (
                filteredTrades.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 md:p-4 font-bold text-white font-sans">{tr.symbol}</td>
                    <td className="p-3 md:p-4 font-sans text-gray-300">{tr.exchange_name}</td>
                    <td className="p-3 md:p-4 font-sans text-cyan-300">{tr.strategy_name}</td>
                    <td className="p-3 md:p-4 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tr.status === 'OPEN' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : tr.status === 'PARTIALLY_CLOSED' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'}`}>
                        {tr.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-white font-bold" dir="ltr">${fmt(tr.entry_price, 2)}</td>
                    <td className="p-3 md:p-4 text-emerald-400 font-bold" dir="ltr">${fmt(tr.amount_usd, 2)}</td>
                    <td className="p-3 md:p-4 text-gray-200" dir="ltr">{fmt(tr.quantity, 4)}</td>
                    <td className="p-3 md:p-4 text-purple-400 font-bold" dir="ltr">${fmt(tr.calculated_fee, 2)}</td>
                    <td className="p-3 md:p-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tr)}
                          className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-300 transition-all shadow-sm group"
                          title="تعديل الصفقة"
                        >
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleOpenCloseModal(tr)}
                          className="flex items-center justify-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 transition-all shadow-sm group"
                          title="إغلاق الصفقة"
                        >
                          <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-4 sm:p-6 rounded-2xl border border-white/20 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>تعديل بيانات الصفقة #{editingTrade?.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditedTrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('symbol')}</label>
                <input type="text" dir="ltr" value={editSymbol} onChange={(e) => setEditSymbol(e.target.value.toUpperCase())} required className="w-full p-3 rounded-xl glass-input uppercase font-mono font-bold text-cyan-300 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('strategy')}</label>
                  <select value={editStrategyId} onChange={(e) => setEditStrategyId(e.target.value)} className="w-full p-3 rounded-xl glass-input text-white font-bold">
                    {strategies.map((st) => (<option key={st.id} value={st.id} className="bg-gray-900">{st.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('exchange')}</label>
                  <select value={editExchangeId} onChange={(e) => setEditExchangeId(e.target.value)} className="w-full p-3 rounded-xl glass-input text-white font-bold">
                    {exchanges.map((ex) => (<option key={ex.id} value={ex.id} className="bg-gray-900">{ex.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('entryPrice')}</label>
                  <input type="text" inputMode="decimal" dir="ltr" value={editEntryPriceStr} onChange={(e) => setEditEntryPriceStr(formatInputWithCommas(e.target.value))} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-white text-sm" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('amountUsd')}</label>
                  <input type="text" inputMode="decimal" dir="ltr" value={editAmountUsdStr} onChange={(e) => setEditAmountUsdStr(formatInputWithCommas(e.target.value))} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-emerald-400 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">تعديل الكمية يدوياً (الكمية الفعلية)</label>
                <input type="text" inputMode="decimal" dir="ltr" value={editQuantityStr} onChange={(e) => setEditQuantityStr(formatInputWithCommas(e.target.value))} required className="w-full p-3 rounded-xl glass-input font-mono font-bold text-cyan-300 text-sm" />
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
                    <button
                      type="button"
                      onClick={() => handleDeleteTrade(editingTrade.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all font-semibold"
                      title={t('actionDelete') || 'حذف'}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('actionDelete') || 'حذف'}</span>
                    </button>
                  )}
                  {editingTrade && (
                    <button
                      type="button"
                      onClick={() => { setShowEditModal(false); handleOpenCloseModal(editingTrade); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all font-semibold"
                      title="إغلاق الصفقة"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">إغلاق الصفقة</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans font-semibold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold font-sans transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Closing Modal Dialog */}
      {showCloseModal && closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onClose={() => {
            setShowCloseModal(false);
            setClosingTrade(null);
          }}
          onSave={handleSaveCloseModal}
        />
      )}
    </div>
  );
}
