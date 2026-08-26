import React from 'react';
import { useApp } from '../../context/AppContext';
import { Quote, Target, Lightbulb, Users, User, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function AboutUs() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const team = [
    {
      nameAr: 'محمد أمين',
      nameEn: 'Mohammed Amin',
      roleAr: 'المؤسس',
      roleEn: 'Founder',
      image: ''
    },
    {
      nameAr: 'أحمد صالح',
      nameEn: 'Ahmed Saleh',
      roleAr: 'المدير التقني (CTO)',
      roleEn: 'Chief Technology Officer',
      image: ''
    },
    {
      nameAr: 'نورة الخالد',
      nameEn: 'Noura Al-Khaled',
      roleAr: 'مديرة تجربة المستخدم (UX)',
      roleEn: 'UX Director',
      image: ''
    },
    {
      nameAr: 'عمر سعيد',
      nameEn: 'Omar Saeed',
      roleAr: 'كبير المطورين',
      roleEn: 'Lead Developer',
      image: ''
    },
    {
      nameAr: 'سارة عبدالرحمن',
      nameEn: 'Sarah Abdulrahman',
      roleAr: 'مديرة التسويق',
      roleEn: 'Marketing Director',
      image: ''
    },
    {
      nameAr: 'فيصل العتيبي',
      nameEn: 'Faisal Al-Otaibi',
      roleAr: 'رئيس قسم الدعم الفني',
      roleEn: 'Head of Support',
      image: ''
    }
  ];

  const testimonials = [
    {
      nameAr: 'عمر الطريقي',
      nameEn: 'Omar Al-Tariqi',
      typeAr: 'متداول عملات رقمية',
      typeEn: 'Crypto Trader',
      textAr: 'قبل LightTracker، كانت محافظي موزعة على عدة منصات وكنت أجد صعوبة بالغة في حساب سعر التعادل والأرباح الصافية بعد الرسوم. المنصة أنقذتني حرفياً من فوضى الإكسيل وساعدتني في اتخاذ قرارات دقيقة للبيع.',
      textEn: 'Before LightTracker, my portfolios were scattered across multiple exchanges. The platform literally saved me from Excel chaos and helped me make accurate selling decisions.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop'
    },
    {
      nameAr: 'د. عبدالله النعيم',
      nameEn: 'Dr. Abdullah Al-Naim',
      typeAr: 'مستثمر في المعادن الثمينة',
      typeEn: 'Precious Metals Investor',
      textAr: 'تتبع السبائك الذهبية والفضية ومعرفة قيمتها اللحظية بناءً على العيار كان أمراً مرهقاً. الآن بضغطة زر أرى صافي ثروتي بالذهب محدثة بالثانية. تجربة مستخدم لا تضاهى.',
      textEn: 'Tracking gold and silver bullion based on karat was exhausting. Now, with a click, I see my net wealth updated to the second. Unmatched UX.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      nameAr: 'ليلى منصور',
      nameEn: 'Laila Mansour',
      typeAr: 'متداولة يومية',
      typeEn: 'Day Trader',
      textAr: 'صانع الاستراتيجيات غير طريقتي في التداول. القدرة على تقسيم الأهداف ووقف الخسارة بشكل مسبق ورؤيتها تتنفذ على المحفظة جعلتني أتداول بـ "نفسية مرتاحة" وبدون عاطفة.',
      textEn: 'The Strategy Factory changed how I trade. Being able to split targets and stop losses in advance made me trade with "peace of mind" and zero emotion.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1642543348745-03b1219733d9?q=80&w=2000&auto=format&fit=crop" alt="Hero Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-sm mb-6 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
            {isRtl ? 'نصنع الوضوح المالي' : 'Creating Financial Clarity'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            {isRtl ? 'من الفوضى إلى الاحترافية.' : 'From Chaos to Professionalism.'}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              {isRtl ? 'قصة LightTracker' : 'The LightTracker Story'}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {isRtl 
              ? 'لم تكن المنصة مجرد فكرة تجارية، بل كانت حلاً جذرياً لمعاناة حقيقية يعيشها كل متداول ومستثمر يبحث عن تنظيم صفقاته واتخاذ قرارات مبنية على أرقام دقيقة.' 
              : 'The platform wasn’t just a business idea; it was a radical solution to the real struggles every trader faces trying to organize trades and make data-driven decisions.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 space-y-32">
        
        {/* Story Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
              alt="Data Analysis" 
              className="relative z-10 rounded-3xl border border-white/10 shadow-2xl"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {isRtl ? 'كيف بدأت الفكرة؟' : 'How Did It Start?'}
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
              <p>
                {isRtl 
                  ? 'بدأت القصة في أروقة الأسواق المالية الصاخبة. كنا نرى المتداولين يغرقون في ملفات "الإكسيل" المعقدة، والأوراق المتناثرة، ويحاولون عبثاً تذكر أسعار الدخول ورسوم المنصات التي تلتهم أرباحهم بصمت.' 
                  : 'The story began in the noisy corridors of financial markets. We saw traders drowning in complex Excel sheets, trying in vain to remember entry prices and exchange fees that silently ate their profits.'}
              </p>
              <p>
                {isRtl 
                  ? 'الخطأ في حساب "سعر التعادل" أو نسيان تدوين صفقة كان يكلف الكثير من المال. من هنا، وُلدت فكرة LightTracker: منصة ذكية، نقية، وسهلة الاستخدام، تقوم بكل العمليات الحسابية المعقدة خلف الكواليس، لتعطيك رقماً واحداً واضحاً: هل أنت رابح أم خاسر؟ وماذا يجب أن تفعل الآن؟' 
                  : 'A miscalculation in the "break-even price" or forgetting to log a trade cost a lot of money. Hence, LightTracker was born: a smart, clean, and intuitive platform that does all the complex math behind the scenes to give you one clear answer: Are you winning or losing?'}
              </p>
            </div>
          </div>
        </section>

        {/* Problem Solving Section */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12">
            {isRtl ? 'كيف نغير قواعد اللعبة؟' : 'How We Change The Game'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors text-right">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{isRtl ? 'دقة متناهية' : 'Absolute Precision'}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {isRtl 
                  ? 'وداعاً للتقريب العشوائي. نحسب لك العمولات، أسعار التعادل اللحظية، والأرباح الصافية الحقيقية.' 
                  : 'Goodbye rough estimates. We calculate commissions, live break-even prices, and true net profits.'}
              </p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors text-right">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{isRtl ? 'قرارات استثمارية ناجحة' : 'Successful Decisions'}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {isRtl 
                  ? 'رؤيتك لمحفظتك بوضوح تام، مقسمة بين معادن وعملات واستراتيجيات، تمنحك الثقة لاتخاذ القرار الصحيح في الوقت المناسب.' 
                  : 'Seeing your portfolio clearly, split between metals, crypto, and strategies, gives you confidence to make the right call.'}
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors text-right">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{isRtl ? 'نمو مستدام' : 'Sustainable Growth'}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {isRtl 
                  ? 'الأدوات التي نوفرها تجعلك تتعلم من أخطائك السابقة وتبني استراتيجيات أكثر نجاحاً للمستقبل.' 
                  : 'The tools we provide let you learn from past mistakes and build more successful strategies for the future.'}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              {isRtl ? 'ماذا يقول مستخدمونا؟' : 'What Our Users Say'}
            </h2>
            <p className="text-gray-400">
              {isRtl ? 'نفخر بأننا جزء من نجاح هؤلاء المتداولين' : 'We are proud to be part of their success'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/5 relative">
                <Quote className="w-10 h-10 text-white/5 absolute top-6 right-6" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <img src={testi.image} alt="User" className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/20" />
                  <div>
                    <h4 className="text-white font-bold">{isRtl ? testi.nameAr : testi.nameEn}</h4>
                    <span className="text-xs text-cyan-400">{isRtl ? testi.typeAr : testi.typeEn}</span>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm relative z-10 italic">
                  "{isRtl ? testi.textAr : testi.textEn}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              {isRtl ? 'العقول خلف المنصة' : 'The Minds Behind The Platform'}
            </h2>
            <p className="text-gray-400">
              {isRtl ? 'فريق من الخبراء التقنيين والمتداولين بشغف واحد' : 'A team of tech experts and traders with one passion'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <div key={idx} className="group">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors bg-white/5 flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <User className="w-20 h-20 text-gray-500 group-hover:text-cyan-500 transition-colors duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{isRtl ? member.nameAr : member.nameEn}</h4>
                <p className="text-cyan-400 text-sm font-medium">{isRtl ? member.roleAr : member.roleEn}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
