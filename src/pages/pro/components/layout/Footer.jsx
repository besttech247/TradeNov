import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, HelpCircle, Mail, Info, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <footer className="bg-black/40 border-t border-white/5 pt-12 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1">
            <Link to="/pro/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-black text-sm">LT</span>
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                LightTracker
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              {isRtl 
                ? 'منصتك الاحترافية لتتبع وإدارة صفقات العملات الرقمية والمعادن الثمينة بذكاء.' 
                : 'Your professional platform for smartly tracking and managing crypto and precious metals trades.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'الروابط السريعة' : 'Quick Links'}</h4>
            <ul className="space-y-3">
              <li><Link to="/pro/pricing" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسعار والاشتراكات' : 'Pricing'}</Link></li>
              <li><Link to="/pro/market" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسواق' : 'Markets'}</Link></li>
              <li><Link to="/pro/blog" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'المدونة' : 'Blog'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'المساعدة والدعم' : 'Help & Support'}</h4>
            <ul className="space-y-3">
              <li><Link to="/pro/faq" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link to="/pro/contact" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'تواصل معنا' : 'Contact Us'}</Link></li>
              <li><Link to="/pro/about" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'من نحن' : 'About Us'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'قانوني' : 'Legal'}</h4>
            <ul className="space-y-3">
              <li><Link to="/pro/privacy" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="/pro/terms" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الشروط والأحكام' : 'Terms of Service'}</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LightTracker. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Made with ❤️ for Traders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
