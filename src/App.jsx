import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/ta/Dashboard';

const TAApp = () => (
  <Dashboard />
);

const ProApp = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-primary">💼 TradeNov PRO</h1>
    <p className="text-text-muted mt-2">Agent PRO will build the Trading Terminal and Portfolio here.</p>
  </div>
);

const AgentApp = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-accent">🤖 TradeNov AGENT</h1>
    <p className="text-text-muted mt-2">Agent AGENT will build the Smart Assistant and Bots here.</p>
  </div>
);

const Hub = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
    <h1 className="text-5xl font-black mb-8">TradeNov <span className="text-primary">Hub</span></h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
      <Link to="/ta" className="glass-panel p-6 hover:border-success/50 transition-all cursor-pointer">
        <h2 className="text-2xl font-bold text-success mb-2">📈 TA</h2>
        <p className="text-sm text-text-muted">التحليل الفني وماسح السيولة</p>
      </Link>
      <Link to="/pro" className="glass-panel p-6 hover:border-primary/50 transition-all cursor-pointer">
        <h2 className="text-2xl font-bold text-primary mb-2">💼 PRO</h2>
        <p className="text-sm text-text-muted">المحفظة ومنصة التداول</p>
      </Link>
      <Link to="/agent" className="glass-panel p-6 hover:border-accent/50 transition-all cursor-pointer">
        <h2 className="text-2xl font-bold text-accent mb-2">🤖 AGENT</h2>
        <p className="text-sm text-text-muted">البوتات والمساعد الذكي</p>
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/ta/*" element={<TAApp />} />
        <Route path="/pro/*" element={<ProApp />} />
        <Route path="/agent/*" element={<AgentApp />} />
      </Routes>
    </BrowserRouter>
  );
}
