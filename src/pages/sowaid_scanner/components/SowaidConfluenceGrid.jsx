import React from 'react';
import { TF_SPECS, PRIORITY_ORDER } from '../utils/sowaidConstants';
import { calculateSowaidTradeLevels } from '../utils/sowaidEngine';

export const SowaidConfluenceGrid = ({
  topCoins = [],
  multiTfAnalysisMap = {},
  onSelectCoin
}) => {
  if (!topCoins || topCoins.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">⚡ صفقات التوافق العالي المتعدد (Multi-TF Confluence)</span>
          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            تزامن الإشارات على الفريمات
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {topCoins.map((coin) => {
          const analysis = multiTfAnalysisMap[coin.symbol];
          const activeCount = analysis?.activeSignalsCount || (coin.priceChangePercent > 2 ? 3 : 1);
          const highestTf = PRIORITY_ORDER.find(tf => analysis?.tfStatus?.[tf]?.signalValid) || "81m";
          const tradeLevels = calculateSowaidTradeLevels(coin.price, highestTf);

          return (
            <div
              key={coin.id || coin.symbol}
              onClick={() => onSelectCoin(coin)}
              className="scanner-glass p-4 border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 duration-200 relative overflow-hidden"
            >
              {/* Top Row: Symbol & Price */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm group-hover:scale-105 transition-transform">
                    {coin.baseAsset?.slice(0, 3) || coin.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white text-sm">{coin.symbol}</span>
                      <span className="text-[10px] text-text-muted font-mono bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                        {coin.platform}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted">
                      حجم: ${(coin.quoteVolume / 1e6).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-sm">
                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.priceChangePercent >= 0 ? '+' : ''}
                    {coin.priceChangePercent?.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Middle Row: 5 Timeframes Radar Pills */}
              <div className="mb-3 bg-black/30 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] text-text-muted mb-1.5 flex items-center justify-between">
                  <span>توافق الفريمات الـ 5 (EWO Radar):</span>
                  <span className="text-amber-300 font-bold font-mono">
                    {activeCount}/5 نشطة
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                  {PRIORITY_ORDER.map((tf) => {
                    const status = analysis?.tfStatus?.[tf];
                    const isValid = status ? status.signalValid : (tf === '81m' || tf === '27m');
                    return (
                      <div
                        key={tf}
                        className={`py-1 rounded-lg border transition-all ${
                          isValid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)] font-bold'
                            : 'bg-white/5 text-white/40 border-white/5'
                        }`}
                      >
                        <div>{tf}</div>
                        <div className="text-[8px] opacity-80">
                          {isValid ? 'ارتداد' : 'محايد'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Risk / Reward specs from the backtest */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono text-text-muted">
                <div>
                  حجم موصى: <span className="text-white font-bold">${tradeLevels.recommendedSizeUsd}</span>
                </div>
                <div>
                  وقف: <span className="text-rose-400">-{tradeLevels.stopLossPercent}%</span>
                </div>
                <div>
                  تتبع: <span className="text-sky-400">+{tradeLevels.trailingPercent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
