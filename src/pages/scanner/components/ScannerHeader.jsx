import React from 'react';
import { MARKET_TYPES, TIMEFRAMES, FILTER_PRESETS } from '../utils/scannerConstants';

export const ScannerHeader = ({
  marketType,
  setMarketType,
  timeframe,
  setTimeframe,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  isPaused,
  setIsPaused,
  onOpenPlatformsModal,
  connectionStatus,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Row: Market Mode (ALL / FUTURES / SPOT), Search, Pause/Resume, Sound, Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        
        {/* Left / Start: 3-Way Market Selector */}
        <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setMarketType(MARKET_TYPES.ALL)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              marketType === MARKET_TYPES.ALL
                ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <span>🌐</span>
            <span>الكل (ALL)</span>
          </button>

          <button
            onClick={() => setMarketType(MARKET_TYPES.FUTURES)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              marketType === MARKET_TYPES.FUTURES
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>العقود (Futures)</span>
          </button>

          <button
            onClick={() => setMarketType(MARKET_TYPES.SPOT)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              marketType === MARKET_TYPES.SPOT
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <span>🪙</span>
            <span>الفوري (Spot)</span>
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالرمز أو العملة (BTC, SOL, PEPE)..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-right"
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

        {/* Right: Pause Button, Sound, Platforms Filter, Connection, Refresh */}
        <div className="flex items-center gap-2.5">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
            title={isPaused ? 'اضغط لاستئناف التحديث اللحظي' : 'اضغط لإيقاف وتجميد التحديث مؤقتاً أثناء الفحص'}
          >
            <span>{isPaused ? '▶️' : '⏸️'}</span>
            <span>{isPaused ? 'استئناف' : 'تجميد'}</span>
          </button>

          {/* Platforms Filter Toggle */}
          <button
            onClick={onOpenPlatformsModal}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="تخصيص المنصات (Binance / Bybit / DEX)"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">المنصات</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
            }`}
            title={soundEnabled ? 'التنبيهات الصوتية مفعلة' : 'التنبيهات الصوتية معطلة'}
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all disabled:opacity-50"
            title="تحديث البيانات فوراً"
          >
            <span className={loading ? 'inline-block animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Presets & Timeframes */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        {/* Filter Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActiveFilter(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
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
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
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
