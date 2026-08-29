import React from 'react';
import { MARKET_TYPES, TIMEFRAMES, FILTER_PRESETS, STRATEGY_MODES, SCANNER_NAME, SCANNER_VERSION } from '../utils/scannerConstants';

export const ScannerHeader = ({
  marketType,
  setMarketType,
  strategyMode,
  setStrategyMode,
  timeframe,
  setTimeframe,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  minVolume,
  setMinVolume,
  soundEnabled,
  setSoundEnabled,
  isPaused,
  setIsPaused,
  onOpenPlatformsModal,
  connectionStatus,
  onRefresh,
  loading,
  totalCoinsCount = 0
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Brand & Version Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            🛰️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">{SCANNER_NAME}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/40 shadow-sm">
                {SCANNER_VERSION}
              </span>
            </div>
            <p className="text-xs text-text-muted">ماسح السيولة الشامل وتدفق الأوامر (CVD + Volume Profile POC + TTM Squeeze)</p>
          </div>
        </div>

        {/* Strategy Switcher (Tabs) */}
        <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10">
          <button
            onClick={() => setStrategyMode(STRATEGY_MODES.ALL)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              strategyMode === STRATEGY_MODES.ALL
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <span>🌐</span>
            <span>الكل ({totalCoinsCount})</span>
          </button>

          <button
            onClick={() => setStrategyMode(STRATEGY_MODES.SNIPER)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              strategyMode === STRATEGY_MODES.SNIPER
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-text-muted hover:text-amber-300'
            }`}
          >
            <span>🎯</span>
            <span>صفقة القناص (اليومية)</span>
          </button>

          <button
            onClick={() => setStrategyMode(STRATEGY_MODES.SCALP)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              strategyMode === STRATEGY_MODES.SCALP
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-text-muted hover:text-cyan-300'
            }`}
          >
            <span>⚡</span>
            <span>صفقات سريعة (2-5 يومياً)</span>
          </button>
        </div>
      </div>

      {/* Main Controls Row: Market Selector, Search, Liquidity Filter, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        
        {/* Left: Market Mode (ALL / FUTURES / SPOT) */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMarketType(MARKET_TYPES.ALL)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              marketType === MARKET_TYPES.ALL
                ? 'bg-primary text-black shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setMarketType(MARKET_TYPES.FUTURES)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              marketType === MARKET_TYPES.FUTURES
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            العقود (Futures)
          </button>
          <button
            onClick={() => setMarketType(MARKET_TYPES.SPOT)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              marketType === MARKET_TYPES.SPOT
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            الفوري (Spot)
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بأي عملة (BTC, ETH, NEAR, PEPE)..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Liquidity Quick Filter (فلتر السيولة بدون قيود) */}
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-text-muted font-mono text-[11px]">حجم السيولة:</span>
          <select
            value={minVolume}
            onChange={(e) => setMinVolume(Number(e.target.value))}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value={0} className="bg-neutral-900">جميع العملات (بلا حدود)</option>
            <option value={100000} className="bg-neutral-900">&gt; $100K (واسع)</option>
            <option value={500000} className="bg-neutral-900">&gt; $500K (متوسط)</option>
            <option value={1000000} className="bg-neutral-900">&gt; $1M (سيولة قوية)</option>
            <option value={10000000} className="bg-neutral-900">&gt; $10M (مؤسساتي)</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1 ${
              isPaused
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
            title={isPaused ? 'استئناف التحديث اللحظي' : 'تجميد التحديث مؤقتاً'}
          >
            <span>{isPaused ? '▶️' : '⏸️'}</span>
            <span>{isPaused ? 'استئناف' : 'تجميد'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all text-xs font-semibold ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
            }`}
            title={soundEnabled ? 'التنبيهات الصوتية مفعلة' : 'التنبيهات الصوتية معطلة'}
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
          </button>

          {/* Platforms Filter Toggle */}
          <button
            onClick={onOpenPlatformsModal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all"
            title="تخصيص المنصات"
          >
            <span>⚙️</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all disabled:opacity-50"
            title="تحديث فوري"
          >
            <span className={loading ? 'inline-block animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Presets & Timeframes */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActiveFilter(preset.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                activeFilter === preset.id
                  ? 'bg-white/15 border-primary/60 text-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/5 text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
          <span className="text-[11px] text-text-muted px-2 font-mono">الفريم:</span>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                timeframe === tf.value
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
