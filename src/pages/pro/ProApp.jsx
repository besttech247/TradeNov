import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { TopNav } from '../../shared/components/TopNav';
import Terminal from './Terminal';
import Keys from './Keys';

export default function ProApp() {
  return (
    <div className="px-4 sm:px-8 pb-8">
      <TopNav title="TradeNov PRO" />
      
      <div className="mt-6 flex flex-col md:flex-row gap-4 mb-6 border-b border-white/10 pb-4">
          <NavLink 
            to="/pro"
            end
            className={({ isActive }) => 
              `px-5 py-2.5 rounded-xl font-bold transition-all ${isActive ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-text-muted hover:bg-white/5 hover:text-white'}`
            }
          >
            Terminal & Portfolio
          </NavLink>
          <NavLink 
            to="/pro/keys"
            className={({ isActive }) => 
              `px-5 py-2.5 rounded-xl font-bold transition-all ${isActive ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-text-muted hover:bg-white/5 hover:text-white'}`
            }
          >
            API Keys
          </NavLink>
      </div>

      <Routes>
        <Route path="/" element={<Terminal />} />
        <Route path="/keys" element={<Keys />} />
      </Routes>
    </div>
  );
}
