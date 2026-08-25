import React, { useState, useEffect } from 'react';
import { TrendingUp, Send, Wallet, ArrowLeftRight, Activity } from 'lucide-react';
import { calculateCoinPortfolio, calculateOverviewMetrics } from '../../shared/utils/mathEngine';

export default function Terminal() {
  const [livePrices, setLivePrices] = useState({ BTC: 63200, ETH: 3450, SOL: 143.80 });
  const [selectedPair, setSelectedPair] = useState('BTC');
  const [orderType, setOrderType] = useState('BUY');
  const [price, setPrice] = useState(63200);
  const [amount, setAmount] = useState(0.05);
  
  // Dummy DB trades for Portfolio simulation
  const [trades, setTrades] = useState([
    { id: 1, symbol: 'BTC', exchange_id: 'MEXC', strategy_id: 'manual', quantity: 0.1, entry_price: 60000, calculated_fee: 6, status: 'CLOSED' },
    { id: 2, symbol: 'ETH', exchange_id: 'MEXC', strategy_id: 'manual', quantity: 2, entry_price: 3200, calculated_fee: 6.4, status: 'CLOSED' },
  ]);

  // Dummy exchanges
  const exchanges = [{ id: 'MEXC', initial_cash_balance: 10000 }];

  useEffect(() => {
    // Fetch real prices from central API
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/shared/prices');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setLivePrices(data.data);
            if (selectedPair === 'BTC') setPrice(data.data.BTC);
          }
        }
      } catch (err) {
        console.error('Failed to fetch prices', err);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // 10s update
    return () => clearInterval(interval);
  }, []);

  // Update form price on pair change
  useEffect(() => {
    if (livePrices[selectedPair]) {
      setPrice(livePrices[selectedPair]);
    }
  }, [selectedPair, livePrices]);

  // Calculate Portfolio using light_Tracker_V4 mathEngine
  const coinPortfolios = calculateCoinPortfolio({ trades, livePrices });
  const overview = calculateOverviewMetrics({ exchanges, coinPortfolios });

  const total = price * amount;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const newTrade = {
      id: Date.now(),
      symbol: selectedPair,
      exchange_id: 'MEXC',
      strategy_id: 'manual',
      quantity: amount,
      entry_price: price,
      calculated_fee: total * 0.001,
      status: 'CLOSED'
    };
    setTrades([...trades, newTrade]);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold">Total Portfolio (Net Worth)</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-white">
            ${overview.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold">Cash Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${overview.totalCashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold">Invested Value</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${overview.totalInvestedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold">Unrealized PnL</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className={`text-2xl font-black ${overview.totalUnrealizedPnlUsd >= 0 ? 'text-success' : 'text-danger'}`}>
            {overview.totalUnrealizedPnlUsd >= 0 ? '+' : ''}${overview.totalUnrealizedPnlUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trading Terminal */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" /> 
                Terminal (Spot)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-background/50 rounded-xl mb-4">
              <button
                onClick={() => setOrderType('BUY')}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  orderType === 'BUY'
                    ? 'bg-success text-white'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setOrderType('SELL')}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  orderType === 'SELL'
                    ? 'bg-danger text-white'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                SELL
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-text-muted mb-1">Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary font-bold"
                >
                  <option value="BTC">BTC/USDT (${livePrices.BTC?.toLocaleString()})</option>
                  <option value="ETH">ETH/USDT (${livePrices.ETH?.toLocaleString()})</option>
                  <option value="SOL">SOL/USDT (${livePrices.SOL?.toLocaleString()})</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1">Price (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1">Amount</label>
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="bg-background/50 p-3 rounded-xl border border-white/10 space-y-1">
                <div className="flex justify-between text-text-muted font-medium">
                  <span>Total:</span>
                  <strong className="text-white font-mono font-bold">${total.toFixed(2)} USDT</strong>
                </div>
                <div className="flex justify-between text-text-muted font-medium">
                  <span>Est. Fee (0.1%):</span>
                  <span className="text-white font-mono">${(total * 0.001).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  orderType === 'BUY' 
                    ? 'bg-success hover:bg-success/80 shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
                    : 'bg-danger hover:bg-danger/80 shadow-[0_0_15px_rgba(255,51,102,0.2)]'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Confirm {orderType}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Portfolio Assets */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-primary" />
            Asset Portfolio & PnL
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-text-muted border-b border-white/10 pb-2">
                  <th className="pb-3 font-bold">Asset</th>
                  <th className="pb-3 font-bold">Balance</th>
                  <th className="pb-3 font-bold">Avg Cost</th>
                  <th className="pb-3 font-bold">Live Price</th>
                  <th className="pb-3 font-bold">Unrealized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {coinPortfolios.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-white/5 transition-all">
                    <td className="py-3 font-bold flex items-center gap-2">
                      {asset.symbol}
                    </td>
                    <td className="py-3 font-mono">{asset.currentQuantity.toFixed(4)}</td>
                    <td className="py-3 font-mono">${asset.averageCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 font-mono">${asset.livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3">
                      <div className={`font-mono font-bold ${asset.unrealizedPnlUsd >= 0 ? 'text-success' : 'text-danger'}`}>
                        {asset.unrealizedPnlUsd >= 0 ? '+' : ''}${asset.unrealizedPnlUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-[10px] ml-1">({asset.unrealizedPnlPct.toFixed(2)}%)</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {coinPortfolios.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-text-muted">No assets in portfolio</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
