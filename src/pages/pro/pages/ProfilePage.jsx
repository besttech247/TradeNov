import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle2, LayoutTemplate } from 'lucide-react';
import WelcomeOnboarding from '../components/WelcomeOnboarding';

export default function ProfilePage() {
  const { user, t } = useApp();
  const isRtl = t('dir') === 'rtl';

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.new_password) {
      if (formData.new_password !== formData.confirm_password) {
        setError(isRtl ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
        setLoading(false);
        return;
      }
      if (!formData.current_password) {
        setError(isRtl ? 'يجب إدخال كلمة المرور الحالية لتغييرها' : 'Current password is required');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        email: formData.email || null,
        phone: formData.phone || null,
      };

      if (formData.new_password) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
      }

      await api.updateProfile(payload);
      setSuccess(isRtl ? 'تم تحديث بياناتك بنجاح!' : 'Profile updated successfully!');
      
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || (isRtl ? 'حدث خطأ أثناء التحديث' : 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6" dir={t('dir')}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
          <User className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{isRtl ? 'الملف الشخصي' : 'My Profile'}</h1>
          <p className="text-sm text-gray-400">{isRtl ? 'إدارة بيانات حسابك وكلمة المرور' : 'Manage your account details and password'}</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300 font-medium">{success}</p>
          </div>
        )}

        {/* Workspace Preference Section */}
        <div className="mb-8 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <LayoutTemplate className="w-5 h-5 text-cyan-400" />
              {isRtl ? 'بيئة العمل المفضلة' : 'Preferred Workspace'}
            </h3>
            <p className="text-sm text-gray-400">
              {isRtl 
                ? 'تخصيص الواجهة لتناسب اهتمامك (كريبتو، ذهب، أو كلاهما).' 
                : 'Customize the interface to suit your interests (Crypto, Gold, or both).'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-bold transition-all whitespace-nowrap"
          >
            {isRtl ? 'تعديل بيئة العمل' : 'Change Workspace'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {isRtl ? 'البيانات الأساسية' : 'Basic Info'}
            </h3>
            
            <div>
              <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'اسم المستخدم' : 'Username'}</label>
              <input 
                type="text"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
                value={user?.username || ''}
                disabled
              />
              <span className="text-xs text-gray-500 mt-1 block">{isRtl ? 'لا يمكن تغيير اسم المستخدم.' : 'Username cannot be changed.'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="email"
                    className={`w-full p-3 ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} rounded-xl glass-input`}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="tel"
                    className={`w-full p-3 ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} rounded-xl glass-input font-mono`}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              {isRtl ? 'اترك الحقول فارغة إذا لم تكن ترغب في تغيير كلمة المرور.' : 'Leave fields blank if you do not want to change your password.'}
            </p>

            <div>
              <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'كلمة المرور الحالية' : 'Current Password'}</label>
              <input 
                type="password"
                className="w-full p-3 rounded-xl glass-input"
                value={formData.current_password}
                onChange={e => setFormData({...formData, current_password: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input 
                  type="password"
                  className="w-full p-3 rounded-xl glass-input"
                  value={formData.new_password}
                  onChange={e => setFormData({...formData, new_password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm font-medium">{isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <input 
                  type="password"
                  className="w-full p-3 rounded-xl glass-input"
                  value={formData.confirm_password}
                  onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors opacity-50 cursor-not-allowed"
              >
                {isRtl ? 'نسيت كلمة المرور؟ (قريباً)' : 'Forgot Password? (Coming Soon)'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                isRtl ? 'جاري الحفظ...' : 'Saving...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      
      {showOnboarding && <WelcomeOnboarding onComplete={() => setShowOnboarding(false)} />}
    </div>
  );
}
