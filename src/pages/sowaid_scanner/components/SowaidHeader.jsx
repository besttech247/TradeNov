import React from 'react';
import { SOWAID_FILTER_PRESETS, TIMEFRAME_FILTERS, SCANNER_NAME, SCANNER_VERSION } from '../utils/sowaidConstants';

export const SowaidHeader = ({
  marketType,
  setMarketType,
  activeFilter,
  setActiveFilter,
  selectedTfFilter,
  setSelectedTfFilter,
  searchQuery,
  setSearchQuery,
  minVolume,
  setMinVolume,
  soundEnabled,
  setSoundEnabled,
  isPaused,
  setIsPaused,
  refreshInterval,
  setRefreshInterval,
  onRefresh,
  loading,
  totalCoinsCount = 0
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Brand & Version Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">{SCANNER_NAME}</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
                {SCANNER_VERSION}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              خوارزمية ارتدادات EWO متعددة الفريمات (1D | 4H | 81m | 27m | 9m | 3m | 1m)
            </p>
          </div>
        </div>

        {/* Action Controls & Quiet Refresh Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Frequency Selector (حل مشكلة الإزعاج) */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
            <span className="text-text-muted">⏱️ التحديث:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900 text-white">يدوي فقط (هادئ)</option>
              <option value="15000" className="bg-slate-900 text-white">كل 15 ثانية</option>
              <option value="30000" className="bg-slate-900 text-white">كل 30 ثانية</option>
              <option value="60000" className="bg-slate-900 text-white">كل 1 دقيقة</option>
            </select>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-text-muted hover:text-white border-white/10'
            }`}
          >
            <span>{isPaused ? '▶ استئناف' : '⏸ إيقاف'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              soundEnabled
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-white/5 text-text-muted border-white/10'
            }`}
            title={soundEnabled ? 'تنبيهات صوتية مفعلة' : 'صامت (بدون إزعاج)'}
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold transition-all border border-amber-500/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>تحديث الآن</span>
          </button>
        </div>
      </div>

      {/* Row 1: Timeframe Filter Selector (1d, 4h, 81m, 27m, 9m, 3m, 1m, الكل) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-bold mr-1">🎯 فلتر الفريم:</span>
          <div className="flex flex-wrap items-center gap-1">
            {TIMEFRAME_FILTERS.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTfFilter(tf.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedTfFilter === tf.id
                    ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Volume Filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="ابحث عن رمز (BTC, SOL...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-input/60 text-white text-xs px-3 py-1.5 pl-8 rounded-xl border border-white/10 focus:border-amber-500/50 focus:outline-none transition-colors"
            />
            <span className="absolute left-2.5 top-1.5 text-text-muted text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-xl border border-white/10 text-xs text-text-muted">
            <span>السيولة:</span>
            <select
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900">الكل</option>
              <option value="1000000" className="bg-slate-900">&gt; 1M$</option>
              <option value="10000000" className="bg-slate-900">&gt; 10M$</option>
              <option value="50000000" className="bg-slate-900">&gt; 50M$</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Strategy Preset Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        {SOWAID_FILTER_PRESETS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === filter.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
