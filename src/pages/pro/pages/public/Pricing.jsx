import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { CheckCircle2, Sparkles, Lock, ArrowRight, Mail, BellRing } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Pricing() {
  const { lang, theme } = useApp();
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Waitlist State
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // Static waitlist mode: No need to fetch plans from backend
    setLoading(false);
  }, [isRtl]);

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await api.joinWaitlist(email);
      setJoined(true);
      setEmail('');
    } catch (err) {
      alert(isRtl ? "حدث خطأ أثناء التسجيل، أو أن البريد مسجل مسبقاً." : "Error joining waitlist or email already registered.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Features mapping
  const featuresList = [
    { id: 'crypto', labelAr: 'تتبع وإدخال الصفقات', labelEn: 'Trade Entry & Tracking', free: 'حد أقصى 10 صفقات', pro: 'غير محدود', elite: 'غير محدود' },
    { id: 'dashboard', labelAr: 'الداشبورد العام والتحليلات', labelEn: 'Overview Dashboard & Analytics', free: true, pro: true, elite: true },
    { id: 'strategies', labelAr: 'بناء الاستراتيجيات المخصصة', labelEn: 'Custom Strategy Builder', free: 'حد أقصى 2 استراتيجية', pro: 'غير محدود', elite: 'غير محدود' },
    { id: 'gold', labelAr: 'مركز إدارة وتداول الذهب', labelEn: 'Gold Hub (Karats & Grams)', free: false, pro: true, elite: true },
    { id: 'alerts', labelAr: 'تنبيهات العجز النقدي المتقدمة', labelEn: 'Advanced Cash Deficit Alerts', free: false, pro: true, elite: true },
    { id: 'support', labelAr: 'أولوية الدعم الفني الفوري (VIP)', labelEn: 'Priority VIP Support', free: false, pro: true, elite: 'أولوية قصوى 24/7' },
    { id: 'reports', labelAr: 'تصدير التقارير (PDF/Excel)', labelEn: 'Export Reports (PDF/Excel)', free: false, pro: false, elite: true },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold font-sans text-slate-400">
          {isRtl ? 'جاري تحميل الباقات...' : 'Loading plans...'}
        </p>
      </div>
    );
  }

  // Static waitlist plans
  const displayedPlans = [
    { id: 1, name: isRtl ? 'الباقة الأساسية' : 'Basic Plan', type: 'free', plan_code: 'FREE' },
    { id: 2, name: isRtl ? 'باقة المحترفين' : 'Pro Plan', type: 'pro', plan_code: 'PRO' },
    { id: 3, name: isRtl ? 'باقة النخبة' : 'Elite Lifetime', type: 'elite', plan_code: 'ELITE' }
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="py-8 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 selection:bg-cyan-500/30 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold backdrop-blur-md ${
          isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <BellRing className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>{isRtl ? 'النسخة التجريبية المغلقة - الإطلاق الرسمي قريباً' : 'Closed Beta - Official Launch Coming Soon'}</span>
        </div>

        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isRtl ? 'نظام الباقات الخاص بالمنصة' : 'Platform Subscription Plans'}
        </h1>

        <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {isRtl 
            ? 'نعمل حالياً على وضع اللمسات الأخيرة قبل الإطلاق الرسمي. تعرف على مميزات الباقات القادمة وسجل بريدك لتكون أول من يعلم!' 
            : 'We are putting the final touches before our official launch. Check out our upcoming plans and join the waitlist!'}
        </p>
      </div>

      {/* Pricing Cards Grid (No Prices) */}
      <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl gap-8 mx-auto items-center">
        {displayedPlans.map((plan) => {
          const isFree = plan.type === 'free';
          const isPro = plan.type === 'pro';
          const isElite = plan.type === 'elite';
          
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${
                isPro 
                  ? `transform md:scale-105 z-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-white ${isDark ? '' : 'md:scale-105'}` 
                  : isDark 
                  ? 'bg-slate-900/60 border-white/10 hover:border-slate-400/40 text-white' 
                  : 'bg-white border-slate-200 shadow-md hover:border-cyan-300 text-slate-900'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-lg border border-white/20 whitespace-nowrap">
                  {isRtl ? 'التجربة الكاملة 🌟' : 'Full Experience 🌟'}
                </div>
              )}
              
              <div className="space-y-2 mb-8 text-center border-b border-white/10 pb-6">
                <h3 className={`text-3xl font-black ${isPro ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm font-bold px-3 py-1 inline-block rounded-full mt-2 ${isPro ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-500/20 text-slate-400'}`}>
                  {isRtl ? 'الأسعار تعلن قريباً' : 'Pricing TBA'}
                </p>
              </div>
              
              {/* Dynamic Features List */}
              <ul className="mb-4 flex-1 space-y-4 text-sm">
                {featuresList.map((feat) => {
                  let hasFeature = false;
                  if (isFree) hasFeature = feat.free;
                  else if (isPro) hasFeature = feat.pro;
                  else if (isElite) hasFeature = feat.elite;

                  const label = isRtl ? feat.labelAr : feat.labelEn;
                  
                  if (hasFeature === false) {
                    // Feature Locked
                    return (
                      <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-white/40' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Lock className="w-5 h-5 shrink-0 opacity-50" />
                        <span className="line-through decoration-slate-500/50">{label}</span>
                      </li>
                    );
                  }

                  if (typeof hasFeature === 'string') {
                    // Feature with specific text (e.g., limit)
                    return (
                      <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-slate-200' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPro ? 'text-cyan-400' : 'text-emerald-500'}`} />
                        <span>{label} <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-bold ml-1">{hasFeature}</span></span>
                      </li>
                    );
                  }

                  // Standard Feature included
                  return (
                    <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-slate-200' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPro ? 'text-cyan-400' : 'text-emerald-500'}`} />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Waitlist Section */}
      <div id="waitlist" className={`max-w-3xl mx-auto rounded-3xl p-8 md:p-12 text-center border relative overflow-hidden ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-white/10' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-xl'}`}>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          
          <h2 className={`text-3xl md:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isRtl ? 'كن من أوائل المنضمين للنسخة الرسمية!' : 'Join the Official Release Waitlist!'}
          </h2>
          
          <p className={`text-base md:text-lg max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isRtl 
              ? 'سجل بريدك الإلكتروني الآن لتحصل على دعوة دخول مبكرة، بالإضافة إلى خصم حصري خاص بأعضاء القائمة عند الإطلاق.' 
              : 'Register your email now to get early access and an exclusive discount for waitlist members upon launch.'}
          </p>

          {joined ? (
            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl inline-block">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg justify-center">
                <CheckCircle2 className="w-6 h-6" />
                <span>{isRtl ? 'تم التسجيل بنجاح! شكراً لاهتمامك.' : 'Successfully Joined! Thank you.'}</span>
              </div>
              <p className="text-sm text-emerald-500/70 mt-2">
                {isRtl ? 'سنقوم بمراسلتك فور إطلاق النسخة الرسمية.' : 'We will notify you as soon as the official version launches.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRtl ? 'right-4' : 'left-4'}`}>
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRtl ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                  className={`w-full py-3.5 px-4 ${isRtl ? 'pr-12' : 'pl-12'} rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="py-3.5 px-6 rounded-xl font-bold transition-all duration-200 border active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-white/20 hover:opacity-90 whitespace-nowrap shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRtl ? 'سجلني الآن' : 'Join Now'}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
