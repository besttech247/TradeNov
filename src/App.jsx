import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TopNav } from './shared/components/TopNav';
import TADashboard from './pages/ta/Dashboard';
import ApiHub from './pages/dev/ApiHub';

import ProApp from './pages/pro/ProApp';

const AgentApp = () => (
  <div className="px-8 pb-8">
    <TopNav title="TradeNov AGENT" />
    <div className="p-8 glass-panel text-center">
      <h1 className="text-3xl font-bold text-accent">🤖 TradeNov AGENT</h1>
      <p className="text-text-muted mt-2">Agent AGENT will build the Smart Assistant and Bots here.</p>
    </div>
  </div>
);

const Hub = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative overflow-hidden">
    {/* Build Tag in Hub */}
    <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
      <span className="text-xs text-text-muted font-mono bg-background/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
        v1.0.0 | {typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__).toLocaleDateString('ar-SA') : ''}
      </span>
    </div>

    <h1 className="text-5xl font-black mb-2 tracking-tight">TradeNov <span className="text-primary glow-text">Hub</span></h1>
    <p className="text-text-muted mb-10 max-w-lg">المنظومة المتكاملة للتداول المتقدم والتحليل الفني والوكلاء الأذكياء.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
      <Link to="/ta" className="glass-panel p-6 hover:border-success/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-1 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform">
          <span className="text-2xl">📈</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">TradeNov TA</h2>
        <p className="text-xs text-text-muted">التحليل الفني وماسح السيولة الذكي</p>
      </Link>
      
      <Link to="/pro" className="glass-panel p-6 hover:border-primary/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-1 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <span className="text-2xl">💼</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">TradeNov PRO</h2>
        <p className="text-xs text-text-muted">المحفظة ومنصة التداول المتقدمة</p>
      </Link>
      
      <Link to="/agent" className="glass-panel p-6 hover:border-accent/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-1 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
          <span className="text-2xl">🤖</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">TradeNov AGENT</h2>
        <p className="text-xs text-text-muted">البوتات الآلية والمساعد الذكي</p>
      </Link>

      {/* API DEV HUB */}
      <Link to="/dev/api-hub" className="glass-panel p-6 hover:border-white/50 transition-all cursor-pointer group flex flex-col items-center hover:-translate-y-1 duration-300 bg-white/5">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">API Status Hub</h2>
        <p className="text-xs text-text-muted">لوحة مراقبة السيرفرات والأسعار (للمطور)</p>
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
        <Route path="/dev/api-hub" element={<ApiHub />} />
      </Routes>
    </BrowserRouter>
  );
}
