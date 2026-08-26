import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQ() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      qAr: 'ما هي منصة LightTracker؟',
      qEn: 'What is LightTracker?',
      aAr: 'منصة LightTracker هي منصة ذكية مصممة لمساعدة المتداولين في تتبع استثماراتهم وصفقاتهم في العملات الرقمية والمعادن الثمينة بدقة وتوفر أدوات متقدمة لحساب الأرباح وإدارة المحافظ.',
      aEn: 'LightTracker is a smart platform designed to help traders accurately track their investments and trades in crypto and precious metals, providing advanced tools for PnL calculation and portfolio management.'
    },
    {
      qAr: 'هل بياناتي آمنة في المنصة؟',
      qEn: 'Is my data secure?',
      aAr: 'نعم، نحن نستخدم أحدث تقنيات التشفير لضمان أمان بياناتك وصفقاتك. المنصة مصممة بأعلى معايير الأمان العالمية.',
      aEn: 'Yes, we use the latest encryption technologies to ensure the security of your data and trades. The platform is built to the highest global security standards.'
    },
    {
      qAr: 'هل يمكنني تتبع أسعار الذهب والفضة اللحظية؟',
      qEn: 'Can I track live Gold and Silver prices?',
      aAr: 'بالتأكيد، توفر المنصة أسعاراً لحظية دقيقة للذهب والفضة معتمدة عالمياً لمساعدتك على تقييم مخزونك بدقة تامة.',
      aEn: 'Absolutely, the platform provides accurate live prices for Gold and Silver globally recognized to help you evaluate your inventory precisely.'
    },
    {
      qAr: 'هل يوجد تطبيق للهواتف المحمولة؟',
      qEn: 'Is there a mobile app?',
      aAr: 'المنصة مصممة بتقنية متجاوبة (Responsive) وتعمل كبرنامج ويب (PWA)، مما يعني أنها تعمل بشكل مثالي وسريع على جميع الأجهزة المحمولة من خلال المتصفح.',
      aEn: 'The platform is responsive and works as a PWA (Progressive Web App), meaning it works perfectly and fast on all mobile devices through the browser.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'إجابات على الأسئلة الأكثر شيوعاً حول المنصة' : 'Answers to the most common questions about the platform'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`glass-panel border rounded-2xl transition-all ${isOpen ? 'border-purple-500/30 bg-white/5' : 'border-white/5 hover:border-white/10'}`}>
              <button 
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
              >
                <h3 className={`font-bold text-lg ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                  {isRtl ? faq.qAr : faq.qEn}
                </h3>
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-500 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>
              {isOpen && (
                <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {isRtl ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
