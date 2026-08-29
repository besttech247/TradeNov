import React from 'react';
import { SOWAID_FILTER_PRESETS, SCANNER_NAME, SCANNER_VERSION } from '../utils/sowaidConstants';

export const SowaidHeader = ({
  marketType,
  setMarketType,
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
              خوارزمية ارتدادات EWO متعددة الفريمات المتزامنة (1D | 4H | 81m | 27m | 9m)
            </p>
          </div>
        </div>

        {/* Action Controls & Sound */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-text-muted hover:text-white border-white/10'
            }`}
          >
            <span>{isPaused ? '▶ استئناف' : '⏸ إيقاف مؤقت'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              soundEnabled
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-white/5 text-text-muted border-white/10'
            }`}
            title="تفعيل/تعطيل التنبيهات الصوتية"
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-black/40 rounded-2xl border border-white/5">
        {/* Preset Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SOWAID_FILTER_PRESETS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === filter.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
              title={filter.desc}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search and Volume Filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="ابحث عن رمز (BTC, SOL...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-input/60 text-white text-xs px-3 py-2 pl-8 rounded-xl border border-white/10 focus:border-amber-500/50 focus:outline-none transition-colors"
            />
            <span className="absolute left-2.5 top-2 text-text-muted text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs text-text-muted">
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
    </div>
  );
};
