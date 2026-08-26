import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Search, RefreshCw, User, Trash2, ArrowUpCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UsersManagementPage() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { lang, t } = useApp();

  const isRtl = lang === 'ar';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsersList(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (id, currentRole) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من تغيير صلاحيات هذا المستخدم؟' : 'Are you sure you want to change this user role?')) return;
    try {
      await api.promoteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا المستخدم بشكل نهائي؟ (سيتم حذف كل بياناته!)' : 'Are you sure you want to delete this user? ALL THEIR DATA WILL BE LOST!')) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            <User className="w-6 h-6 shrink-0" />
            <span>إدارة المستخدمين (Users Management)</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">التحكم بصلاحيات المستخدمين، ترقيتهم، وحذفهم</p>
        </div>
        <button 
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث القائمة
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/20">
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input 
              type="text" 
              placeholder="ابحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 focus:outline-none focus:border-cyan-500/50 text-white text-sm ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
          <div className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            إجمالي المستخدمين: {usersList.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-sm">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-3 md:p-4">المعرف (ID)</th>
                <th className="p-3 md:p-4">اسم المستخدم</th>
                <th className="p-3 md:p-4">البريد الإلكتروني</th>
                <th className="p-3 md:p-4">الباقة الفعالة</th>
                <th className="p-3 md:p-4">تاريخ الانضمام</th>
                <th className="p-3 md:p-4">الصلاحية</th>
                <th className="p-3 md:p-4 text-left rtl:text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-4 sm:p-8 text-center text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />جاري جلب المستخدمين...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-4 sm:p-8 text-center text-gray-400">لا يوجد مستخدمين</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 md:p-4 font-mono text-gray-400">#{u.id}</td>
                    <td className="p-3 md:p-4 font-bold text-white text-base">{u.username}</td>
                    <td className="p-3 md:p-4 text-gray-400">{u.email}</td>
                    <td className="p-3 md:p-4">
                      {u.active_plan && u.active_plan !== "None" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {u.active_plan}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">لا يوجد</span>
                      )}
                    </td>
                    <td className="p-3 md:p-4 font-mono text-gray-400 text-xs">{new Date(u.created_at).toLocaleString()}</td>
                    <td className="p-3 md:p-4 flex gap-1">
                      {u.is_superadmin && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 w-fit block">
                          <ShieldAlert className="w-3 h-3 inline mr-1" /> Admin
                        </span>
                      )}
                      <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 w-fit block">
                        {u.primary_role}
                      </span>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2 justify-start rtl:justify-end">
                        <button
                          onClick={() => handlePromote(u.id, u.is_superadmin)}
                          className={`p-2 rounded-xl border transition-all ${
                            u.is_superadmin 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={u.is_superadmin ? "تخفيض لصلاحية مستخدم" : "ترقية إلى Superadmin"}
                        >
                          <ArrowUpCircle className={`w-4 h-4 ${u.is_superadmin ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                          title="حذف المستخدم نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
