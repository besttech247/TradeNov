import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    const res = await register(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'فشل إنشاء الحساب، ربما اسم المستخدم موجود مسبقاً');
    }
  };

  return (
    <div className="flex items-center justify-center p-4 mt-10" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            Light Tracker
          </h1>
          <p className="text-[var(--text-secondary)]">إنشاء حساب جديد</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-panel)] space-y-6 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                اسم المستخدم
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>إنشاء حساب</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="mt-8 text-center text-[var(--text-secondary)]">
            لديك حساب بالفعل؟{' '}
            <Link to="/pro/login" className="text-cyan-500 hover:text-cyan-400 font-bold transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
