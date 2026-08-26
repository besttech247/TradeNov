import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText } from 'lucide-react';

export default function Terms() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'الشروط والأحكام' : 'Terms of Service'}
        </h1>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 prose prose-invert max-w-none prose-amber">
        {isRtl ? (
          <>
            <h2>1. الموافقة على الشروط</h2>
            <p>من خلال الوصول إلى المنصة أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>

            <h2>2. استخدام المنصة</h2>
            <p>يجب أن تستخدم المنصة لأغراض قانونية فقط. يُمنع استخدام المنصة في أي نشاط احتيالي أو غير قانوني.</p>

            <h2>3. إخلاء المسؤولية</h2>
            <p>LightTracker هي منصة تتبع وتحليل وليست منصة لتقديم الاستشارات المالية. تقع مسؤولية اتخاذ قرارات التداول عليك وحدك.</p>

            <h2>4. التعديلات على الشروط</h2>
            <p>نحتفظ بالحق في تعديل أو استبدال هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
          </>
        ) : (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using the platform, you agree to be bound by these terms and conditions.</p>

            <h2>2. Use of Platform</h2>
            <p>You must use the platform for lawful purposes only. Using the platform for any fraudulent or illegal activity is prohibited.</p>

            <h2>3. Disclaimer</h2>
            <p>LightTracker is a tracking and analysis platform, not a financial advisory platform. The responsibility for making trading decisions lies solely with you.</p>

            <h2>4. Modifications to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. Users will be notified of any material changes.</p>
          </>
        )}
      </div>
    </div>
  );
}
