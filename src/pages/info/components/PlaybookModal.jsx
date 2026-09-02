import React from 'react';
import { X, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';

export const PlaybookModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto info-glass-panel p-6 border-white/15 info-custom-scroll text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white">📖 دليل وتعليمات استخدام الاستراتيجيات (Trading Playbook)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 text-sm leading-relaxed text-white/80">
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            🎯 الهدف: دمج التحليل الأساسي ومؤشرات السيولة الفيدرالية مع التحليل الفني الدقيق لاقتناص صفقات ذات نسبة نجاح استثنائية.
          </div>

          {/* Section 1: Fed Rate */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <span>🏦</span>
              <span>1. مؤشر الفائدة الفيدرالية (Fed Funds Rate Impact)</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-text-muted pr-2">
              <li>
                <strong className="text-emerald-400">احتمال خفض الفائدة (&gt; 50%):</strong> بيئة تيسير نقدي (Dovish)؛ تدعم تدفق السيولة الرخيصة نحو الذهب (Gold)، والبيتكوين (BTC)، والأسهم الأمريكية.
              </li>
              <li>
                <strong className="text-rose-400">احتمال رفع الفائدة / تشديد:</strong> بيئة تشديد نقدي (Hawkish)؛ تؤدي لسحب السيولة من الأسواق الخطرة وتكديسها في السندات الحكومية والدولار الأمريكي.
              </li>
              <li>
                <strong className="text-amber-400">تثبيت الفائدة (Neutral Hold):</strong> استقرار مؤقت وترقب صدور بيانات التضخم ومؤشرات التوظيف (CPI / NFP).
              </li>
            </ul>
          </div>

          {/* Section 2: DXY */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <span>💵</span>
              <span>2. مؤشر الدولار الأمريكي (DXY Correlation)</span>
            </h3>
            <p className="text-xs text-text-muted">
              حركة مؤشر الدولار ترتبط بعلاقة عكسية وثيقة مع السلع والمعادن والعملات المشفرة. عندما يهبط DXY، تتلقى الأسواق زخماً صعودياً إضافياً يؤكد صلاحية إشارات الشراء الفنية في مؤشرات EWO و MACD.
            </p>
          </div>

          {/* Section 3: Macro + Tech confluence */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <span>🌊</span>
              <span>3. تركيبة الصفقة المثالية (Macro + Technical Confluence)</span>
            </h3>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>بيئة الفائدة:</strong> ترجيح خفض الفائدة بنسبة تفوق 50%.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>مشاعر السوق:</strong> مؤشر Fear & Greed في منطقة خوف شديد (&lt; 30) كفرصة تجميع استراتيجية.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>التأكيد الفني:</strong> ارتداد EWO فوق الصفر أو دايفرجنس إيجابي على فريم 4H أو 1D مدعوماً بكسر منطقة القيمة VAH في مؤشر TPO.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Indicators Cheat Sheet */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <span>📊</span>
              <span>4. دليل المؤشرات الستة السريع</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">🌊 EWO:</strong> يقيس الفارق بين SMA 5 و 35 لرصد انتهاء الموجة 4 وبدء الموجة 5 الدافعة.
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">📊 RSI:</strong> ارتداد فوق مستوى 30 أو اختراق صاعد لمستوى 50 يؤكد تسارع الزخم.
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">⚡ MACD:</strong> التقاطع الذهبي لخط الماكد فوق خط الإشارة يعطي إشارة دخول موثوقة.
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">🏹 Supertrend:</strong> فلتر تحديد الاتجاه؛ تحول اللون للأخضر (Buy Flip) يؤكد الترند الصاعد.
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">💥 TTM Squeeze:</strong> انضغاط البولنجر داخل كيلتنر يعني تجميع طاقة، وخروجه يعني انفجار سعري عنيف.
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white">🎯 Market Profile (TPO):</strong> خط POC هو المغناطيس السعري، والتداول فوق VAH إشارة كسر صاعد حقيقي.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
