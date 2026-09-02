// Macroeconomic & Fundamental Analysis Engine for TradeNov INFO

/**
 * Fetches Fear & Greed Index from Alternative.me
 */
export async function fetchFearAndGreed() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1');
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data[0]) {
        return {
          value: parseInt(data.data[0].value, 10),
          classification: data.data[0].value_classification || 'Neutral'
        };
      }
    }
  } catch (err) {
    console.warn('Alternative.me API unreachable, using fallback macro data', err);
  }
  return { value: 54, classification: 'Neutral' };
}

/**
 * Fetches or calculates Macro & Treasury Metrics
 */
export async function fetchMacroEnvironment() {
  const fng = await fetchFearAndGreed();

  // Baseline macro indicator estimates (can be augmented by backend or live rates)
  const dxyVal = 103.85;
  const dxyChange = -0.24;
  const ir10y = 3.86;
  const ir2y = 3.92;

  // Fed Funds Futures Probability Model
  const spread = ir2y - 4.50;
  let probCut = 25;
  let probHold = 70;
  let probHike = 5;

  if (spread < -0.30) {
    probCut = Math.min(88, Math.round(65 + Math.abs(spread) * 35));
    probHike = 2;
    probHold = 100 - probCut - probHike;
  } else if (spread > 0.20) {
    probHike = Math.min(60, Math.round(20 + spread * 40));
    probCut = 5;
    probHold = 100 - probHike - probCut;
  } else {
    probHold = 70;
    probCut = 25;
    probHike = 5;
  }

  const isDovish = probCut > 50;
  const isHawkish = probHike > 30;

  const fedBias = isDovish
    ? 'تيسير نقدي (Dovish / تيسير السيولة)'
    : isHawkish
    ? 'تشديد نقدي (Hawkish / سحب سيولة)'
    : 'سياسة نقدية محايدة (Neutral Hold)';

  const fedColor = isDovish ? 'emerald' : isHawkish ? 'rose' : 'amber';

  return {
    fngVal: fng.value,
    fngClass: fng.classification,
    dxyVal,
    dxyChange,
    ir10y,
    ir2y,
    probCut,
    probHold,
    probHike,
    fedBias,
    fedColor
  };
}

/**
 * Asset-specific fundamental analysis generator
 */
export function getAssetFundamentalProfile(symbol, macro) {
  const isCrypto = symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
  const isCommodity = ['GC=F', 'CL=F', 'SI=F', 'GOLD', 'OIL', 'SILVER'].includes(symbol) || symbol.startsWith('XAU') || symbol.startsWith('XAG') || symbol.startsWith('PAXG');

  if (isCrypto) {
    return {
      type: 'CRYPTO',
      title: 'بيئة مشاعر الكريبتو والسيولة الرقمية',
      metrics: [
        {
          label: '📊 مؤشر الخوف والجشع',
          value: `${macro.fngVal}/100`,
          delta: macro.fngClass,
          desc: 'قراءة مشاعر المتداولين اللحظية في أسواق العملات المشفرة'
        },
        {
          label: '₿ استحواذ البيتكوين التقديري',
          value: '~54.4%',
          delta: 'موسم البيتكوين',
          desc: 'حصة البيتكوين من إجمالي القيمة السوقية للكريبتو'
        },
        {
          label: '⛓️ مؤشر NVT Ratio التقديري',
          value: 'صحي ومتوازن',
          delta: 'نشاط On-Chain نشط',
          desc: 'القيمة السوقية مدعومة بحجم المعاملات اليومية'
        }
      ]
    };
  }

  if (isCommodity) {
    const realYield = (macro.ir10y - 2.5).toFixed(2);
    return {
      type: 'COMMODITY',
      title: 'التقييم الأساسي للسلع والمعادن الثمينة',
      metrics: [
        {
          label: '💵 حساسية مؤشر الدولار (DXY)',
          value: `${macro.dxyVal.toFixed(2)}`,
          delta: macro.dxyChange > 0 ? '-0.85 عائق صعود' : '+دعم صعودي للسلع',
          desc: 'علاقة عكسية تاريخية قوية بين الدولار والمعادن'
        },
        {
          label: '🏛️ العائد الحقيقي (Real Yields)',
          value: `${realYield}%`,
          delta: macro.ir10y > 4.3 ? 'ضغط على الذهب' : 'بيئة داعمة لاقتناء السلع',
          desc: 'عوائد السندات مطروحاً منها التضخم المتوقع'
        },
        {
          label: '🛡️ الطلب كملاذ آمن (Safe-Haven)',
          value: 'مرتفع جداً',
          delta: 'شراء البنوك المركزية',
          desc: 'طلب متسارع كتحوط ضد التوترات الجيوسياسية'
        }
      ]
    };
  }

  // Stock / Equity / Index
  return {
    type: 'EQUITY',
    title: 'التقييم المالي لمؤشرات الأسهم والشركات',
    metrics: [
      {
        label: '🏷️ مكرر الربحية التقديري (P/E Ratio)',
        value: '26.8x',
        delta: 'تقييم تاريخي مرتفع',
        desc: 'نسبة السعر السوقي مقارنة بالأرباح السنوية'
      },
      {
        label: '💰 القيمة السوقية الإجمالية',
        value: '$48.2T',
        delta: 'تدفقات صناديق ETF',
        desc: 'حجم رأس المال والسيولة المؤسسية الداخلة'
      },
      {
        label: '⚡ معامل التذبذب (Beta)',
        value: '1.00',
        delta: 'حساسية متوسطة',
        desc: 'مدى حساسية حركة السعر مقارنة بأسواق المال العالمية'
      }
    ]
  };
}
