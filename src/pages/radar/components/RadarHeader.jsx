import React from 'react';
import { Link } from 'react-router-dom';
import { EXCHANGES } from '../utils/radarEngine';

export function RadarHeader({
  selectedExchange,
  onChangeExchange,
  status,
  isRunning,
  onStart,
  onStop,
  onRefresh,
  countdown,
  soundEnabled,
  onToggleSound,
  directionFilter,
  setDirectionFilter,
  minScoreFilter,
  setMinScoreFilter,
  searchQuery,
  setSearchQuery,
  marketCount
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE RADAR
          </span>
        );
      case 'BOOTSTRAP':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            جاري الفحص...
          </span>
        );
      case 'RECONNECTING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            إعادة اتصال
          </span>
        );
      case 'STOPPED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            متوقف
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-background-light/40 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
      {/* Top Row: Brand, Hub link & Status controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Hub Back Link */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all text-xs font-medium"
          >
            <span>←</span>
            <span>الرئيسية Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-cyan-600 to-indigo-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Crypto Intraday Radar
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">
                  v3.5 Multi-Exchange Pro
                </span>
              </div>
              <p className="text-xs text-text-muted hidden sm:block">
                رادار المضاربة اللحظية الخاطفة وتدفق السيولة والـ CVD (Binance, Bybit, OKX & CME)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 mr-auto">
          {/* Exchange Switcher */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/15 flex-wrap gap-1">
            {Object.values(EXCHANGES).map((ex) => (
              <button
                key={ex.id}
                onClick={() => onChangeExchange(ex.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedExchange === ex.id
                    ? ex.id === 'BINANCE_FUTURES'
                      ? 'bg-amber-500 text-black font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : ex.id === 'OKX'
                      ? 'bg-purple-500 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : ex.id === 'BYBIT'
                      ? 'bg-cyan-500 text-black font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-emerald-500 text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <span>{ex.icon}</span>
                <span>{ex.shortName}</span>
              </button>
            ))}
          </div>

          {getStatusBadge()}

          {/* Countdown badge */}
          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-text-muted text-xs font-mono flex items-center gap-1.5">
            <span className="text-[10px]">التحديث:</span>
            <span className="font-bold text-cyan-400">{countdown}s</span>
          </div>

          {/* Start / Stop Toggle */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span>⏹️</span>
              <span>إيقاف</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span>▶️</span>
              <span>تشغيل</span>
            </button>
          )}

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            title="إعادة فحص الشموع فورا"
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white text-xs transition-all active:scale-95"
          >
            🔄
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'تعطيل التنبيه الصوتي' : 'تفعيل التنبيه الصوتي للإشارات القوية'}
            className={`px-2.5 py-1.5 rounded-xl border text-xs transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-text-muted border-white/10 hover:text-white'
            }`}
          >
            {soundEnabled ? '🔔 مفعّل' : '🔕 صامت'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-3 border-t border-white/5 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن رمز العملة (مثال: BTC, SOL, ETH, DOGE)..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-cyan-500/60 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs text-text-muted hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Direction Filter Tabs */}
        <div className="lg:col-span-4 flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
          {[
            { id: 'LONG', label: '🟢 LONG (الافتراضي)' },
            { id: 'ALL', label: 'الكل' },
            { id: 'STRONG', label: '🔥 قوية فقط' },
            { id: 'SHORT', label: '🔴 SHORT' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDirectionFilter(tab.id)}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                directionFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Min Score Filter */}
        <div className="lg:col-span-4 flex items-center justify-between gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-[11px] text-text-muted whitespace-nowrap">الحد الأدنى للنقاط:</span>
          <div className="flex items-center gap-1.5">
            {[0, 50, 65, 75].map((score) => (
              <button
                key={score}
                onClick={() => setMinScoreFilter(score)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold transition-all ${
                  minScoreFilter === score
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                    : 'bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                {score === 0 ? 'الكل' : `+${score}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
