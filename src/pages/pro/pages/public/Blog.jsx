import React from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Blog() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const articles = [
    {
      id: 1,
      titleAr: 'كيف تبدأ تداول الذهب؟ الدليل الشامل',
      titleEn: 'How to start trading Gold? The Comprehensive Guide',
      excerptAr: 'تعرف على أساسيات تداول الذهب، العيارات المختلفة، وكيفية حساب الأرباح والخسائر بسهولة باستخدام منصتنا.',
      excerptEn: 'Learn the basics of gold trading, different karats, and how to calculate PnL easily using our platform.',
      date: '10 Aug 2026',
      tag: 'المعادن الثمينة',
      image: 'https://images.unsplash.com/photo-1610969622935-77987823f669?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      titleAr: 'أهم 5 استراتيجيات لتداول العملات الرقمية',
      titleEn: 'Top 5 Strategies for Crypto Trading',
      excerptAr: 'اكتشف الاستراتيجيات الأكثر نجاحاً في سوق الكريبتو وكيف يمكنك تطبيقها باستخدام صانع الاستراتيجيات الخاص بنا.',
      excerptEn: 'Discover the most successful strategies in the crypto market and how you can apply them using our Strategy Builder.',
      date: '05 Aug 2026',
      tag: 'الكريبتو',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      titleAr: 'ما هو سعر التعادل ولماذا يعتبر مهماً جداً؟',
      titleEn: 'What is Break-Even Price and why is it crucial?',
      excerptAr: 'شرح مبسط لكيفية حساب سعر التعادل الذي يجنبك الخسارة وكيف تقوم المنصة بحسابه تلقائياً لجميع صفقاتك.',
      excerptEn: 'A simple explanation of how to calculate the break-even price to avoid losses, and how our platform does it automatically.',
      date: '28 Jul 2026',
      tag: 'تعليمي',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'المدونة والتعليم' : 'Blog & Education'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'مقالات، شروحات، ونصائح لتطوير مهاراتك في التداول' : 'Articles, guides, and tips to improve your trading skills'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer">
            <div className="h-48 overflow-hidden relative">
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                {article.tag}
              </div>
              <img src={article.image} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <div className="text-xs text-gray-500 mb-3">{article.date}</div>
              <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors">
                {isRtl ? article.titleAr : article.titleEn}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                {isRtl ? article.excerptAr : article.excerptEn}
              </p>
              <Link to={`/blog/${article.id}`} className="flex items-center gap-2 text-emerald-400 font-bold text-sm hover:text-emerald-300 transition-colors w-fit">
                <span>{isRtl ? 'اقرأ المزيد' : 'Read More'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
