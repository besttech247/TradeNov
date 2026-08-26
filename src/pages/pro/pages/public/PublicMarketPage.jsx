import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, TrendingUp, Sparkles, ShieldCheck, Coins } from 'lucide-react';
import MarketPricesPage from '../MarketPricesPage';
import { useApp } from '../../context/AppContext';

export default function PublicMarketPage() {
  const { lang, theme } = useApp();
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-8 pb-16 selection:bg-cyan-500/30">
      
      {/* Public Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className={`p-8 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-white/10 text-white' 
            : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-700 border-white/20 text-white'
        }`}>
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>متابعة حية ومباشرة 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              أسعار العملات الرقمية والذهب المباشرة
            </h1>

            <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans">
              راقب حركة الأسواق العالمية ومعدلات التغير والتداولات اليومية لحظة بلحظة مع تحديث تلقائي وسريع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/pro/register"
              className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm shadow-lg border border-white/10 transition-all active:scale-95"
            >
              سجل حسابك لتتبع صفقاتك
            </Link>
          </div>
        </div>
      </section>

      {/* Main Market Component Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-md ${
          isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'
        }`}>
          <MarketPricesPage />
        </div>
      </main>

    </div>
  );
}


