import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TopNav } from './shared/components/TopNav';
import TADashboard from './pages/ta/Dashboard';
import ApiHub from './pages/dev/ApiHub';

import ProApp from './pages/pro/ProApp';
import AgentApp from './pages/agent/AgentApp';
import TradeNovScanner from './pages/scanner/TradeNovScanner';

const Hub = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center relative overflow-hidden bg-background">
    {/* Build Tag in Hub */}
    <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
      <span className="text-xs text-text-muted font-mono bg-background/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
        v1.0.0 | {typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__).toLocaleDateString('ar-SA') : ''}
      </span>
    </div>

    <div className="mt-12 sm:mt-0 mb-12">
      <h1 className="text-5xl font-black mb-3 tracking-tight">TradeNov <span className="text-primary glow-text">Hub</span></h1>
      <p className="text-text-muted max-w-lg mx-auto">المنظومة المتكاملة للتداول المتقدم والتحليل الفني والوكلاء الأذكياء.</p>
    </div>
    
    {/* 3 Main Options */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-16">
      <Link to="/ta" className="glass-panel p-8 hover:border-success/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-2 duration-300">
        <div className="w-20 h-20 rounded-3xl bg-success/10 flex items-center justify-center text-success mb-6 group-hover:scale-110 transition-transform">
          <span className="text-4xl">📈</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">TradeNov TA</h2>
        <p className="text-sm text-text-muted">التحليل الفني وماسح السيولة الذكي</p>
      </Link>
      
      <Link to="/pro" className="glass-panel p-8 hover:border-primary/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-2 duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.15)] relative z-10">
          <span className="text-4xl">💼</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 relative z-10">TradeNov PRO</h2>
        <p className="text-sm text-text-muted relative z-10">المحفظة ومنصة التداول المتقدمة</p>
      </Link>
      
      <Link to="/agent" className="glass-panel p-8 hover:border-accent/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-2 duration-300">
        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
          <span className="text-4xl">🤖</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">TradeNov AGENT</h2>
        <p className="text-sm text-text-muted">البوتات الآلية والمساعد الذكي</p>
      </Link>
    </div>

    {/* Secondary Menu (API Hub + 3 New Options) */}
    <div className="w-full max-w-5xl text-right mb-6">
      <h3 className="text-xl font-bold text-white/80 border-b border-white/10 pb-3 flex items-center justify-end gap-2">
        <span className="w-2 h-2 rounded-full bg-white/20"></span>
        أدوات النظام المساعدة
      </h3>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
      {/* 4. New Option 3 (Placeholder) */}
      <Link to="#" className="glass-panel p-4 hover:border-rose-500/40 transition-all cursor-pointer group flex items-center justify-end gap-4 bg-white/5 opacity-80 hover:opacity-100">
        <div className="text-right flex-1">
          <h2 className="text-sm font-bold text-white">خيار جديد 3</h2>
          <p className="text-[10px] text-text-muted">مساحة للإضافة مستقبلاً</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
          <span className="text-xl">🛡️</span>
        </div>
      </Link>

      {/* 3. New Option 2 (Placeholder) */}
      <Link to="#" className="glass-panel p-4 hover:border-orange-500/40 transition-all cursor-pointer group flex items-center justify-end gap-4 bg-white/5 opacity-80 hover:opacity-100">
        <div className="text-right flex-1">
          <h2 className="text-sm font-bold text-white">خيار جديد 2</h2>
          <p className="text-[10px] text-text-muted">مساحة للإضافة مستقبلاً</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
          <span className="text-xl">📊</span>
        </div>
      </Link>

      {/* 2. TradeNov Scanner (Beta) */}
      <Link to="/scanner" className="glass-panel p-4 hover:border-primary/60 transition-all cursor-pointer group flex items-center justify-end gap-4 bg-white/5 relative overflow-hidden">
        <div className="absolute top-1 left-2">
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
            BETA
          </span>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-sm font-bold text-white group-hover:text-primary transition-colors">TradeNov Scanner</h2>
          <p className="text-[10px] text-text-muted">ماسح الكريبتو اللحظي والسيولة</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(0,240,255,0.2)]">
          <span className="text-xl">🛰️</span>
        </div>
      </Link>

      {/* 1. API Hub */}
      <Link to="/dev/api-hub" className="glass-panel p-4 hover:border-white/40 transition-all cursor-pointer group flex items-center justify-end gap-4 bg-white/5">
        <div className="text-right flex-1">
          <h2 className="text-sm font-bold text-white">API Hub</h2>
          <p className="text-[10px] text-text-muted">لوحة مراقبة السيرفرات</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <span className="text-xl">⚡</span>
        </div>
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/ta/*" element={
          <div className="px-4 sm:px-8 pb-8">
            <TopNav title="TradeNov TA" />
            <TADashboard />
          </div>
        } />
        <Route path="/pro/*" element={<ProApp />} />
        <Route path="/agent/*" element={<AgentApp />} />
        <Route path="/scanner/*" element={<TradeNovScanner />} />
        <Route path="/dev/api-hub" element={<ApiHub />} />
      </Routes>
    </BrowserRouter>
  );
}
