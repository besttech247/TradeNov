import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Filter, HelpCircle, History, TrendingUp, TrendingDown, Edit, CheckCircle2, XCircle, Target, DollarSign } from 'lucide-react';
import { calculateTradePurchase, generateTradeTargets } from '../utils/mathEngine';
import CloseTradeModal from '../components/trades/CloseTradeModal';
import { usePriceFlash } from '../hooks/usePriceFlash';

function PortfolioRow({ item, fmt, handleOpenCloseModalFromPortfolio }) {
  const isProfit = item.unrealizedPnlUsd >= 0;
  const TrendIcon = isProfit ? TrendingUp : TrendingDown;
  const flashClass = usePriceFlash(item.livePrice);

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-3 md:p-4 font-bold text-white font-sans">{item.symbol}</td>
      <td className="p-3 md:p-4 font-sans text-gray-300">{item.exchange_name}</td>
      <td className="p-3 md:p-4 font-sans text-cyan-300">{item.strategy_name}</td>
      <td className="p-3 md:p-4 font-sans">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          item.category === 'Short-Term'
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
        }`}>
          {item.category === 'Short-Term' ? 'مضاربة' : 'استثمار'}
        </span>
      </td>
      <td className="p-3 md:p-4 text-emerald-400 font-bold" dir="ltr">${fmt(item.averageCost, 4)}</td>
      <td className={`p-4 font-bold text-white transition-colors ${flashClass}`} dir="ltr">${fmt(item.livePrice, 4)}</td>
      <td className="p-3 md:p-4 font-bold" dir="ltr">{fmt(item.currentQuantity, 4)}</td>
      <td className="p-3 md:p-4 text-gray-300 font-bold" dir="ltr">${fmt(item.totalInvestedRemaining, 2)}</td>
      <td className="p-3 md:p-4 text-white font-bold" dir="ltr">${fmt(item.currentValue, 2)}</td>
      <td className="p-3 md:p-4 font-sans">
        <div className={`flex items-center gap-1.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
          <TrendIcon className="w-4 h-4 shrink-0" />
          <span>{isProfit ? '+' : ''}${fmt(item.unrealizedPnlUsd, 2)}</span>
          <span className="text-xs opacity-70">({isProfit ? '+' : ''}{fmt(item.unrealizedPnlPct, 1)}%)</span>
        </div>
      </td>
      <td className="p-3 md:p-4 text-right font-sans">
        {item.currentQuantity > 0 && (
          <button
            onClick={() => handleOpenCloseModalFromPortfolio(item)}
            title="إغلاق المركز"
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-white transition-all ml-auto"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </td>
    </tr>
  );
}

