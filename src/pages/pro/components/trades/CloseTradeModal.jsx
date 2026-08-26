import React, { useState, useEffect } from 'react';
import { XCircle, Target, TrendingUp, TrendingDown, DollarSign, CheckCircle2, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCryptoPrice } from '../../utils/mathEngine';

export default function CloseTradeModal({ trade, onClose, onSave, livePrice }) {
  const { exchanges } = useApp();
  
  const [closingTrade, setClosingTrade] = useState(null);
  const [customCloseQtyStr, setCustomCloseQtyStr] = useState('');
  const [customClosePriceStr, setCustomClosePriceStr] = useState('');
  const [unit, setUnit] = useState('g');
  const [copiedTarget, setCopiedTarget] = useState(null);

  const copyToClipboard = (text, targetId) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(targetId);
    setTimeout(() => setCopiedTarget(null), 1500);
  };

  useEffect(() => {
    if (trade) {
      setClosingTrade(JSON.parse(JSON.stringify(trade)));
    }
  }, [trade]);

  if (!closingTrade) return null;

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

  const getTradeCurrentStats = (tr) => {
    if (!tr) return { currentQuantity: 0, realizedPnlUsd: 0 };
    let currentQuantity = tr.quantity || 0;
    let realizedPnlUsd = 0;
    
    if (tr.targets && Array.isArray(tr.targets)) {
      tr.targets.forEach((tgt) => {
        if (tgt.status === 'EXECUTED') {
          const qty = tgt.quantityToSell || tgt.quantity_to_sell || 0;
          const price = tgt.targetPrice || tgt.target_price || 0;
          currentQuantity -= qty;
          const profit = (price - tr.entry_price) * qty;
          realizedPnlUsd += profit;
        }
      });
    }
    return { 
      currentQuantity: Math.max(0, currentQuantity), 
      realizedPnlUsd 
    };
  };

  const handleToggleTarget = (targetIndex) => {
    const exObj = exchanges.find((ex) => String(ex.id) === String(closingTrade.exchange_id)) || exchanges[0];
    const target = closingTrade.targets[targetIndex];
    const isCurrentlyExecuted = target.status === 'EXECUTED';
    
    const updatedTargets = [...closingTrade.targets];

    if (isCurrentlyExecuted) {
      updatedTargets[targetIndex] = { ...target, status: 'PENDING', executedFee: 0 };
    } else {
      const stats = getTradeCurrentStats(closingTrade);
      const qty = target.quantityToSell || target.quantity_to_sell || 0;
      
      if (stats.currentQuantity <= 0) {
        alert("لا توجد كمية متبقية لتنفيذ هذا الهدف!");
        return;
      }
      
      const feePct = target.type === 'SL' ? (exObj?.taker_fee_pct || 0.1) : (exObj?.maker_fee_pct || 0.1);
      const price = target.targetPrice || target.target_price || 0;
      const executedFee = (qty * price) * (feePct / 100);

      updatedTargets[targetIndex] = { ...target, status: 'EXECUTED', executedFee: executedFee };
    }

    setClosingTrade({ ...closingTrade, targets: updatedTargets });
  };

  const handleCustomClose = (e) => {
    e.preventDefault();
    let qty = parseCommasToNumber(customCloseQtyStr);
    const price = parseCommasToNumber(customClosePriceStr);
    
    if (qty <= 0 || price <= 0) return;

    if (closingTrade.market_type === 'metals' && unit === 'oz') {
      qty = qty * 31.1034768; // Convert oz to grams
    }

    const exObj = exchanges.find((ex) => String(ex.id) === String(closingTrade.exchange_id)) || exchanges[0];
    const feePct = exObj?.taker_fee_pct || 0.1;
    const executedFee = (qty * price) * (feePct / 100);

    const newTarget = {
      stage: 99,
      type: 'MANUAL',
      targetPrice: price,
      quantityToSell: qty,
      status: 'EXECUTED',
      executedFee: executedFee
    };

    const updatedTargets = closingTrade.targets ? [...closingTrade.targets, newTarget] : [newTarget];
    
    setClosingTrade({ ...closingTrade, targets: updatedTargets });
    setCustomCloseQtyStr('');
    setCustomClosePriceStr('');
  };

  const handleSaveCloseModal = () => {
    const stats = getTradeCurrentStats(closingTrade);
    let newStatus = closingTrade.status;
    
    if (stats.currentQuantity <= 0.000001) {
      newStatus = 'CLOSED';
    } else if (stats.currentQuantity < closingTrade.quantity) {
      newStatus = 'PARTIALLY_CLOSED';
    } else {
      newStatus = 'OPEN';
    }

    const finalTrade = { ...closingTrade, status: newStatus };
    onSave(finalTrade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-rose-500/30 space-y-6 my-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              <span>نافذة إغلاق الصفقة #{closingTrade.id} ({closingTrade.symbol})</span>
            </h3>
          </div>
          
          {(() => {
            const stats = getTradeCurrentStats(closingTrade);
            const isProfit = stats.realizedPnlUsd >= 0;
            return (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-gray-400 text-[10px] mb-1 font-sans">الكمية الأساسية</div>
                  <div className="text-white font-bold font-mono text-sm">{fmt(closingTrade.quantity, 4)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center relative">
                  <div className="text-gray-400 text-[10px] mb-1 font-sans">الكمية المتبقية</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-cyan-300 font-bold font-mono text-sm">
                      {closingTrade.market_type === 'metals' && unit === 'oz' 
                        ? fmt(stats.currentQuantity / 31.1034768, 4) 
                        : fmt(stats.currentQuantity, 4)}
                    </span>
                    {closingTrade.market_type === 'metals' && (
                      <span className="text-[10px] text-gray-500">{unit === 'oz' ? 'oz' : 'g'}</span>
                    )}
                  </div>
                  {closingTrade.market_type === 'metals' && (
                    <div className="mt-2 flex bg-black/40 p-0.5 rounded-lg border border-white/5">
                      <button type="button" onClick={() => setUnit('g')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${unit === 'g' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>جرام</button>
                      <button type="button" onClick={() => setUnit('oz')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${unit === 'oz' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>أونصة</button>
                    </div>
                  )}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-gray-400 text-[10px] mb-1 font-sans">الأرباح المحققة (P&L)</div>
                  <div className={`font-bold font-mono text-sm flex justify-center items-center gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isProfit ? '+' : ''}${fmt(stats.realizedPnlUsd, 2)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Existing Targets (TP / SL) */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>الأهداف المبرمجة (TP / SL)</span>
          </h4>
          
          {(!closingTrade.targets || closingTrade.targets.length === 0) ? (
            <div className="text-gray-500 text-xs font-sans text-center py-4 bg-white/5 rounded-xl border border-white/5">
              لا يوجد أهداف مبرمجة لهذه الصفقة
            </div>
          ) : (
            <div className="space-y-2">
              {closingTrade.targets.map((tgt, idx) => {
                const isExecuted = tgt.status === 'EXECUTED';
                const isTp = tgt.type === 'TP';
                const isManual = tgt.type === 'MANUAL';
                const qty = tgt.quantityToSell || tgt.quantity_to_sell || 0;
                const price = tgt.targetPrice || tgt.target_price || 0;
                const expectedProfit = (price - closingTrade.entry_price) * qty;
                const expectedIsProfit = expectedProfit >= 0;

                return (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${
                    isExecuted ? 'bg-white/5 border-white/10 opacity-70' : 
                    isTp ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    isManual ? 'bg-purple-500/10 border-purple-500/20' : 'bg-rose-500/10 border-rose-500/20'
                  }`}>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <span className={`font-bold ${isTp ? 'text-emerald-400' : isManual ? 'text-purple-400' : 'text-rose-400'}`}>
                        {tgt.type} (S{tgt.stage})
                      </span>
                      <span className="text-gray-300 flex items-center gap-1.5">
                        السعر: ${formatCryptoPrice(price)}
                        <button 
                          type="button" 
                          onClick={() => copyToClipboard(price.toString(), `tgt${idx}`)}
                          className="text-gray-500 hover:text-white transition-colors ml-1"
                        >
                          {copiedTarget === `tgt${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </span>
                      <span className="text-gray-300">الكمية: {fmt(qty, 4)}</span>
                      <span className={`font-bold ${expectedIsProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        الربح: {expectedIsProfit ? '+' : ''}${fmt(expectedProfit, 2)}
                      </span>
                      {isExecuted && tgt.executedFee && (
                        <span className="text-gray-500">عمولة: ${fmt(tgt.executedFee, 2)}</span>
                      )}
                    </div>
                    <div>
                      {isExecuted ? (
                        <button
                          onClick={() => handleToggleTarget(idx)}
                          className="px-3 py-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 text-[10px] font-bold flex items-center gap-1.5 transition-all"
                        >
                          <span>تراجع (إلغاء التنفيذ)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleTarget(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isTp ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-rose-500 hover:bg-rose-400 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تنفيذ الهدف</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Manual Close */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
            <span>إغلاق يدوي مخصص (بيع بسعر محدد)</span>
          </h4>
          <form onSubmit={handleCustomClose} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-gray-400 text-xs mb-1 font-sans">الكمية المراد بيعها</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={customCloseQtyStr}
                    onChange={(e) => setCustomCloseQtyStr(formatInputWithCommas(e.target.value))}
                    placeholder="مثال: 5.5"
                    className="w-full p-2.5 rounded-xl glass-input font-mono text-sm text-white pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const stats = getTradeCurrentStats(closingTrade);
                      if (closingTrade.market_type === 'metals' && unit === 'oz') {
                         setCustomCloseQtyStr((stats.currentQuantity / 31.1034768).toString());
                      } else {
                         setCustomCloseQtyStr(stats.currentQuantity.toString());
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors"
                  >
                    الكل
                  </button>
              </div>
            </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-400 text-xs font-sans">سعر البيع ($)</label>
                {livePrice && (
                  <button
                    type="button"
                    onClick={() => setCustomClosePriceStr(livePrice.toString())}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-500/10 hover:bg-cyan-500/20 px-1.5 py-0.5 rounded transition-colors"
                  >
                    سعر السوق
                  </button>
                )}
              </div>
              <input
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={customClosePriceStr}
                onChange={(e) => setCustomClosePriceStr(formatInputWithCommas(e.target.value))}
                placeholder="مثال: 65000"
                className="w-full p-2.5 rounded-xl glass-input font-mono text-sm text-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={!customCloseQtyStr || !customClosePriceStr}
              className="w-full p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs font-sans transition-all"
            >
              تنفيذ الإغلاق المخصص
            </button>
          </form>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans font-bold"
          >
            إلغاء النافذة
          </button>
          <button
            onClick={handleSaveCloseModal}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-extrabold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>حفظ التعديلات في السيرفر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
