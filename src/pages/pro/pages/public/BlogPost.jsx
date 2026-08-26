import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ArrowLeft, Clock, Calendar, User, Share2, Tag } from 'lucide-react';

const articlesData = [
  {
    id: 1,
    titleAr: 'كيف تبدأ تداول الذهب؟ الدليل الشامل',
    titleEn: 'How to start trading Gold? The Comprehensive Guide',
    date: '10 Aug 2026',
    readTimeAr: '5 دقائق قراءة',
    readTimeEn: '5 min read',
    authorAr: 'فريق التحرير',
    authorEn: 'Editorial Team',
    tagAr: 'المعادن الثمينة',
    tagEn: 'Precious Metals',
    image: 'https://images.unsplash.com/photo-1610969622935-77987823f669?q=80&w=1200&auto=format&fit=crop',
    contentAr: `
      <h2>مقدمة في تداول الذهب</h2>
      <p>يُعد الذهب الملاذ الآمن تاريخياً وأحد أهم الأصول التي يبحث عنها المستثمرون لحماية ثرواتهم من التضخم وتقلبات الأسواق. في هذا الدليل، سنتعرف على أساسيات تداول الذهب وكيف يمكنك الاستفادة منه.</p>
      
      <h2>فهم العيارات (Karats)</h2>
      <p>يُقاس الذهب بالعيار، وهو مؤشر على نقاوة الذهب:</p>
      <ul>
        <li><strong>عيار 24:</strong> الذهب الخالص بنسبة 99.9%، ويُستخدم عادة في السبائك الاستثمارية.</li>
        <li><strong>عيار 21:</strong> يحتوي على 87.5% ذهب، وهو الأكثر شيوعاً في المجوهرات في الشرق الأوسط.</li>
        <li><strong>عيار 18:</strong> يحتوي على 75% ذهب، ويُفضل للمجوهرات التي تتطلب صلابة عالية.</li>
      </ul>
      <p>من المهم جداً عند تداول الذهب أو تخزينه أن تعرف كيفية حساب الوزن الصافي (المعادل لعيار 24) لتقييم محفظتك بدقة.</p>
      
      <h2>تتبع صفقات الذهب بذكاء</h2>
      <p>من خلال منصة <strong>LightTracker</strong>، لم يعد تتبع الذهب عملية معقدة. يمكنك إدخال تفاصيل صفقاتك (الوزن، العيار، وسعر الدخول)، وستقوم المنصة تلقائياً بـ:</p>
      <ul>
        <li>تحويل الأوزان المختلفة إلى الوزن الصافي (عيار 24).</li>
        <li>مقارنة أسعار الدخول بالسعر العالمي اللحظي للذهب.</li>
        <li>حساب الربح العائم والمحقق بدقة متناهية.</li>
      </ul>
      
      <h2>الخلاصة</h2>
      <p>الاستثمار في الذهب يتطلب فهماً واضحاً للسوق وتسجيلاً دقيقاً للصفقات. باستخدام الأدوات المناسبة، يمكنك تحويل هذا الاستثمار التقليدي إلى استثمار مدار باحترافية عالية.</p>
    `,
    contentEn: `
      <h2>Introduction to Gold Trading</h2>
      <p>Historically, gold has been the safe haven and one of the most important assets investors seek to protect their wealth from inflation and market volatility. In this guide, we will cover the basics of gold trading and how you can benefit from it.</p>
      
      <h2>Understanding Karats</h2>
      <p>Gold is measured in karats, which indicates its purity:</p>
      <ul>
        <li><strong>24K:</strong> 99.9% pure gold, commonly used in investment bullion.</li>
        <li><strong>21K:</strong> Contains 87.5% gold, very popular for jewelry in the Middle East.</li>
        <li><strong>18K:</strong> Contains 75% gold, preferred for jewelry requiring high durability.</li>
      </ul>
      <p>When trading or storing gold, it is crucial to know how to calculate the net pure weight (24K equivalent) to evaluate your portfolio accurately.</p>
      
      <h2>Tracking Gold Trades Smartly</h2>
      <p>With <strong>LightTracker</strong>, tracking gold is no longer complicated. You can enter your trade details (weight, karat, and entry price), and the platform will automatically:</p>
      <ul>
        <li>Convert different weights to net pure weight (24K).</li>
        <li>Compare your entry prices with the live global gold price.</li>
        <li>Calculate your unrealized and realized PnL with absolute precision.</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Investing in gold requires a clear understanding of the market and accurate record-keeping. With the right tools, you can turn this traditional investment into a professionally managed asset.</p>
    `
  },
  {
    id: 2,
    titleAr: 'أهم 5 استراتيجيات لتداول العملات الرقمية',
    titleEn: 'Top 5 Strategies for Crypto Trading',
    date: '05 Aug 2026',
    readTimeAr: '8 دقائق قراءة',
    readTimeEn: '8 min read',
    authorAr: 'فريق التحرير',
    authorEn: 'Editorial Team',
    tagAr: 'الكريبتو',
    tagEn: 'Crypto',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop',
    contentAr: `
      <h2>مقدمة</h2>
      <p>سوق العملات الرقمية يتميز بالتقلبات السريعة، مما يجعل الاعتماد على العشوائية أمراً خطيراً. الاستراتيجية الواضحة هي مفتاح النجاح. إليك أهم 5 استراتيجيات يستخدمها المحترفون.</p>
      
      <h2>1. متوسط التكلفة بالدولار (DCA)</h2>
      <p>استراتيجية تعتمد على استثمار مبلغ ثابت على فترات منتظمة (مثلاً كل أسبوع)، بغض النظر عن سعر العملة. هذا يقلل من تأثير التقلبات ويخفض متوسط سعر الدخول على المدى الطويل.</p>
      
      <h2>2. التداول الشبكي (Grid Trading)</h2>
      <p>تعتمد على وضع أوامر شراء وبيع متعددة عند مستويات أسعار محددة سلفاً أعلى وأسفل السعر الحالي. تعمل بشكل ممتاز في الأسواق العرضية (الجانبية).</p>
      
      <h2>3. تتبع الاتجاه (Trend Following)</h2>
      <p>تتمثل في الشراء عندما يكون السوق في مسار صاعد، والبيع عندما يبدأ مسار هابط. يتطلب ذلك استخدام مؤشرات فنية مثل المتوسطات المتحركة.</p>
      
      <h2>4. التداول السريع (Scalping)</h2>
      <p>تنفيذ عدد كبير من الصفقات السريعة بهدف تحقيق أرباح صغيرة من كل صفقة. تتطلب هذه الاستراتيجية وقتاً وجهداً وتواجداً مستمراً أمام الشاشات.</p>
      
      <h2>5. صانع الاستراتيجيات في LightTracker</h2>
      <p>مهما كانت استراتيجيتك، يمكنك استخدام <strong>صانع الاستراتيجيات (Strategy Factory)</strong> في منصتنا لتحديد أهداف الربح (Take Profit) ووقف الخسارة (Stop Loss) مقدماً وتوزيع أوزانها بشكل تلقائي على صفقاتك.</p>
    `,
    contentEn: `
      <h2>Introduction</h2>
      <p>The cryptocurrency market is highly volatile, making random decisions dangerous. A clear strategy is the key to success. Here are the top 5 strategies used by professionals.</p>
      
      <h2>1. Dollar Cost Averaging (DCA)</h2>
      <p>A strategy involving investing a fixed amount at regular intervals (e.g., weekly), regardless of the asset's price. This reduces the impact of volatility and lowers the average entry price over the long term.</p>
      
      <h2>2. Grid Trading</h2>
      <p>Involves placing multiple buy and sell orders at predefined price levels above and below the current price. It works exceptionally well in ranging (sideways) markets.</p>
      
      <h2>3. Trend Following</h2>
      <p>Buying when the market is in an upward trend and selling when a downward trend begins. This requires using technical indicators like moving averages.</p>
      
      <h2>4. Scalping</h2>
      <p>Executing a large number of quick trades aiming for small profits from each. This strategy requires significant time, effort, and continuous screen presence.</p>
      
      <h2>5. LightTracker's Strategy Builder</h2>
      <p>Whatever your strategy, you can use the <strong>Strategy Factory</strong> in our platform to pre-define your Take Profit and Stop Loss targets and automatically distribute their weights across your trades.</p>
    `
  },
  {
    id: 3,
    titleAr: 'ما هو سعر التعادل ولماذا يعتبر مهماً جداً؟',
    titleEn: 'What is Break-Even Price and why is it crucial?',
    date: '28 Jul 2026',
    readTimeAr: '4 دقائق قراءة',
    readTimeEn: '4 min read',
    authorAr: 'فريق التحرير',
    authorEn: 'Editorial Team',
    tagAr: 'تعليمي',
    tagEn: 'Educational',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
    contentAr: `
      <h2>تعريف سعر التعادل (Break-Even Price)</h2>
      <p>سعر التعادل هو السعر الذي يجب أن يصل إليه الأصل الاستثماري حتى لا تحقق ربحاً ولا خسارة. بعبارة أخرى، هو السعر الذي يغطي تماماً تكلفة الشراء بالإضافة إلى أي رسوم تداول (Fees) مدفوعة.</p>
      
      <h2>لماذا يعتبر سعر التعادل مهماً؟</h2>
      <p>العديد من المتداولين يتجاهلون رسوم المنصات عند حساب أرباحهم. قد تظن أنك رابح لأن السعر الحالي أعلى من سعر الشراء، ولكن بعد خصم الرسوم قد تجد نفسك في خسارة!</p>
      <ul>
        <li><strong>وضوح الرؤية:</strong> يخبرك بالضبط متى تبدأ في تحقيق أرباح حقيقية صافية.</li>
        <li><strong>التصحيح (Averaging Down):</strong> عند شراء كميات إضافية بأسعار أقل لتقليل الخسارة، يتغير سعر التعادل، وتصبح بحاجة لمعرفته بدقة لمعرفة متى تخرج من الصفقة.</li>
      </ul>
      
      <h2>حساب التعادل مع LightTracker</h2>
      <p>لحسن الحظ، لا تحتاج لاستخدام الجداول المعقدة أو الآلة الحاسبة. منصة <strong>LightTracker</strong> تقوم تلقائياً بحساب متوسط التكلفة وسعر التعادل اللحظي لكل عملة أو معدن في محفظتك، آخذة في الاعتبار جميع الرسوم وجميع الصفقات المفتوحة والمغلقة جزئياً.</p>
    `,
    contentEn: `
      <h2>Definition of Break-Even Price</h2>
      <p>The break-even price is the price an asset must reach for you to make neither a profit nor a loss. In other words, it’s the price that fully covers the purchase cost plus any paid trading fees.</p>
      
      <h2>Why is the Break-Even Price Important?</h2>
      <p>Many traders ignore exchange fees when calculating their profits. You might think you're in profit because the current price is higher than your entry price, but after deducting fees, you might actually be in a loss!</p>
      <ul>
        <li><strong>Clarity:</strong> It tells you exactly when you start making real, net profits.</li>
        <li><strong>Averaging Down:</strong> When buying more quantities at lower prices to mitigate losses, the break-even price changes. You need to know it accurately to plan your exit.</li>
      </ul>
      
      <h2>Calculating Break-Even with LightTracker</h2>
      <p>Fortunately, you don't need complex spreadsheets or a calculator. <strong>LightTracker</strong> automatically calculates the average cost and live break-even price for every coin or metal in your portfolio, accounting for all fees and all open/partially closed trades.</p>
    `
  }
];

