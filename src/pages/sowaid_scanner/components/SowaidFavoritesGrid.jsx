import React from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidFavoritesGrid = ({
  favoriteCoins = [],
  multiTfAnalysisMap = {},
  onSelectCoin,
  onToggleFavorite,
  isCollapsed,
  setIsCollapsed
}) => {
  if (!favoriteCoins || favoriteCoins.length === 0) {
    return (
      <div className="scanner-glass p-3.5 mb-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>⭐</span>
          <span>قائمة المفضلة فارغة حالياً. اضغط على النجمة (⭐) بجانب أي عملة في الجدول لتثبيتها هنا كبطاقة دائمة.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-glass p-4 mb-6 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
      {/* Header with Collapse toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-base">⭐</span>
          <h3 className="font-bold text-white text-sm">البطاقات المفضلة والمثبتة (Pinned Favorites)</h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {favoriteCoins.length} عملات مثبتة
          </span>
        </div>

        <button className="text-xs text-text-muted hover:text-white flex items-center gap-1">
          <span>{isCollapsed ? 'عرض وتوسيع' : 'طي النافذة'}</span>
          <span className="text-sm font-mono">{isCollapsed ? '▼' : '▲'}</span>
        </button>
      </div>

      {/* Grid Content */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-3">
          {favoriteCoins.map((coin) => {
            const analysis = multiTfAnalysisMap[coin.symbol];
            const activeCount = analysis?.activeSignalsCount || 0;
            const highestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid) || "81m";
            const tradeLevels = calculateSowaidTradeLevels(coin.price, highestTf);

            return (
              <div
                key={coin.id || coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="bg-black/40 hover:bg-black/60 p-3.5 rounded-xl border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Symbol & Unfavorite */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {coin.baseAsset?.slice(0, 3) || coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{coin.symbol}</div>
                      <div className="text-[10px] text-text-muted font-mono">${(coin.quoteVolume / 1e6).toFixed(1)}M</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">
                        ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-bold ${coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent?.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(coin.symbol);
                      }}
                      className="text-amber-400 hover:scale-125 transition-transform text-sm p-1"
                      title="إلغاء التثبيت من المفضلة"
                    >
                      ★
                    </button>
                  </div>
                </div>

                {/* Multi-TF Radar Pills */}
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 my-2">
                  <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px]">
                    {PRIORITY_ORDER.map((tf) => {
                      const isValid = analysis?.tfStatus?.[tf]?.signalValid;
                      return (
                        <div
                          key={tf}
                          className={`py-0.5 rounded ${
                            isValid
                              ? 'bg-emerald-500 text-black font-bold'
                              : 'text-white/30'
                          }`}
                          title={`${tf}: ${isValid ? 'ارتداد نشط' : 'محايد'}`}
                        >
                          {tf}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted border-t border-white/5 pt-1.5">
                  <span className="text-amber-300">توافق: {activeCount}/7</span>
                  <span className="text-rose-400">وقف: -{tradeLevels.stopLossPercent}%</span>
                  <span className="text-sky-400">تتبع: +{tradeLevels.trailingPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
