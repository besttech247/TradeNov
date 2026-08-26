import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Mail, Clock, Download, Search } from 'lucide-react';

export default function WaitlistManagementPage() {
  const { lang, theme } = useApp();
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const data = await api.getWaitlist();
      setEntries(data);
    } catch (error) {
      console.error(error);
      alert(isRtl ? 'حدث خطأ في جلب بيانات قائمة الانتظار' : 'Failed to fetch waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + "ID,Email,Date\n" + entries.map(e => `${e.id},${e.email},${new Date(e.created_at).toLocaleString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "waitlist_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries.filter(e => e.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-400" />
            <span>{isRtl ? 'إدارة قائمة الانتظار (Waitlist)' : 'Waitlist Management'}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isRtl ? `إجمالي المسجلين: ${entries.length} مستخدم` : `Total Registered: ${entries.length} users`}
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl hover:bg-emerald-500/30 flex items-center gap-2 font-bold transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder={isRtl ? "البحث بالبريد الإلكتروني..." : "Search by email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 bg-transparent border-none outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
        />
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            {isRtl ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {isRtl ? 'لا يوجد مسجلين حتى الآن.' : 'No registrations yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" dir={isRtl ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="p-4"># ID</th>
                  <th className="p-4">{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="p-4">{isRtl ? 'تاريخ التسجيل' : 'Registration Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">#{entry.id}</td>
                    <td className="p-4 font-bold text-sm">
                      <a href={`mailto:${entry.email}`} className="hover:text-emerald-400 transition-colors">
                        {entry.email}
                      </a>
                    </td>
                    <td className="p-4 text-gray-400 text-sm flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(entry.created_at).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
