import React from 'react';
import { SOWAID_FILTER_PRESETS, TIMEFRAME_FILTERS, SCANNER_NAME, SCANNER_VERSION } from '../utils/sowaidConstants';

export const SowaidHeader = ({
  marketType,
  setMarketType,
  activeFilter,
  setActiveFilter,
  selectedTfFilters = [],
  onToggleTfFilter,
  onClearTfFilters,
  tfMatchMode,
  setTfMatchMode,
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
  onSaveAsDefault,
  onResetToDefault,
  saveMessage,
  totalCoinsCount = 0
}) => {
  const isAllTf = selectedTfFilters.length === 0;

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

        {/* Action Controls & Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Frequency Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
            <span className="text-text-muted">⏱️ التحديث:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900 text-white">يدوي فقط (هادئ وثابت)</option>
              <option value="15000" className="bg-slate-900 text-white">كل 15 ثانية</option>
              <option value="30000" className="bg-slate-900 text-white">كل 30 ثانية</option>
              <option value="60000" className="bg-slate-900 text-white">كل 1 دقيقة</option>
            </select>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
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

          {/* Save Settings to Default Button */}
          <button
            onClick={onSaveAsDefault}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1 hover:border-amber-500/40"
            title="حفظ الإعدادات الحالية كافتراضية"
          >
            <span>💾</span>
            <span>حفظ كافتراضي</span>
          </button>

          {/* Reset to Factory Default */}
          <button
            onClick={onResetToDefault}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-text-muted hover:text-rose-300 rounded-xl text-xs font-bold transition-all border border-white/10"
            title="استعادة الإعدادات الأصلية"
          >
            <span>🔄 الافتراضي</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold transition-all border border-amber-500/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>تحديث الآن</span>
          </button>
        </div>
      </div>

      {/* Save Message Notification */}
      {saveMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-xl text-center font-mono animate-fade-in">
          {saveMessage}
        </div>
      )}

      {/* Row 1: Multi-Select Timeframe Filters (الكل + اختيار أكثر من فريم معاً) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-black/40 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted font-bold mr-1">🎯 فلترة الفريمات (متعددة):</span>

          {/* زر الكل */}
          <button
            onClick={onClearTfFilters}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              isAllTf
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            🌐 الكل
          </button>

          {/* أزرار الفريمات مع إمكانية تحديد أكثر من فريم معاً */}
          {TIMEFRAME_FILTERS.filter(t => t.id !== 'all').map((tf) => {
            const isSelected = selectedTfFilters.includes(tf.id);
            return (
              <button
                key={tf.id}
                onClick={() => onToggleTfFilter(tf.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)] scale-105'
                    : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10 border border-white/5'
                }`}
                title="اضغط للتحديد أو الإلغاء (يمكنك اختيار عدة فريمات معاً)"
              >
                <span>{tf.label}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}

          {/* Match Mode (أي فريم OR / جميع الفريمات AND) عند اختيار أكثر من فريم */}
          {selectedTfFilters.length > 1 && (
            <button
              onClick={() => setTfMatchMode(tfMatchMode === 'AND' ? 'OR' : 'AND')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/10 text-amber-300 border border-amber-500/30 hover:bg-white/15 transition-colors mr-2"
              title="التبديل بين مطابقة أي فريم أو جميع الفريمات معاً"
            >
              طريقة الدمج: {tfMatchMode === 'AND' ? 'جميع الفريمات المختارة معاً (AND)' : 'أي فريم منها (OR)'}
            </button>
          )}
        </div>

        {/* Search and Volume Filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-52">
            <input
              type="text"
              placeholder="ابحث بالرمز (BTC, SOL...)"
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

      {/* Row 2: Preset Strategy Tabs */}
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
