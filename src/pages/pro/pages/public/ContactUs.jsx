import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'تواصل معنا' : 'Contact Us'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'نحن هنا للإجابة على جميع استفساراتك' : 'We are here to answer all your inquiries'}
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10">
        {sent ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{isRtl ? 'تم الإرسال بنجاح!' : 'Message Sent Successfully!'}</h3>
            <p className="text-gray-400">{isRtl ? 'سنقوم بالرد عليك في أقرب وقت ممكن.' : 'We will get back to you as soon as possible.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'الاسم' : 'Name'}</label>
              <input type="text" required className="w-full p-4 rounded-xl glass-input text-white" placeholder={isRtl ? 'أدخل اسمك' : 'Enter your name'} />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input type="email" required className="w-full p-4 rounded-xl glass-input text-white" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'الرسالة' : 'Message'}</label>
              <textarea required rows="5" className="w-full p-4 rounded-xl glass-input text-white resize-none" placeholder={isRtl ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}></textarea>
            </div>
            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" />
              {isRtl ? 'إرسال الرسالة' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
