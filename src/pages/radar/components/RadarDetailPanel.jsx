import React from 'react';
import { EXCHANGES } from '../utils/radarEngine';

export function RadarDetailPanel({ item, selectedExchange }) {
  if (!item) {
    return (
      <div className="bg-background-light/40 border border-white/10 rounded-2xl p-6 text-center text-text-muted backdrop-blur-md">
        قم باختيار عملة من الجدول أعلاه لعرض التفاصيل الكاملة ومستويات الدخول والأهداف...
      </div>
    );
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

  const isLong = item.direction === 'LONG';
  const rawSymbol = item.symbol.replace('USDT', '');
  const exMeta = EXCHANGES[selectedExchange] || EXCHANGES.BINANCE_FUTURES;
  const buyPct = (item.buy_ratio * 100);
  const sellPct = Math.max(0, 100 - buyPct);

  const getExchangeLiveLink = () => {
    if (selectedExchange === 'BYBIT') {
      return `https://www.bybit.com/trade/usdt/${item.symbol}`;
    }
    if (selectedExchange === 'BINANCE_FUTURES') {
      return `https://www.binance.com/en/futures/${item.symbol}`;
    }
    return `https://www.binance.com/en/trade/${rawSymbol}_USDT`;
  };

  return (
    <div className="bg-background-light/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
            {rawSymbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-mono">{item.symbol}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isLong ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {item.signal}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${exMeta.badgeColor}`}>
                {exMeta.name}
              </span>
            </div>
            <div className="text-xs text-text-muted font-mono mt-0.5">
              السعر اللحظي: <span className="text-white font-bold">${formatNum(item.price)}</span>
            </div>
          </div>
        </div>

        {/* Score and External Links */}
        <div className="flex items-center gap-3">
          {/* Quick TradingView / Exchange Links */}
          <a
            href={`https://www.tradingview.com/chart/?symbol=${selectedExchange.startsWith('BINANCE') ? 'BINANCE' : 'BYBIT'}:${item.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white text-xs font-mono transition-all"
          >
            📊 TradingView
          </a>
          <a
            href={getExchangeLiveLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white text-xs font-mono transition-all"
          >
            ⚡ {exMeta.shortName} Live
          </a>

          {/* Score Badge */}
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
            <span className="text-[11px] text-text-muted">النقاط:</span>
            <span className="text-sm font-black text-cyan-400">{item.score}/100</span>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Targets & Trade Levels */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            مستويات الصفقة المقترحة (Trade Levels)
          </h4>

          <div className="grid grid-cols-2 gap-2.5 font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-text-muted">نقطة الدخول (ENTRY)</span>
              <span className="text-sm font-bold text-cyan-400 mt-1">${formatNum(item.entry)}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-text-muted">وقف الخسارة (STOP LOSS)</span>
              <span className="text-sm font-bold text-rose-400 mt-1">${formatNum(item.stop)}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-text-muted">الهدف الأول (TP 1)</span>
              <span className="text-sm font-bold text-emerald-400 mt-1">${formatNum(item.tp1)}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-text-muted">الهدف الثاني (TP 2)</span>
              <span className="text-sm font-bold text-emerald-300 mt-1">${formatNum(item.tp2)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">نسبة المخاطرة الحقيقية (ATR %):</span>
            <span className="font-bold text-cyan-300">
              {item.atr_pct ? item.atr_pct.toFixed(2) : '--'}%
            </span>
          </div>
        </div>

        {/* Col 2: Microstructure & Flow Metrics */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            عمق السيولة ومؤشر CVD (Order Flow)
          </h4>

          {/* Live Buy vs Sell Flow Gauge */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-emerald-400">شراء ماركت: {buyPct.toFixed(1)}%</span>
              <span className="text-rose-400">بيع ماركت: {sellPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-rose-500 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, buyPct))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-text-muted">صافي تراكم CVD</span>
              <span className={`text-xs font-black mt-1 ${item.cvd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCVD(item.cvd)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-text-muted">عدم توازن الدفتر</span>
              <span className={`text-xs font-bold mt-1 ${item.book_imbalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.book_imbalance > 0 ? '+' : ''}{(item.book_imbalance * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-text-muted">نسبة السبريد</span>
              <span className="text-xs font-bold text-text-muted mt-1">{item.spread_pct.toFixed(4)}%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-text-muted">سرعة الصفقات</span>
              <span className="text-xs font-bold text-cyan-300 mt-1">{item.trade_velocity.toFixed(1)} صفقة/ث</span>
            </div>
          </div>
        </div>

        {/* Col 3: Technical Indicators & Reasons */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            أسباب إشارة الرادار (Signal Reasons)
          </h4>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2 flex-1">
            <span className="text-[11px] font-medium text-text-muted">العوامل الفنية والسيولية الداعمة:</span>
            {item.reasons && item.reasons.length > 0 ? (
              <ul className="space-y-1.5 mt-1">
                {item.reasons.map((r, idx) => (
                  <li key={idx} className="text-xs text-cyan-300 font-medium flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-text-muted">لا توجد أسباب قوية مكتملة حالياً.</span>
            )}

            <div className="mt-auto pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono text-text-muted">
              <div>RSI (14): <strong className="text-white">{item.rsi.toFixed(1)}</strong></div>
              <div>RVOL (20): <strong className="text-white">{item.rvol.toFixed(2)}x</strong></div>
              <div>VWAP: <strong className="text-white">${formatNum(item.vwap)}</strong></div>
              <div>5M %: <strong className="text-white">{item.change_5m.toFixed(2)}%</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
