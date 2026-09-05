import React from 'react';

export function RadarConfluenceGrid({
  confluenceItems = [],
  onSelectSymbol,
  selectedSymbol
}) {
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
    <div className="flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡ رادار التوافق المشترك بين المنصات</span>
            <span className="text-[10px] text-text-muted font-normal">(Cross-Exchange High-Confluence)</span>
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          <strong className="text-amber-400 font-bold">{confluenceItems.length}</strong> فرص مؤكدة عبر المنصات
        </span>
      </div>

      {/* Cards Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {confluenceItems.map((item) => {
          const isSelected = selectedSymbol === item.symbol;
          const isStrong = item.score >= 78;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-md border flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-background-light/40 border-white/10 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500"></div>

              {/* Top Row: Symbol, Price, & Score */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono text-white">{item.symbol}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LONG 🟢
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border font-mono ${
                    isStrong
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {item.score}/100
                  </span>
                </div>
              </div>

              {/* Middle Row: Price & 5m Change */}
              <div className="mt-2 flex items-center justify-between font-mono text-xs">
                <span className="text-white/80 font-bold">${formatNum(item.price)}</span>
                <span className={`font-bold ${item.change_5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change_5m >= 0 ? '+' : ''}{item.change_5m.toFixed(2)}%
                </span>
              </div>

              {/* Platform Confirmation Badges */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Binance: {item.binanceScore || item.score}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Bybit: {item.bybitScore || item.score}
                  </span>
                </div>
                <span className="font-bold text-emerald-400">
                  {formatCVD(item.cvd)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
