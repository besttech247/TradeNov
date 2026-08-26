import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await api.getMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-300">جاري تحميل بيانات الاشتراك...</div>;
  if (error) return <div className="p-8 text-red-400">خطأ: {error}</div>;

  const activeSub = subscriptions.find(s => s.status === 'ACTIVE');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">إدارة الاشتراك والفواتير</h1>
        <p className="text-slate-400">تابع حالة اشتراكك وسجل المدفوعات الخاصة بك.</p>
      </div>

      {/* Active Subscription Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-400 to-cyan-500"></div>
        <h2 className="text-xl font-bold text-white flex items-center mb-6">
          <CreditCard className="w-5 h-5 ml-2 text-cyan-400" />
          الاشتراك الحالي
        </h2>
        
        {activeSub ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
              <p className="text-sm text-slate-500 mb-1">الخطة الحالية</p>
              <p className="text-xl font-bold text-emerald-400 flex items-center">
                <CheckCircle className="w-4 h-4 ml-2" />
                {activeSub.plan_name}
              </p>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
              <p className="text-sm text-slate-500 mb-1">تاريخ البدء</p>
              <p className="text-lg font-medium text-slate-200">
                {new Date(activeSub.current_period_start).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
              <p className="text-sm text-slate-500 mb-1">تاريخ الانتهاء</p>
              <p className="text-lg font-medium text-slate-200">
                {new Date(activeSub.current_period_end).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-lg text-slate-300 mb-4">ليس لديك اشتراك فعّال حالياً.</p>
            <Link to="/pro/pricing" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:opacity-90 transition inline-block">
              اختر باقة الآن
            </Link>
          </div>
        )}
      </div>

      {/* Invoices History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">سجل الفواتير والمدفوعات</h2>
        {subscriptions.length === 0 ? (
          <p className="text-slate-400">لا يوجد سجل فواتير.</p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map(sub => (
              sub.invoices.map(inv => (
                <div key={inv.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
                      inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                      inv.status === 'AWAITING_PAYMENT' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {inv.status === 'PAID' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-white font-bold">فاتورة اشتراك ({sub.plan_name})</p>
                      <p className="text-sm text-slate-500">{new Date(inv.created_at).toLocaleString('ar-SA')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">المبلغ الإجمالي</p>
                      <p className="text-lg font-bold text-white">${inv.amount_usd}</p>
                    </div>
                    {inv.expected_crypto_amount > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-slate-400">المطلوب بالكريبتو</p>
                        <p className="text-md font-mono text-cyan-400">{inv.expected_crypto_amount} {inv.asset}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm text-slate-400">الحالة</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        inv.status === 'AWAITING_PAYMENT' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {inv.status === 'AWAITING_PAYMENT' ? 'بانتظار الدفع' : inv.status}
                      </span>
                    </div>
                  </div>
                  
                  {inv.status === 'AWAITING_PAYMENT' && inv.deposit_address && (
                    <div className="w-full xl:w-auto bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-right mt-2 xl:mt-0">
                      <p className="text-slate-500 mb-1">أرسل لمحفظة الـ USDT (TRC20):</p>
                      <code className="text-amber-400 select-all block break-all">{inv.deposit_address}</code>
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
