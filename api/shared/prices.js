// Vercel Serverless Function: Shared Price Feed
export default async function handler(req, res) {
  // تفعيل CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. جلب سعر الذهب الحي من Yahoo Finance (GC=F)
    const goldRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const goldData = await goldRes.json();
    const liveGoldPrice = goldData.chart.result[0].meta.regularMarketPrice;

    // 2. جلب أسعار الكريبتو الأساسية من Binance
    const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]');
    const cryptoData = await cryptoRes.json();
    
    // تنسيق الرد للمنظومة
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
