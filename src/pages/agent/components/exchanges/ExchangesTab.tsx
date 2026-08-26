import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { ExchangeName } from '../../types';
import { 
  Key, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  X
} from 'lucide-react';

export const ExchangesTab: React.FC = () => {
  const { exchanges, addExchange, toggleExchangeConnection, deleteExchange } = useCryptoStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState<ExchangeName>('MEXC');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [totalBalanceUsdt, setTotalBalanceUsdt] = useState(10000);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExchange({
      name,
      apiKey: apiKey || `${name.toLowerCase()}_pk_${Math.random().toString(36).substring(2, 10)}`,
      apiSecret: apiSecret || '********************************',
      isDemo,
      isConnected: true,
      totalBalanceUsdt
    });
    setIsAddModalOpen(false);
    setApiKey('');
    setApiSecret('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-jiade-textMain dark:text-white">إدارة منصات التداول ومفاتيح API</h2>
          </div>
          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            ربط وإدارة مفاتيح الـ API لمنصة MEXC والمنصات العالمية الأخرى بشكل مشفر وآمن للتداول الآلي.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منصة أو مفتاح API جديد</span>
        </button>
      </div>

      {/* Exchanges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchanges.map((ex) => (
          <div key={ex.id} className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 hover:border-blue-400 dark:hover:border-crypto-accent/50 transition-all shadow-jiade dark:shadow-none">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                  {ex.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-jiade-textMain dark:text-white flex items-center gap-2">
                    <span>{ex.name}</span>
                    {ex.name === 'MEXC' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        الرئيسية
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                    {ex.isDemo ? 'حساب تجريبي (Demo)' : 'حساب حقيقي (Live)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {ex.isConnected ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متصل</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>منفصل</span>
                  </span>
                )}
              </div>
            </div>

            {/* API Key Details */}
            <div className="bg-jiade-cardSub dark:bg-crypto-dark p-3.5 rounded-xl border border-jiade-border dark:border-crypto-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-jiade-textMuted dark:text-gray-400 font-medium">API Key:</span>
                <span className="font-mono text-jiade-textMain dark:text-gray-200 font-bold">{ex.apiKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-jiade-textMuted dark:text-gray-400 font-medium">API Secret:</span>
                <span className="font-mono text-slate-400 dark:text-gray-400">********************</span>
              </div>
              <div className="flex justify-between">
                <span className="text-jiade-textMuted dark:text-gray-400 font-medium">سرعة الاتصال (Ping):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{ex.pingMs} ms</span>
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-jiade-textMuted dark:text-gray-400 font-medium">الرصيد المربوط حالياً:</span>
              <strong className="text-base font-extrabold text-jiade-textMain dark:text-white">${ex.totalBalanceUsdt.toLocaleString()} USDT</strong>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-jiade-border dark:border-crypto-border">
              <button
                onClick={() => toggleExchangeConnection(ex.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  ex.isConnected 
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{ex.isConnected ? 'إعادة الاتصال / فصل' : 'توصيل المنصة'}</span>
              </button>

              <button
                onClick={() => deleteExchange(ex.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-xl transition-all"
                title="حذف المفتاح"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Security Banner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex items-center gap-4 shadow-jiade dark:shadow-none">
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-jiade-textMain dark:text-white">معايير الأمان وتشفير المفاتيح</h4>
          <p className="text-xs text-jiade-textMuted dark:text-gray-400 mt-0.5 font-medium">
            يتم تخزين مفاتيح API بتشفير قوي من درجة البنوك (AES-256). يُرجى التأكد من اختيار صلاحيات (Trade Only) وعدم تفعيل صلاحيات السحب (Withdrawals) لحماية أموالك.
          </p>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-crypto-card w-full max-w-md rounded-2xl border border-jiade-border dark:border-crypto-border shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white">ربط منصة تداول جديدة</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">اختر المنصة</label>
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value as ExchangeName)}
                  className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="MEXC">MEXC Spot Exchange</option>
                  <option value="Binance">Binance Exchange</option>
                  <option value="Bybit">Bybit Exchange</option>
                  <option value="KuCoin">KuCoin Exchange</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">API Key</label>
                <input
                  type="text"
                  placeholder="أدخل مفتاح API الخاصة بالمنصة..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">API Secret</label>
                <input
                  type="password"
                  placeholder="أدخل الـ API Secret الخاص بالمنصة..."
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDemoCheck"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-4 h-4 rounded bg-jiade-cardSub dark:bg-crypto-dark border-jiade-border dark:border-crypto-border text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDemoCheck" className="text-jiade-textMain dark:text-gray-300 font-bold cursor-pointer">
                  هذا المفتاح مخصص للحساب التجريبي (Testnet / Paper Trading)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-jiade-border dark:border-crypto-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  حفظ وتأكيد الاتصال
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
