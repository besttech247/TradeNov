import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'آخر تحديث: 12 أغسطس 2026' : 'Last updated: August 12, 2026'}
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 prose prose-invert max-w-none prose-cyan">
        {isRtl ? (
          <>
            <h2>1. جمع المعلومات</h2>
            <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة عندما تقوم بإنشاء حساب، مثل اسمك وبريدك الإلكتروني. كما نجمع بيانات تتعلق بتفاعلك مع منصتنا لتحسين تجربة المستخدم.</p>
            
            <h2>2. استخدام المعلومات</h2>
            <p>نستخدم معلوماتك لـ:</p>
            <ul>
              <li>توفير وصيانة وتحسين خدماتنا.</li>
              <li>معالجة المعاملات وإرسال الإشعارات المتعلقة بها.</li>
              <li>الرد على تعليقاتك وأسئلتك وتقديم خدمة العملاء.</li>
            </ul>

            <h2>3. أمان البيانات</h2>
            <p>نحن نتخذ تدابير معقولة للمساعدة في حماية معلوماتك من الفقد أو السرقة أو سوء الاستخدام والوصول غير المصرح به.</p>

            <h2>4. مشاركة المعلومات</h2>
            <p>نحن لا نبيع معلوماتك الشخصية. قد نشارك المعلومات فقط لتلبية القوانين التنظيمية أو لحماية حقوق المنصة.</p>
          </>
        ) : (
          <>
            <h2>1. Information Collection</h2>
            <p>We collect information you provide directly to us when you create an account, such as your name and email. We also collect data regarding your interaction with our platform to improve user experience.</p>
            
            <h2>2. Use of Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related notifications.</li>
              <li>Respond to your comments, questions, and provide customer service.</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.</p>

            <h2>4. Sharing of Information</h2>
            <p>We do not sell your personal information. We may share information only to comply with regulatory laws or to protect the platform's rights.</p>
          </>
        )}
      </div>
    </div>
  );
}
