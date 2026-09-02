import React from 'react';
import { SCREENS, MARKET_PRESETS, INFO_VERSION } from '../utils/infoConstants';
import { RefreshCw, BookOpen, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InfoHeader = ({
  selectedScreen,
  setSelectedScreen,
  selectedPreset,
  setSelectedPreset,
  customSymbol,
  setCustomSymbol,
  onRefresh,
  loading,
  onOpenPlaybook
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Bar: Navigation, Title & Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all text-sm group"
          >
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>الرئيسية (Hub)</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TradeNov <span className="text-primary info-glow-text">INFO</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {INFO_VERSION}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all text-xs"
            title="تحديث البيانات لحظياً"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>{loading ? 'جاري الجلب...' : 'تحديث حي'}</span>
          </button>

          <button
            onClick={onOpenPlaybook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all text-xs font-bold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 دليل التداول (Playbook)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Screen Selector & Asset Picker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Screen Selector */}
        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="text-xs text-text-muted font-medium">📌 اختر شاشة التحليل:</label>
          <div className="relative">
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="w-full bg-[#10141f] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer text-right pr-3 pl-8 font-semibold"
            >
              {SCREENS.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#10141f] text-white">
                  {sc.fullTitle}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Asset Preset Selector */}
        <div className="md:col-span-4 flex flex-col gap-1">
          <label className="text-xs text-text-muted font-medium">🌐 اختر الأصل المالي السريع:</label>
          <div className="relative">
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = MARKET_PRESETS.find((p) => p.id === e.target.value);
                if (found) setSelectedPreset(found);
              }}
              className="w-full bg-[#10141f] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer text-right pr-3 pl-8 font-semibold"
            >
              {MARKET_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#10141f] text-white">
                  {p.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Active Symbol / Custom Input */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-xs text-text-muted font-medium">
            {selectedPreset.id === 'CUSTOM' ? '✍️ اكتب الرمز المطلوب:' : 'رمز الأصل النشط:'}
          </label>
          {selectedPreset.id === 'CUSTOM' ? (
            <div className="relative">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="BTCUSDT, NVDA, AAPL..."
                className="w-full bg-[#10141f] border border-primary/40 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors pr-3 pl-8 font-mono uppercase"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            </div>
          ) : (
            <input
              type="text"
              value={selectedPreset.cryptoPair || selectedPreset.symbol}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 font-mono text-center cursor-not-allowed"
            />
          )}
        </div>
      </div>
    </div>
  );
};
