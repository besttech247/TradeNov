import React from 'react';
import { Link } from 'react-router-dom';

export const TopNav = ({ title }) => {
  // استخدام بصمة البناء الديناميكية المحقونة عبر Vite
  // __BUILD_DATE__ comes from vite.config.js
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__) : new Date();
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <nav className="glass-panel w-full p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 rounded-b-xl rounded-t-none border-t-0 border-x-0">
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-3 py-2 bg-background-input hover:bg-white/5 border border-white/10 rounded-lg transition-colors text-text-muted hover:text-primary"
        >
          <span>⬅</span>
          <span className="font-semibold hidden sm:inline">الرئيسية</span>
        </Link>
        {title && <h1 className="text-xl font-bold text-text-main border-r border-white/10 pr-4">{title}</h1>}
      </div>

      <div className="flex flex-col text-left sm:text-right">
        <span className="text-xs text-text-muted font-mono bg-background px-2 py-1 rounded border border-white/5">
          🚀 أحدث رفع: {formatDate(buildDate)}
        </span>
      </div>
    </nav>
  );
};
