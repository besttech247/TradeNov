import React from 'react';
import { PLATFORMS } from '../utils/scannerConstants';

export const PlatformsFilterModal = ({
  enabledPlatforms,
  setEnabledPlatforms,
  minVolume,
  setMinVolume,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const togglePlatform = (id) => {
    if (enabledPlatforms.includes(id)) {
      if (enabledPlatforms.length === 1) return; // يجب إبقاء منصة واحدة على الأقل
      setEnabledPlatforms(enabledPlatforms.filter(p => p !== id));
    } else {
      setEnabledPlatforms([...enabledPlatforms, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e131f] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-text-muted hover:text-white transition-all text-xs"
          >
            ✕
          </button>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>تخصيص المنصات والسيولة (CEX & DEX)</span>
          </h3>
        </div>

        {/* Platforms Selection */}
        <div className="mb-6">
          <label className="block text-xs text-text-muted mb-2 font-mono">
            اختر المنصات التي ترغب في مسحها:
          </label>
          <div className="space-y-2">
            {PLATFORMS.map((plat) => {
              const isChecked = enabledPlatforms.includes(plat.id);
              return (
                <div
                  key={plat.id}
                  onClick={() => togglePlatform(plat.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-white/10 border-primary/50 text-white'
                      : 'bg-white/[0.02] border-white/5 text-text-muted hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{plat.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{plat.label}</div>
                      <div className="text-[10px] text-text-muted">{plat.type}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimum Volume Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-primary font-bold">
              ${(minVolume / 1e6).toFixed(1)}M+
            </span>
            <span className="text-text-muted">الحد الأدنى للسيولة 24h:</span>
          </div>
          <input
            type="range"
            min="100000"
            max="10000000"
            step="200000"
            value={minVolume}
            onChange={(e) => setMinVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          حفظ وتطبيق الفلاتر
        </button>
      </div>
    </div>
  );
};
