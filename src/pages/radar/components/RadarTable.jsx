import React from 'react';

export function RadarTable({
  rows,
  selectedSymbol,
  onSelectSymbol
}) {
  const formatNum = (val, decimals = 4) => {
    if (val === undefined || val === null || isNaN(val)) return '--';
    if (Math.abs(val) >= 1000) return Number(val).toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (Math.abs(val) < 0.0001) return Number(val).toFixed(6);
    return Number(val).toFixed(decimals);
  };

  const getScoreColor = (score) => {
    if (score >= 78) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    if (score >= 62) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 48) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-white/5 text-text-muted border-white/10';
  };

  const getSignalBadge = (item) => {
    const isLong = item.direction === 'LONG';
    const isStrong = item.signal.startsWith('STRONG');

    if (isStrong) {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black border uppercase tracking-wider ${
          isLong 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
        }`}>
          <span>🔥</span>
          <span>{item.signal}</span>
        </span>
      );
    }

    if (item.signal === 'LONG' || item.signal === 'SHORT') {
      return (
        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${
          isLong ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {item.signal}
        </span>
      );
    }

    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-text-muted border border-white/10">
        {item.signal}
      </span>
    );
  };

  return (
    <div className="bg-background-light/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            أفضل فرص المضاربة اللحظية والسيولة (Top Intraday Opportunities)
          </h2>
        </div>
        <span className="text-xs font-mono text-text-muted">
          إجمالي النتائج: <strong className="text-cyan-400">{rows.length}</strong>
        </span>
      </div>

      <div className="overflow-x-auto max-h-[580px] scrollbar-thin scrollbar-thumb-white/10">
        <table className="w-full text-right border-collapse min-w-[1050px]">
          <thead className="bg-black/50 sticky top-0 z-10 text-[11px] text-text-muted font-bold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">الزوج (Symbol)</th>
              <th className="py-3 px-3 text-center">الإشارة (Signal)</th>
              <th className="py-3 px-3 text-center">التقييم (Score)</th>
              <th className="py-3 px-3 text-left">السعر (Price)</th>
              <th className="py-3 px-3 text-center">تغير 5M</th>
              <th className="py-3 px-3 text-center">RSI (14)</th>
              <th className="py-3 px-3 text-center">RVOL</th>
              <th className="py-3 px-3 text-center">تدفق الشراء</th>
              <th className="py-3 px-3 text-center">CVD</th>
              <th className="py-3 px-3 text-center">عمق الأوامر</th>
              <th className="py-3 px-3 text-center">السبريد</th>
              <th className="py-3 px-3 text-left">الدخول (Entry)</th>
              <th className="py-3 px-3 text-left">وقف الخسارة (SL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="13" className="py-12 text-center text-text-muted font-sans text-xs">
                  لا توجد عملات تطابق معايير الفرز أو جاري استلام التحديثات...
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const isSelected = selectedSymbol === item.symbol;
                const buyPct = (item.buy_ratio * 100);
                const bookImbPct = (item.book_imbalance * 100);

                return (
                  <tr
                    key={item.symbol}
                    onClick={() => onSelectSymbol(item.symbol)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/15 hover:bg-cyan-500/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Symbol */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.symbol}</span>
                      </div>
                    </td>

                    {/* Signal */}
                    <td className="py-3 px-3 text-center">
                      {getSignalBadge(item)}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-left font-bold text-white">
                      ${formatNum(item.price)}
                    </td>

                    {/* 5M % */}
                    <td className={`py-3 px-3 text-center font-bold ${
                      item.change_5m > 0 ? 'text-emerald-400' : item.change_5m < 0 ? 'text-rose-400' : 'text-text-muted'
                    }`}>
                      {item.change_5m > 0 ? '+' : ''}{item.change_5m.toFixed(2)}%
                    </td>

                    {/* RSI */}
                    <td className={`py-3 px-3 text-center font-medium ${
                      item.rsi >= 70 ? 'text-amber-400' : item.rsi <= 30 ? 'text-cyan-400' : 'text-text-muted'
                    }`}>
                      {item.rsi.toFixed(1)}
                    </td>

                    {/* RVOL */}
                    <td className={`py-3 px-3 text-center font-bold ${
                      item.rvol >= 2.0 ? 'text-amber-400' : item.rvol >= 1.3 ? 'text-emerald-400' : 'text-text-muted'
                    }`}>
                      {item.rvol.toFixed(2)}x
                    </td>

                    {/* Buy Flow % */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`font-bold ${buyPct >= 60 ? 'text-emerald-400' : buyPct <= 40 ? 'text-rose-400' : 'text-text-muted'}`}>
                          {buyPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* CVD */}
                    <td className={`py-3 px-3 text-center font-medium ${
                      item.cvd > 0 ? 'text-emerald-400' : item.cvd < 0 ? 'text-rose-400' : 'text-text-muted'
                    }`}>
                      {item.cvd > 0 ? '+' : ''}{formatNum(item.cvd, 0)}
                    </td>

                    {/* Book Imbalance */}
                    <td className={`py-3 px-3 text-center font-medium ${
                      bookImbPct > 15 ? 'text-emerald-400' : bookImbPct < -15 ? 'text-rose-400' : 'text-text-muted'
                    }`}>
                      {bookImbPct > 0 ? '+' : ''}{bookImbPct.toFixed(1)}%
                    </td>

                    {/* Spread % */}
                    <td className="py-3 px-3 text-center text-text-muted">
                      {item.spread_pct ? item.spread_pct.toFixed(3) : '0.000'}%
                    </td>

                    {/* Entry */}
                    <td className="py-3 px-3 text-left text-cyan-300 font-semibold">
                      ${formatNum(item.entry)}
                    </td>

                    {/* Stop Loss */}
                    <td className="py-3 px-3 text-left text-rose-400 font-semibold">
                      ${formatNum(item.stop)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
