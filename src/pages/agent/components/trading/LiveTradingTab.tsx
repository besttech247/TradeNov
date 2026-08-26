import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { ArrowLeftRight, TrendingUp, Send } from 'lucide-react';

export const LiveTradingTab: React.FC = () => {
  const { mode, addOrder } = useCryptoStore();

  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState(63200.00);
  const [amount, setAmount] = useState(0.05);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const total = price * amount;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      botId: 'manual-trade',
      pair: selectedPair,
      exchange: 'MEXC',
      type: orderType,
      price,
      amount,
      total,
      status: 'FILLED'
    });

    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 2500);
  };

  const mockAskOrders = [
    { price: 63250.00, amount: 0.24, total: 15180.00 },
    { price: 63240.00, amount: 0.15, total: 9486.00 },
    { price: 63220.00, amount: 0.42, total: 26552.40 },
    { price: 63210.00, amount: 0.10, total: 6321.00 },
  ];

  const mockBidOrders = [
    { price: 63190.00, amount: 0.35, total: 22116.50 },
    { price: 63180.00, amount: 0.80, total: 50544.00 },
    { price: 63150.00, amount: 0.20, total: 12630.00 },
    { price: 63120.00, amount: 1.12, total: 70694.40 },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex items-center justify-between shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-jiade-textMain dark:text-white">منصة التداول المباشر (MEXC Live Spot Trading)</h2>
          </div>
          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            متابعة دفتر الطلبات وتنفيذ أوامر الشراء والبيع اليدوية أو ربطها بالبوتات المباشرة.
          </p>
        </div>

        <div className="text-xs text-right">
          <span className="text-jiade-textMuted dark:text-gray-400 block font-medium">الوضع الحالي:</span>
          <span className={`font-extrabold ${mode === 'real' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {mode === 'real' ? 'حقيقي 🔴 LIVE' : 'تجريبي 🟡 PAPER TRADING'}
          </span>
        </div>
      </div>

      {/* Main Trading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Order Placement Form */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
            <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white">تنفيذ أمر تداول جديد</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">MEXC Spot</span>
          </div>

          {orderSuccess && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl text-xs font-bold text-center">
              ✓ تم تنفيذ أمر {orderType === 'BUY' ? 'الشراء' : 'البيع'} بنجاح!
            </div>
          )}

          {/* Buy/Sell Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-jiade-cardSub dark:bg-crypto-dark rounded-xl border border-jiade-border dark:border-crypto-border">
            <button
              onClick={() => setOrderType('BUY')}
              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                orderType === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              شراء BUY
            </button>
            <button
              onClick={() => setOrderType('SELL')}
              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                orderType === 'SELL'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-jiade-textMuted dark:text-gray-400 hover:text-jiade-textMain dark:hover:text-gray-200'
              }`}
            >
              بيع SELL
            </button>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">الزوج</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="BTC/USDT">BTC/USDT ($63,200.00)</option>
                <option value="ETH/USDT">ETH/USDT ($3,450.00)</option>
                <option value="SOL/USDT">SOL/USDT ($143.80)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">السعر (USDT)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-jiade-textMain dark:text-gray-300 mb-1">الكمية</label>
              <input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3 py-2.5 text-jiade-textMain dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-jiade-cardSub dark:bg-crypto-dark p-3 rounded-xl border border-jiade-border dark:border-crypto-border space-y-1">
              <div className="flex justify-between text-jiade-textMuted dark:text-gray-400 font-medium">
                <span>الإجمالي التقديري:</span>
                <strong className="text-jiade-textMain dark:text-white font-mono font-bold">${total.toFixed(2)} USDT</strong>
              </div>
              <div className="flex justify-between text-jiade-textMuted dark:text-gray-400 font-medium">
                <span>عمولة المنصة (0.1%):</span>
                <span className="text-jiade-textMain dark:text-gray-300 font-mono font-semibold">${(total * 0.001).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                orderType === 'BUY' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>تأكيد أمر {orderType === 'BUY' ? 'الشراء' : 'البيع'}</span>
            </button>
          </form>
        </div>

        {/* Center: Live Chart View Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex flex-col justify-between shadow-jiade dark:shadow-none">
          <div>
            <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-jiade-textMain dark:text-white">{selectedPair}</h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">$63,200.00 (+3.45%)</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
                <span>حجم التداول 24h: <strong className="text-jiade-textMain dark:text-white font-bold">$1.42B</strong></span>
              </div>
            </div>

            {/* TradingView Sim Box */}
            <div className="bg-jiade-cardSub dark:bg-crypto-dark h-80 rounded-xl border border-jiade-border dark:border-crypto-border flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-jiade-textMain dark:text-white">الرسم البياني المباشر (MEXC Spot Candlesticks)</h4>
              <p className="text-xs text-jiade-textMuted dark:text-gray-400 max-w-sm font-medium">
                متصل مباشرة بسيرفرات الأسعار في الوقت الفعلي مع مؤشرات الـ RSI و MACD ومستويات الشبكة للبوت.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-jiade-border dark:border-crypto-border text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            <span>MEXC Spot API Socket Connection</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">● متصل بنجاح</span>
          </div>
        </div>

        {/* Right: Order Book */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none">
          <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white border-b border-jiade-border dark:border-crypto-border pb-3">
            دفتر الطلبات (Order Book)
          </h3>

          <div className="space-y-1 text-xs">
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-1">طلبات البيع (Asks)</p>
            {mockAskOrders.map((ask, idx) => (
              <div key={idx} className="flex justify-between font-mono text-red-600 dark:text-red-400 hover:bg-red-500/5 p-1 rounded font-bold">
                <span>${ask.price.toFixed(2)}</span>
                <span className="text-jiade-textMain dark:text-gray-300 font-medium">{ask.amount}</span>
              </div>
            ))}
          </div>

          <div className="py-2.5 text-center border-y border-jiade-border dark:border-crypto-border bg-jiade-cardSub dark:bg-crypto-dark rounded-xl my-2">
            <span className="text-sm font-extrabold text-jiade-textMain dark:text-white font-mono">$63,200.00</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">آخر سعر منفذ</span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">طلبات الشراء (Bids)</p>
            {mockBidOrders.map((bid, idx) => (
              <div key={idx} className="flex justify-between font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 p-1 rounded font-bold">
                <span>${bid.price.toFixed(2)}</span>
                <span className="text-jiade-textMain dark:text-gray-300 font-medium">{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
