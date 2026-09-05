import React, { useState } from 'react';

export function RadarConfluenceGrid({
  confluenceItems = [],
  onSelectSymbol,
  selectedSymbol
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  if (!confluenceItems || confluenceItems.length === 0) {
    return null;
  }

  const formatNum = (val, decimals = 4) => {
    if (val === undefined || val === null || isNaN(val)) return '--';
    if (Math.abs(val) >= 1000) return Number(val).toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (Math.abs(val) < 0.0001) return Number(val).toFixed(6);
    return Number(val).toFixed(decimals);
  };

  const formatCVD = (val) => {
    if (val === undefined || val === null || isNaN(val) || Math.abs(val) < 0.01) return '$0';
    const sign = val > 0 ? '+' : '-';
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return `${sign}$${(absVal / 1000000).toFixed(2)}M`;
    if (absVal >= 1000) return `${sign}$${(absVal / 1000).toFixed(1)}K`;
    return `${sign}$${absVal.toFixed(0)}`;
  };

  return (
    <div className="bg-gradient-to-b from-amber-500/10 via-background-light/30 to-background-light/40 border border-amber-500/30 p-4 sm:p-5 rounded-2xl backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col gap-3">
      {/* Header with View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                رادار التوافق المشترك بين المنصات (Cross-Exchange High Confluence)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                تأكيد حقيقي (Binance + Bybit)
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden sm:block">
              العملات التي تحظى بإشارة شرائية قوية (LONG) وسيولة متزامنة على أكثر من منصة معاً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'cards' ? 'bg-amber-500 text-black shadow' : 'text-text-muted hover:text-white'
              }`}
            >
              بطاقات مضيئة
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'table' ? 'bg-amber-500 text-black shadow' : 'text-text-muted hover:text-white'
              }`}
            >
              جدول المقارنة
            </button>
          </div>

          <span className="text-xs font-mono text-amber-300 font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
            {confluenceItems.length} فرص مؤكدة
          </span>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {confluenceItems.map((item) => {
            const isSelected = selectedSymbol === item.symbol;
            const isStrong = item.score >= 78;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-md border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)] -translate-y-1'
                    : 'bg-black/50 border-white/10 hover:border-amber-500/50 hover:-translate-y-0.5'
                }`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500"></div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-sm font-black font-mono text-white">{item.symbol}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LONG 🟢
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between font-mono text-xs">
                  <span className="text-white/90 font-bold">${formatNum(item.price)}</span>
                  <span className={`font-bold ${item.change_5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change_5m >= 0 ? '+' : ''}{item.change_5m.toFixed(2)}%
                  </span>
                </div>

                {/* Real Cross-Exchange Scores */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400">🟡 Binance: <strong>{item.binanceScore}</strong></span>
                    <span className="text-cyan-400">🔵 Bybit: <strong>{item.bybitScore}</strong></span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-text-muted">CVD:</span>
                    <span className="font-bold text-emerald-400">{formatCVD(item.cvd)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
          <table className="w-full text-right border-collapse text-xs font-mono">
            <thead className="bg-black/60 text-[11px] text-text-muted border-b border-white/10 font-bold">
              <tr>
                <th className="py-2.5 px-4">الرمز</th>
                <th className="py-2.5 px-3 text-center">الإشارة</th>
                <th className="py-2.5 px-3 text-center text-amber-400">تقييم Binance</th>
                <th className="py-2.5 px-3 text-center text-cyan-400">تقييم Bybit</th>
                <th className="py-2.5 px-3 text-center">متوسط التوافق</th>
                <th className="py-2.5 px-3 text-left">السعر</th>
                <th className="py-2.5 px-3 text-center">5M %</th>
                <th className="py-2.5 px-3 text-center">مؤشر CVD</th>
                <th className="py-2.5 px-3 text-left">الدخول المقترح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {confluenceItems.map((item) => (
                <tr
                  key={item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`cursor-pointer transition-colors ${
                    selectedSymbol === item.symbol ? 'bg-amber-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-white">{item.symbol}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      LONG 🟢
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{item.binanceScore}/100</td>
                  <td className="py-2.5 px-3 text-center text-cyan-400 font-bold">{item.bybitScore}/100</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                      {item.confluenceRank || item.score}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-left text-white">${formatNum(item.price)}</td>
                  <td className={`py-2.5 px-3 text-center font-bold ${item.change_5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change_5m >= 0 ? '+' : ''}{item.change_5m.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{formatCVD(item.cvd)}</td>
                  <td className="py-2.5 px-3 text-left text-cyan-300">${formatNum(item.entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
