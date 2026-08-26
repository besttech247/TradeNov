import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Activity, Search, RefreshCw, User, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const { lang, t } = useApp();

  const isRtl = lang === 'ar';

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs(200);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user?.username).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const userMatchSearch = log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const actionMatchSearch = log.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const detailsMatchSearch = log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const searchMatch = userMatchSearch || actionMatchSearch || detailsMatchSearch;
    const filterMatch = selectedUserFilter === 'ALL' || log.user?.username === selectedUserFilter;
    
    return searchMatch && filterMatch;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-rose-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span>سجل نشاطات النظام (Audit Logs)</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">مراقبة حية لكل الأحداث التي تجري في المنصة</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث السجل
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row items-center gap-4 bg-black/20">
          <div className="relative flex-1 w-full max-w-md">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input 
              type="text" 
              placeholder="ابحث عن كلمة، أو حدث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 focus:outline-none focus:border-cyan-500/50 text-white text-sm ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
          
          {/* User Filter Dropdown */}
          <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
            <span className="text-gray-400 text-sm">فلترة بالمستخدم:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-xl py-2 px-4 focus:outline-none focus:border-cyan-500/50 min-w-[150px]"
            >
              <option value="ALL" className="bg-gray-900">الكل (All Users)</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user} className="bg-gray-900">{user}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-400 font-mono mr-auto">
            عرض آخر 200 عملية
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-sm">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-3 md:p-4">الوقت والتاريخ</th>
                <th className="p-3 md:p-4">المستخدم</th>
                <th className="p-3 md:p-4">نوع الحدث</th>
                <th className="p-3 md:p-4">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="p-4 sm:p-8 text-center text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />جاري جلب السجلات...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="4" className="p-4 sm:p-8 text-center text-gray-400">لا يوجد سجلات مطابقة للبحث</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 md:p-4 whitespace-nowrap text-gray-400 font-mono text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-[10px] font-bold">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-rose-300 font-mono">
                          {log.user ? log.user.username : 'نظام'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 font-mono">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                        log.action_type.includes('DELETE') ? 'bg-rose-500/20 text-rose-400' :
                        log.action_type.includes('CREATE') ? 'bg-emerald-500/20 text-emerald-400' :
                        log.action_type.includes('UPDATE') ? 'bg-cyan-500/20 text-cyan-400' :
                        log.action_type.includes('LOGIN') ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-gray-300">
                      {log.details || '-'}
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
