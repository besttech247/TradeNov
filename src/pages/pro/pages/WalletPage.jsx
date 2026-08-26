import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { calculateExchangeLiveBalance } from '../utils/mathEngine';
import { 
  Wallet, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, 
  History, CheckCircle2, AlertCircle, XCircle, Trash2
} from 'lucide-react';

export default function WalletPage() {
  const { t, exchanges, trades, walletTransactions, fetchData, lang } = useApp();
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    exchange_id: exchanges.length > 0 ? exchanges[0].id : '',
    to_exchange_id: '',
    amount: '',
    fee: '0',
    notes: ''
  });

  useEffect(() => {
    if (exchanges.length > 0 && !formData.exchange_id) {
      setFormData(prev => ({ ...prev, exchange_id: exchanges[0].id }));
    }
  }, [exchanges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const type = activeTab.toUpperCase();
      const requestedAmount = parseFloat(formData.amount);
      const fee = parseFloat(formData.fee) || 0;
      const exId = parseInt(formData.exchange_id);
      
      const ex = exchanges.find(e => e.id === exId);
      
      if (type === 'WITHDRAW' || type === 'TRANSFER') {
        const currentBalance = calculateExchangeLiveBalance(ex, trades);
        if ((requestedAmount + fee) > currentBalance) {
          throw new Error('الرصيد المتاح غير كافٍ لإتمام هذه العملية.');
        }
      }
      
      const payload = {
        exchange_id: exId,
        type: type,
        amount: requestedAmount,
        fee: fee,
        notes: formData.notes
      };

      if (type === 'TRANSFER') {
        payload.to_exchange_id = parseInt(formData.to_exchange_id);
        if (payload.exchange_id === payload.to_exchange_id) {
          throw new Error('لا يمكن التحويل لنفس المنصة.');
        }
      }

      await api.createWalletTransaction(payload);
      setSuccess('تمت العملية بنجاح!');
      setFormData({
        ...formData,
        amount: '',
        fee: '0',
        notes: ''
      });
      await fetchData(); // Refresh all data to update header and exchange cards

    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تنفيذ العملية.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟ سيؤثر هذا على أرصدتك.')) return;
    try {
      await api.deleteWalletTransaction(id);
      await fetchData();
    } catch (err) {
      alert('خطأ في الحذف');
    }
  };

  const getIcon = (type) => {
    if (type === 'DEPOSIT') return <ArrowDownToLine className="w-5 h-5 text-emerald-400" />;
    if (type === 'WITHDRAW') return <ArrowUpFromLine className="w-5 h-5 text-rose-400" />;
    return <ArrowRightLeft className="w-5 h-5 text-cyan-400" />;
  };

  const getTypeLabel = (type) => {
    if (type === 'DEPOSIT') return 'إيداع';
    if (type === 'WITHDRAW') return 'سحب';
    return 'تحويل';
  };

  console.log("WALLET PAGE TRANSACTIONS:", walletTransactions);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6" dir={t('dir')}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
          <Wallet className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{isRtl ? 'التحويلات وحركة الأموال 💸' : 'Transfers & Money Movement 💸'}</h1>
          <p className="text-sm text-gray-400 mt-1">{isRtl ? 'سجل الإيداعات والسحوبات ونقل الأصول بين المنصات والمخازن.' : 'Record of deposits, withdrawals, and asset transfers.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-6">
              <button 
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
              >
                إيداع
              </button>
              <button 
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'withdraw' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-white'}`}
              >
                سحب
              </button>
              <button 
                onClick={() => setActiveTab('transfer')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'transfer' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              >
                تحويل
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">{activeTab === 'transfer' ? 'من منصة' : 'المنصة'}</label>
                <select 
                  className="w-full p-3 rounded-xl glass-input"
                  value={formData.exchange_id}
                  onChange={e => setFormData({...formData, exchange_id: e.target.value})}
                  required
                >
                  <option value="">-- اختر منصة --</option>
                  {exchanges.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              {activeTab === 'transfer' && (
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">إلى منصة</label>
                  <select 
                    className="w-full p-3 rounded-xl glass-input"
                    value={formData.to_exchange_id}
                    onChange={e => setFormData({...formData, to_exchange_id: e.target.value})}
                    required
                  >
                    <option value="">-- اختر منصة --</option>
                    {exchanges.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1 text-sm">المبلغ ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full p-3 rounded-xl glass-input font-mono"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              {activeTab === 'transfer' && (
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">عمولة التحويل (اختياري)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full p-3 rounded-xl glass-input font-mono"
                    value={formData.fee}
                    onChange={e => setFormData({...formData, fee: e.target.value})}
                  />
                  <span className="text-[10px] text-gray-500">سيتم خصمها من منصة المصدر.</span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1 text-sm">ملاحظات (اختياري)</label>
                <input 
                  type="text"
                  className="w-full p-3 rounded-xl glass-input"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="سبب التحويل أو مرجع..."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'جاري التنفيذ...' : 'تأكيد العملية'}
              </button>
            </form>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-white">سجل الحركات</h3>
            </div>
            <div className="flex-1 overflow-auto max-h-[600px]">
              <table className="w-full text-left border-collapse" dir={t('dir')}>
                <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="p-3 md:p-4 text-xs text-gray-400 font-semibold text-right">التاريخ</th>
                    <th className="p-3 md:p-4 text-xs text-gray-400 font-semibold text-right">العملية</th>
                    <th className="p-3 md:p-4 text-xs text-gray-400 font-semibold text-right">التفاصيل</th>
                    <th className="p-3 md:p-4 text-xs text-gray-400 font-semibold text-left">المبلغ</th>
                    <th className="p-3 md:p-4 text-xs text-gray-400 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {walletTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 sm:p-8 text-center text-gray-500">
                        لا توجد حركات مالية مسجلة بعد.
                      </td>
                    </tr>
                  ) : (
                    walletTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-3 md:p-4 text-xs text-gray-400 font-mono text-right">
                          {new Date(tx.timestamp).toLocaleString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="p-3 md:p-4 text-right">
                          <div className="flex items-center gap-2">
                            {getIcon(tx.type)}
                            <span className="text-sm font-semibold text-gray-300">
                              {getTypeLabel(tx.type)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 md:p-4 text-right">
                          {tx.type === 'TRANSFER' ? (
                            <div className="text-sm text-gray-300">
                              من <span className="font-bold text-white">{tx.exchange_name}</span> إلى <span className="font-bold text-white">{tx.to_exchange_name}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-white font-bold">{tx.exchange_name}</div>
                          )}
                          {tx.notes && <div className="text-[10px] text-gray-500 mt-1">{tx.notes}</div>}
                        </td>
                        <td className="p-3 md:p-4 text-left">
                          <div className={`font-mono font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : tx.type === 'WITHDRAW' ? 'text-rose-400' : 'text-cyan-400'}`} dir="ltr">
                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          {tx.fee > 0 && (
                            <div className="text-[10px] text-gray-500 font-mono" dir="ltr">
                              Fee: ${tx.fee.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="p-3 md:p-4 text-center">
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all"
                            title="حذف العملية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}
