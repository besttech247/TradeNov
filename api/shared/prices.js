export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. جلب سعر الذهب من Yahoo Finance
    const goldRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    let liveGoldPrice = 0;
    if (goldRes.ok) {
      const goldData = await goldRes.json();
      liveGoldPrice = goldData.chart.result[0].meta.regularMarketPrice;
    } else {
      liveGoldPrice = 2500.00; // Fallback
    }

    // 2. جلب أسعار الكريبتو من MEXC (لتجنب حظر Binance للسيرفرات الأمريكية)
    const cryptoRes = await fetch('https://api.mexc.com/api/v3/ticker/price');
    if (!cryptoRes.ok) throw new Error(`MEXC returned ${cryptoRes.status}`);
    const cryptoData = await cryptoRes.json();
    
    const prices = {
      GOLD: liveGoldPrice,
      BTC: parseFloat(cryptoData.find(c => c.symbol === 'BTCUSDT').price),
      ETH: parseFloat(cryptoData.find(c => c.symbol === 'ETHUSDT').price),
      SOL: parseFloat(cryptoData.find(c => c.symbol === 'SOLUSDT').price),
      timestamp: new Date().toISOString()
    };

    res.status(200).json({ status: 'success', data: prices });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'فشل جلب الأسعار الحية', error: error.message });
  }
}
