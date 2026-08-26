import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Key, AlertTriangle, CheckCircle2, User, Server, Shield } from 'lucide-react';

export default function SecurityPreviewPage() {
  const { t } = useApp();
  const [username, setUsername] = useState('trader_admin');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoggedSimulated, setIsLoggedSimulated] = useState(true);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Strict Phase 9 Warning Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-indigo-950/30 to-black/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t('securityPreviewTitle')}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                Phase 9
              </span>
            </h2>
            <p className="text-xs text-purple-200 mt-1">{t('securityNotice')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Login Form Preview */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{t('loginFormTitle')}</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>JWT & HTTP-Only Active</span>
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 mb-1">{t('usernameLabel')}</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input pl-10 font-sans"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 shrink-0" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">{t('passwordLabel')}</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input pl-10 font-mono"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 shrink-0" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-gray-300 font-mono text-[11px]">
              <span>Encryption Spec:</span>
              <span className="text-purple-400 font-bold">{t('pwdEncryptionSub')}</span>
            </div>

            <button
              onClick={() => setIsLoggedSimulated(!isLoggedSimulated)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all font-sans"
            >
              {t('loginBtn')}
            </button>
          </div>
        </div>

        {/* Security Architecture Specifications Grid */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('secFeature1')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('secFeature1Sub')}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('secFeature2')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('secFeature2Sub')}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('secFeature3')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('secFeature3Sub')}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('secFeature4')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('secFeature4Sub')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
