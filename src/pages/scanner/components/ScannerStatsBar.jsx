import React from 'react';
import { formatPrice, formatPercent, formatVolume } from '../utils/technicalIndicators';

export const ScannerStatsBar = ({ items, btcData, marketType }) => {
  if (!items || items.length === 0) return null;

  // إحصائيات سريعة
  const totalVolume = items.reduce((acc, curr) => acc + (curr.quoteVolume || 0), 0);
  
  // الأعلى صعوداً والأكثر هبوطاً
  const sortedByChange = [...items].sort((a, b) => b.priceChangePercent - a.priceChangePercent);
  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange[sortedByChange.length - 1];

  // متوسط عدد الصاعد والهابط
  const gainersCount = items.filter(i => i.priceChangePercent > 0).length;
  const losersCount = items.filter(i => i.priceChangePercent < 0).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {/* 1. BTC Anchor Sentiment */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>مؤشر السوق (BTC)</span>
          <span className="text-base">🪙</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-white font-mono">
            ${btcData ? formatPrice(btcData.price) : '---'}
          </span>
          <span className={`text-xs font-mono font-bold ${
            (btcData?.priceChangePercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {btcData ? formatPercent(btcData.priceChangePercent) : '0.00%'}
          </span>
        </div>
      </div>

      {/* 2. Total Scanned Coins */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>نطاق الفحص ({marketType})</span>
          <span className="text-base">📡</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-white font-mono">{items.length} عملة</span>
          <span className="text-xs text-text-muted font-mono">
            <span className="text-emerald-400 font-bold">{gainersCount} صاعد</span> / <span className="text-rose-400 font-bold">{losersCount} هابط</span>
          </span>
        </div>
      </div>

      {/* 3. 24h Market Volume */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>السيولة الممسوحة (24h)</span>
          <span className="text-base">💧</span>
        </div>
        <div className="text-base font-bold text-cyan-400 font-mono">
          {formatVolume(totalVolume)}
        </div>
      </div>

      {/* 4. Top Gainer */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>الأعلى صعوداً 🚀</span>
          <span className="text-xs font-bold text-white">{topGainer?.baseAsset}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-mono text-text-muted">${formatPrice(topGainer?.price)}</span>
          <span className="text-xs font-bold font-mono text-emerald-400">
            {formatPercent(topGainer?.priceChangePercent)}
          </span>
        </div>
      </div>

      {/* 5. Top Loser */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>الأكثر هبوطاً 📉</span>
          <span className="text-xs font-bold text-white">{topLoser?.baseAsset}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-mono text-text-muted">${formatPrice(topLoser?.price)}</span>
          <span className="text-xs font-bold font-mono text-rose-400">
            {formatPercent(topLoser?.priceChangePercent)}
          </span>
        </div>
      </div>
    </div>
  );
};
