import React, { useState } from 'react';
import { PlatformBadge, ExchangeIcons } from '../utils/platformLogos';

export const IconsLegendDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all">
      {/* Drawer Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors text-right"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>دليل مفاتيح الرموز والإشارات (Icons & Signals Legend)</span>
              <span className="text-[10px] font-mono bg-white/10 text-primary px-2 py-0.5 rounded">
                مرجع توضيحي
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              اضغط هنا لفهم دلالات أيقونات المنصات، شارات الأسواق، وألوان إشارات الزخم اللحظية.
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted text-xs">
          {isOpen ? '▲ إغلاق' : '▼ فتح'}
        </div>
      </button>

      {/* Drawer Content */}
      {isOpen && (
        <div className="p-5 border-t border-white/5 bg-black/40 text-right space-y-6 animate-in fade-in duration-200">
          {/* 1. المنصات المدعومة */}
          <div>
            <h5 className="text-xs font-bold text-white mb-2.5 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              أيقونات المنصات (Exchange Logos):
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <PlatformBadge platformId="BINANCE" size="w-5 h-5" />
                <div className="text-xs font-mono">
                  <div className="font-bold text-white">Binance</div>
                  <div className="text-[10px] text-text-muted">منصة مركزية (CEX)</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <PlatformBadge platformId="BYBIT" size="w-5 h-5" />
                <div className="text-xs font-mono">
                  <div className="font-bold text-white">Bybit</div>
                  <div className="text-[10px] text-text-muted">عقود وفوري (CEX)</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <PlatformBadge platformId="DEX" size="w-5 h-5" />
                <div className="text-xs font-mono">
                  <div className="font-bold text-white">DEX / On-Chain</div>
                  <div className="text-[10px] text-text-muted">Raydium & Uniswap</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <PlatformBadge platformId="OKX" size="w-5 h-5" />
                <div className="text-xs font-mono">
                  <div className="font-bold text-white">OKX</div>
                  <div className="text-[10px] text-text-muted">سيولة عالمية (CEX)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. أنواع الأسواق */}
          <div>
            <h5 className="text-xs font-bold text-white mb-2.5 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              أنواع الأسواق (Markets):
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ⚡ FUTURES
                </span>
                <span className="text-text-muted text-[11px]">
                  <strong>العقود الآجلة:</strong> تشمل رافعة مالية، وتتبع معدل التمويل (Funding Rate) وضغط الشورت/اللونغ.
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🪙 SPOT
                </span>
                <span className="text-text-muted text-[11px]">
                  <strong>السوق الفوري:</strong> شراء وبيع العملة الفعلية مباشرة وبدون رافعة مالية أو رسوم تمويل.
                </span>
              </div>
            </div>
          </div>

          {/* 3. إشارات الزخم اللحظي */}
          <div>
            <h5 className="text-xs font-bold text-white mb-2.5 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              إشارات الزخم والمضاربة اللحظية (Signals ⚡):
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-cyan-400 font-bold block mb-1">🌊 انفجار سيولة:</span>
                <span className="text-[11px] text-text-muted font-sans">
                  حجم تداول غير اعتيادي يقفز فجأة (دخول حيتان وصناع سوق).
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-1">🚀 زخم صاعد:</span>
                <span className="text-[11px] text-text-muted font-sans">
                  صعود سريع وقوي للشمعة الحالية مخترقاً مقاومات سابقة.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-amber-400 font-bold block mb-1">⚡ ضغط شورت:</span>
                <span className="text-[11px] text-text-muted font-sans">
                  معدل تمويل سلبي حاد ينذر بانفجار سعري للأعلى (Short Squeeze).
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-purple-400 font-bold block mb-1">🎯 ألفا قوية:</span>
                <span className="text-[11px] text-text-muted font-sans">
                  عملة ترتفع بقوة متفوقة على البيتكوين بأكثر من 4%.
                </span>
              </div>
            </div>
          </div>

          {/* 4. كيفية احتساب نسبة التغير السعري */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-text-muted font-mono flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>
              <strong>حساب نسبة التغير:</strong> يتم احتساب التغير السعري بدقة بناءً على <strong>سعر الافتتاح والإغلاق للجلسة (Session Open/Close)</strong> لتعكس اتجاه الشمعة الحقيقي بدقة متناهية.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