export default function CoinPortfolioPage() {
  const { coinPortfolios, trades, updateTrade, exchanges, strategies, t, isFetchingPrices } = useApp();

  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');

  // Trade Closing Modal State
  const [closingTrade, setClosingTrade] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Format Display Helper
  const fmt = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Extract unique coins, exchanges, and strategies for filter dropdowns
  const coinsList = Array.from(new Set(coinPortfolios.map((item) => item.symbol)));
  const exchangesList = Array.from(new Set(coinPortfolios.map((item) => item.exchange_name)));
  const strategiesList = Array.from(new Set(coinPortfolios.map((item) => item.strategy_name)));

  // Filter Active Portfolio Items
  const filteredPortfolios = coinPortfolios.filter((item) => {
    if (item.currentQuantity <= 0) return false;
    const matchCoin = selectedCoin === 'ALL' || item.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || item.exchange_name === selectedExchange;
    const matchStrat = selectedStrategy === 'ALL' || item.strategy_name === selectedStrategy;
    return matchCoin && matchEx && matchStrat;
  });

  const filteredTradesForStats = trades.filter((tr) => {
    const matchCoin = selectedCoin === 'ALL' || tr.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || tr.exchange_name === selectedExchange;
    const matchStrat = selectedStrategy === 'ALL' || tr.strategy_name === selectedStrategy;
    return matchCoin && matchEx && matchStrat;
  });

  const calculateGlobalStats = () => {
    let totalInvested = 0;
    let currentValue = 0;
    let unrealizedPnl = 0;
    let realizedPnl = 0;

    filteredPortfolios.forEach(item => {
      totalInvested += item.totalInvestedRemaining;
      currentValue += item.currentValue;
      unrealizedPnl += item.unrealizedPnlUsd;
      realizedPnl += item.realizedPnlUsd;
    });

    let openTrades = 0;
    let closedTrades = 0;
    filteredTradesForStats.forEach(tr => {
      if (tr.status === 'CLOSED') closedTrades++;
      else openTrades++;
    });

    return { totalInvested, currentValue, unrealizedPnl, realizedPnl, openTrades, closedTrades };
  };

  const stats = calculateGlobalStats();

  // Open Close Modal
  const handleOpenCloseModal = (trade) => {
    setClosingTrade(trade);
    setShowCloseModal(true);
  };

  const handleSaveCloseModal = (finalTrade) => {
    updateTrade(finalTrade);
    setShowCloseModal(false);
    setClosingTrade(null);
  };

  const handleOpenCloseModalFromPortfolio = (item) => {
    const openTrades = trades.filter(tr => 
      tr.symbol === item.symbol && 
      tr.exchange_name === item.exchange_name && 
      tr.strategy_name === item.strategy_name && 
      tr.status !== 'CLOSED'
    );
    if (openTrades.length > 0) {
      const oldestOpenTrade = openTrades.sort((a,b) => a.id - b.id)[0];
      handleOpenCloseModal(oldestOpenTrade);
    } else {
      alert("لا توجد صفقات مفتوحة لهذه العملة!");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="text-gray-400 text-xs mb-1 font-bold">إجمالي المستثمر</div>
          <div className="text-xl font-bold font-mono text-white">${fmt(stats.totalInvested, 2)}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="text-gray-400 text-xs mb-1 font-bold">القيمة الحالية</div>
          <div className="text-xl font-bold font-mono text-cyan-300">${fmt(stats.currentValue, 2)}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="text-gray-400 text-xs mb-1 font-bold">الأرباح العائمة (Unrealized)</div>
          <div className={`text-xl font-bold font-mono flex items-center gap-1 ${stats.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.unrealizedPnl >= 0 ? '+' : ''}${fmt(stats.unrealizedPnl, 2)}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="text-gray-400 text-xs mb-1 font-bold">الأرباح المحققة (Realized)</div>
          <div className={`text-xl font-bold font-mono flex items-center gap-1 ${stats.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.realizedPnl >= 0 ? '+' : ''}${fmt(stats.realizedPnl, 2)}
          </div>
        </div>
      </div>
      
      {/* Secondary Stats */}
      <div className="flex gap-4">
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs text-gray-300 font-bold">صفقات مفتوحة:</span>
          <span className="text-sm font-bold text-white font-mono">{stats.openTrades}</span>
        </div>
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          <span className="text-xs text-gray-300 font-bold">صفقات مغلقة:</span>
          <span className="text-sm font-bold text-white font-mono">{stats.closedTrades}</span>
        </div>
      </div>
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>{t('coinPortfolioTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('coinPortfolioDesc')}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('autoUpdatedBinance')}</span>
          </span>
        </div>
      </div>

      {/* Strict Average Purchase Cost Rules Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
        <div className="font-bold flex items-center gap-2 text-amber-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{t('avgCostNoteTitle')}</span>
        </div>
        <p>{t('avgCostNote1')}</p>
        <p>{t('avgCostNote2')}</p>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-300 shrink-0 sm:col-span-2 md:col-span-1">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{t('actionFilter')}:</span>
        </div>

        {/* Filter 1: Coin Filter */}
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[130px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allCoins')}</option>
          {coinsList.map((symbol) => (
            <option key={symbol} value={symbol} className="bg-gray-900">
              {symbol}
            </option>
          ))}
        </select>

        {/* Filter 2: Exchange Filter */}
        <select
          value={selectedExchange}
          onChange={(e) => setSelectedExchange(e.target.value)}
          className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[140px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allExchanges')}</option>
          {exchangesList.map((exName) => (
            <option key={exName} value={exName} className="bg-gray-900">
              {exName}
            </option>
          ))}
        </select>

        {/* Filter 3: Strategy Filter */}
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="w-full md:w-auto p-2.5 rounded-xl glass-input text-white font-semibold min-w-[150px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allStrategies')}</option>
          {strategiesList.map((stName) => (
            <option key={stName} value={stName} className="bg-gray-900">
              {stName}
            </option>
          ))}
        </select>
      </div>

      {/* Active Positions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{t('activePositionsTitle')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-3 md:p-4">{t('symbol')}</th>
                <th className="p-3 md:p-4">{t('exchange')}</th>
                <th className="p-3 md:p-4">{t('strategy')}</th>
                <th className="p-3 md:p-4">{t('statusLabel')}</th>
                <th className="p-3 md:p-4">{t('totalQuantity')}</th>
                <th className="p-3 md:p-4">{t('averageCost')}</th>
                <th className="p-3 md:p-4">{t('totalInvested')}</th>
                <th className="p-3 md:p-4">{t('livePrice')}</th>
                <th className="p-3 md:p-4">{t('currentValue')}</th>
                <th className="p-3 md:p-4">{t('unrealizedPnl')}</th>
                <th className="p-3 md:p-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {filteredPortfolios.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-4 sm:p-6 text-center text-gray-500 font-sans">
                    لا يوجد مراكز نشطة تطابق التصفية.
                  </td>
                </tr>
              ) : (
                filteredPortfolios.map((item, idx) => (
                  <PortfolioRow 
                    key={idx} 
                    item={item} 
                    fmt={fmt} 
                    handleOpenCloseModalFromPortfolio={handleOpenCloseModalFromPortfolio} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Closing Modal Dialog */}
      {showCloseModal && closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onClose={() => {
            setShowCloseModal(false);
            setClosingTrade(null);
          }}
          onSave={handleSaveCloseModal}
        />
      )}
    </div>
  );
}
