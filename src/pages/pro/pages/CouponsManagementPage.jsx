import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Tag, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CouponsManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newCode, setNewCode] = useState('');
  const [discountValue, setDiscountValue] = useState(10);
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode || discountValue <= 0) return alert("الرجاء إدخال بيانات صحيحة");
    
    setIsCreating(true);
    try {
      await api.createCoupon({
        code: newCode,
        discount_value: parseFloat(discountValue),
        discount_type: discountType
      });
      setNewCode('');
      setDiscountValue(10);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      await api.deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-slate-300">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-red-400">خطأ: {error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">إدارة الكوبونات</h1>
        <p className="text-slate-400">إصدار كوبونات خصم للمستخدمين والمسوقين.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Plus className="w-5 h-5 ml-2 text-cyan-400" />
          إضافة كوبون جديد
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">كود الكوبون (مثال: SAVE20)</label>
            <input 
              type="text" 
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 uppercase"
              placeholder="CODE"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">قيمة الخصم</label>
            <input 
              type="number" 
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              placeholder="10"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">نوع الخصم</label>
            <select 
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="PERCENTAGE">نسبة مئوية (%)</option>
              <option value="FIXED_USD">مبلغ ثابت ($)</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isCreating}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 h-[50px]"
          >
            {isCreating ? 'جاري الإضافة...' : 'إنشاء الكوبون'}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3 md:p-4">كود الكوبون</th>
              <th className="p-3 md:p-4">قيمة الخصم</th>
              <th className="p-3 md:p-4">تاريخ الإنشاء</th>
              <th className="p-3 md:p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {coupons.length === 0 ? (
              <tr><td colSpan="4" className="p-4 sm:p-8 text-center text-slate-400">لا توجد كوبونات</td></tr>
            ) : (
              coupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 md:p-4">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">{c.code}</span>
                  </td>
                  <td className="p-3 md:p-4 font-bold">
                    {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `$${c.discount_value}`}
                  </td>
                  <td className="p-3 md:p-4 text-slate-400">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="p-3 md:p-4">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="حذف"
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
  );
}
