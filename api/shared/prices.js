export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
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

    // 2. Fetch 24hr ticker data from MEXC for rich UI
    const cryptoRes = await fetch('https://api.mexc.com/api/v3/ticker/24hr');
    if (!cryptoRes.ok) throw new Error(`MEXC returned ${cryptoRes.status}`);
    const cryptoData = await cryptoRes.json();
    
    const findCrypto = (sym) => {
      const c = cryptoData.find(x => x.symbol === sym);
      return c ? {
        price: parseFloat(c.lastPrice),
        change24h: parseFloat(c.priceChangePercent),
        volume: parseFloat(c.quoteVolume)
      } : { price: 0, change24h: 0, volume: 0 };
    };

    const prices = {
      GOLD: { price: liveGoldPrice, change24h: 0, volume: 0 },
      BTC: findCrypto('BTCUSDT'),
      ETH: findCrypto('ETHUSDT'),
      SOL: findCrypto('SOLUSDT'),
      PEPE: findCrypto('PEPEUSDT'),
      XRP: findCrypto('XRPUSDT'),
      KAS: findCrypto('KASUSDT'),
      timestamp: new Date().toISOString()
    };

    res.status(200).json({ status: 'success', data: prices });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'فشل جلب الأسعار الحية', error: error.message });
  }
}
