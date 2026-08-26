import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Users, DollarSign, ExternalLink, Activity, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prof, comms] = await Promise.all([
        api.getAffiliateProfile(),
        api.getAffiliateCommissions()
      ]);
      setProfile(prof);
      setStats(comms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const link = `http://localhost:5174/register?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAddress) return alert("الرجاء إدخال عنوان المحفظة");
    if (stats.total_cleared <= 0) return alert("لا يوجد رصيد قابل للسحب");
    
    setIsWithdrawing(true);
    try {
      await api.requestAffiliateWithdrawal(withdrawAddress);
      alert("تم إرسال طلب السحب بنجاح. سيتم مراجعته من قبل الإدارة.");
      setWithdrawAddress('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-300">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-red-400">خطأ: {error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">نظام التسويق بالعمولة</h1>
        <p className="text-slate-400">انشر رابطك واربح عمولة على كل عميل يشترك عن طريقك.</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-500 to-pink-500"></div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <ExternalLink className="w-5 h-5 ml-2 text-purple-400" />
          رابط الإحالة الخاص بك
        </h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-cyan-400 select-all overflow-x-auto whitespace-nowrap">
            http://localhost:5174/register?ref={profile?.referral_code}
          </div>
          <button 
            onClick={handleCopy}
            className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center min-w-[120px] ${
              copied ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {copied ? <><CheckCircle className="w-5 h-5 ml-2" /> تم النسخ</> : <><Copy className="w-5 h-5 ml-2" /> انسخ الرابط</>}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">الرصيد القابل للسحب</p>
              <h3 className="text-3xl font-black text-emerald-400">${stats.total_cleared.toFixed(2)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500">أرباح مؤكدة وجاهزة للتحويل.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">الرصيد المعلق</p>
              <h3 className="text-3xl font-black text-amber-400">${stats.total_pending.toFixed(2)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500">أرباح قيد المراجعة أو بانتظار فترة السماح.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">عدد الإحالات الناجحة</p>
              <h3 className="text-3xl font-black text-white">{stats.history.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500">إجمالي العمليات المسجلة باسمك.</p>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white mb-6">طلب سحب الأرباح (TRC20)</h2>
        <form onSubmit={handleWithdraw} className="max-w-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">عنوان محفظة الـ USDT (شبكة Tron TRC20)</label>
            <input 
              type="text" 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              placeholder="T..."
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isWithdrawing || stats.total_cleared <= 0}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? 'جاري الطلب...' : 'إرسال طلب السحب'}
          </button>
        </form>
      </div>

    </div>
  );
}