export default function BlogPost() {
  const { id } = useParams();
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  
  const [article, setArticle] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = articlesData.find(a => String(a.id) === String(id));
    setArticle(found);
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <h2 className="text-white text-2xl font-bold">{isRtl ? 'المقال غير موجود' : 'Article Not Found'}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/pro/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8">
        {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        <span className="font-bold">{isRtl ? 'العودة للمدونة' : 'Back to Blog'}</span>
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-cyan-400 mb-4 font-bold text-sm">
          <Tag className="w-4 h-4" />
          <span>{isRtl ? article.tagAr : article.tagEn}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {isRtl ? article.titleAr : article.titleEn}
        </h1>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? article.authorAr : article.authorEn}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{isRtl ? article.readTimeAr : article.readTimeEn}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-cyan-500/10 border border-white/10">
        <img src={article.image} alt="Article Cover" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div 
        className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-cyan-400 prose-strong:text-cyan-300"
        dangerouslySetInnerHTML={{ __html: isRtl ? article.contentAr : article.contentEn }}
      />
      
      {/* Share / Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
        <div className="text-white font-bold text-lg">
          {isRtl ? 'هل أعجبك المقال؟' : 'Did you like the article?'}
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-gray-300 font-bold transition-all border border-white/10 hover:border-cyan-500/30">
          <Share2 className="w-5 h-5" />
          {isRtl ? 'شارك المقال' : 'Share'}
        </button>
      </div>
    </div>
  );
}
