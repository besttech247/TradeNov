import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coins, LogIn, UserPlus, Sun, Moon, Globe, Menu, X, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function PublicHeader() {
  const { user } = useAuth();
  const { lang, toggleLanguage, theme, toggleTheme, t } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const navLinks = [
    { path: '/', label: isRtl ? 'الرئيسية' : 'Home' },
    { path: '/market', label: isRtl ? 'السوق المباشر' : 'Live Market' },
    { path: '/pricing', label: isRtl ? 'الباقات والأسعار' : 'Pricing' },
    { path: '/about', label: isRtl ? 'من نحن' : 'About Us' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDark 
          ? 'bg-slate-950/80 border-white/10 shadow-2xl shadow-cyan-950/20' 
          : 'bg-white/85 border-slate-200/80 shadow-md shadow-slate-200/50'
      }`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link to="/pro/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-70 blur-xs group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-lg">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`text-base sm:text-lg font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Light Tracker
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-wider">
              V4.0 • Enterprise
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Quick Settings Group */}
          <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'text-amber-400 hover:bg-amber-400/10' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleLanguage}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isDark 
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>

          {/* User Auth Buttons */}
          {user ? (
            <Link 
              to="/pro/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-cyan-500/25 transition-all duration-200 border border-white/20 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/pro/login"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all rounded-xl border border-transparent ${
                  isDark 
                    ? 'text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/10' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? 'دخول' : 'Login'}</span>
              </Link>
              <Link 
                to="/pro/register"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:opacity-90 active:scale-95 border border-white/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'حساب جديد' : 'Sign Up'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900/60 border-white/10 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-900/80 border-white/10 text-cyan-400 active:bg-white/10' 
                : 'bg-slate-100 border-slate-200 text-slate-800 active:bg-slate-200'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className={`md:hidden border-b transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            isDark ? 'bg-slate-950/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          <div className="p-4 space-y-4 max-w-md mx-auto">
            {/* Nav Links */}
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <Sparkles className="w-4 h-4 text-cyan-400" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
              {/* Language Switch */}
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                  isDark ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{isRtl ? 'لغة الواجهة (Language)' : 'Interface Language'}</span>
                </div>
                <span className="font-mono text-cyan-400 uppercase">{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
              </button>

              {/* Action Buttons */}
              {user ? (
                <Link
                  to="/pro/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isRtl ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard'}</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/pro/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 text-xs font-bold rounded-xl text-center border flex items-center justify-center gap-2 transition-all ${
                      isDark ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-cyan-400" />
                    <span>{isRtl ? 'تسجيل الدخول' : 'Login'}</span>
                  </Link>
                  <Link
                    to="/pro/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-xs font-bold rounded-xl text-center bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isRtl ? 'حساب جديد' : 'Sign Up'}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

