import "./agent.css";
import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNavBar from './components/layout/BottomNavBar';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import TradingTerminal from './components/trading/TradingTerminal';
import BotsHub from './components/dashboard/BotsHub';
import WalletManager from './components/dashboard/WalletManager';
import SettingsPanel from './components/dashboard/SettingsPanel';
import EmergencyButton from './components/dashboard/EmergencyButton';
import AssistantChat from "./components/dashboard/AssistantChat";

export default function AgentApp() {
  // Page Navigation state ('dashboard', 'trading', 'bots', 'wallet', 'settings')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Theme Management ('dark' | 'light')
  const [theme, setTheme] = useState('dark');

  // Exchange balances
  const [balances, setBalances] = useState({
    MEXC: 5430.00,
    Binance: 12850.50,
    Bybit: 8400.20
  });

  // Active exchange selection
  const [activeExchange, setActiveExchange] = useState('Binance');

  // Daily target state
  const [dailyTarget, setDailyTarget] = useState(500.00);
  const [currentProgress, setCurrentProgress] = useState(380.00);
  const [targetLocked, setTargetLocked] = useState(true);

  // Active bots
  const [bots, setBots] = useState([
    { id: 1, name: '🤖 BTC Grid Scalper', strategy: 'Grid Trading', status: 'active', pnl: 120.50, pnlPercent: 2.4, target: 150, allocation: 2000 },
    { id: 2, name: '📈 ETH Momentum', strategy: 'Trend Following', status: 'active', pnl: 245.00, pnlPercent: 4.9, target: 250, allocation: 3000 },
    { id: 3, name: '⚡ SOL Arbitrage', strategy: 'High Frequency', status: 'paused', pnl: -15.20, pnlPercent: -0.3, target: 100, allocation: 1500 }
  ]);

  // Active positions
  const [positions, setPositions] = useState([
    { id: 1, symbol: 'BTCUSDT', side: 'BUY', entryPrice: 59250.00, markPrice: 59840.00, size: 0.15, pnl: 88.50, pnlPercent: 1.0, bracket: { takeProfit: 2.5, stopLoss: 1.2 } },
    { id: 2, symbol: 'ETHUSDT', side: 'BUY', entryPrice: 2620.00, markPrice: 2685.00, size: 2.5, pnl: 162.50, pnlPercent: 2.48, bracket: null },
    { id: 3, symbol: 'SOLUSDT', side: 'SELL', entryPrice: 145.20, markPrice: 146.50, size: 25, pnl: -32.50, pnlPercent: -0.89, bracket: { takeProfit: 3.0, stopLoss: 1.5 } }
  ]);

  // Log events stream
  const [logs, setLogs] = useState([]);

  const addLog = (type, message) => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), type, message },
      ...prev.slice(0, 49) // Keep last 50 logs for speed
    ]);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    addLog('INFO', `System theme switched to: ${nextTheme.toUpperCase()} MODE.`);
  };

  // Initial logs
  useEffect(() => {
    addLog('INFO', 'MaestroX Pro UI Engine initialized.');
    addLog('SUCCESS', 'Binance, MEXC & Bybit API listeners active.');
  }, []);

  // Price ticks simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't update if daily target lock reached
      if (targetLocked && currentProgress >= dailyTarget) return;

      // Update positions
      setPositions((prev) =>
        prev.map((pos) => {
          const tick = (Math.random() - 0.47) * 0.1;
          const markPrice = pos.markPrice * (1 + tick / 100);
          const pnl = pos.side === 'BUY'
            ? (markPrice - pos.entryPrice) * pos.size
            : (pos.entryPrice - markPrice) * pos.size;
          const pnlPercent = ((markPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.side === 'BUY' ? 1 : -1);

          return {
            ...pos,
            markPrice: parseFloat(markPrice.toFixed(2)),
            pnl: parseFloat(pnl.toFixed(2)),
            pnlPercent: parseFloat(pnlPercent.toFixed(2))
          };
        })
      );

      // Update active bots PnL
      if (Math.random() > 0.5) {
        setBots((prev) =>
          prev.map((bot) => {
            if (bot.status === 'active') {
              const profitChange = (Math.random() - 0.45) * 2;
              const newPnl = bot.pnl + profitChange;
              setCurrentProgress((c) => parseFloat(Math.max(0, c + profitChange).toFixed(2)));
              return {
                ...bot,
                pnl: parseFloat(newPnl.toFixed(2)),
                pnlPercent: parseFloat((bot.pnlPercent + profitChange / 100).toFixed(2))
              };
            }
            return bot;
          })
        );
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentProgress, dailyTarget, targetLocked]);

  // Target Auto Lock trigger check
  useEffect(() => {
    if (targetLocked && currentProgress >= dailyTarget && positions.length > 0) {
      addLog('WARNING', `🎯 Daily Target limit ($${dailyTarget}) reached. Protected lock triggering...`);
      handleKillAll();
    }
  }, [currentProgress, dailyTarget, targetLocked, positions]);

  // Total combined balance
  const combinedBalance = balances.MEXC + balances.Binance + balances.Bybit;

  // Total daily PnL
  const pnlToday = bots.reduce((sum, b) => sum + b.pnl, 0) + positions.reduce((sum, p) => sum + p.pnl, 0);
  const pnlPercent = (pnlToday / balances[activeExchange]) * 100;

  // Emergency Panic Halt
  const handleKillAll = () => {
    setPositions([]);
    setBots((prev) => prev.map((b) => ({ ...b, status: 'paused' })));
    addLog('ERROR', '🚨 EMERGENCY KILL SWITCH TRIGGERED: All positions liquidated, all bots paused.');
  };

  // Execute manual trades
  const handleExecuteOrder = (order) => {
    setBalances((prev) => ({
      ...prev,
      [activeExchange]: parseFloat((prev[activeExchange] - order.amount).toFixed(2))
    }));

    const prices = { BTCUSDT: 59840, ETHUSDT: 2685, SOLUSDT: 146, LINKUSDT: 15 };
    const entry = prices[order.symbol] || 10;
    const size = parseFloat((order.amount / entry).toFixed(4));

    const newPos = {
      id: Date.now(),
      symbol: order.symbol,
      side: order.side,
      entryPrice: entry,
      markPrice: entry,
      size,
      pnl: 0.0,
      pnlPercent: 0.0,
      bracket: order.bracket
    };

    setPositions((prev) => [newPos, ...prev]);
    addLog('SUCCESS', `Market ${order.side} Order Executed on ${activeExchange} for ${order.symbol}. Size: ${size}.`);
  };

  // Close single position
  const handleClosePosition = (id) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const refund = pos.size * pos.markPrice;
    setBalances((prev) => ({
      ...prev,
      [activeExchange]: parseFloat((prev[activeExchange] + refund).toFixed(2))
    }));

    setPositions((prev) => prev.filter((p) => p.id !== id));
    addLog('INFO', `Closed position ${pos.symbol} (${pos.side}) at market price $${pos.markPrice}. PnL: $${pos.pnl}.`);
  };

  // Toggle Bot running state
  const handleToggleBot = (id) => {
    setBots((prev) =>
      prev.map((bot) => {
        if (bot.id === id) {
          const nextStatus = bot.status === 'active' ? 'paused' : 'active';
          addLog('INFO', `Bot [${bot.name}] toggled to: ${nextStatus.toUpperCase()}`);
          return { ...bot, status: nextStatus };
        }
        return bot;
      })
    );
  };

  // Update Bot Target limit
  const handleUpdateTarget = (id, target) => {
    setBots((prev) =>
      prev.map((bot) => {
        if (bot.id === id) {
          addLog('INFO', `Bot [${bot.name}] target limit updated to $${target}`);
          return { ...bot, target };
        }
        return bot;
      })
    );
  };

  // Create/Deploy Bot wizard action
  const handleAddBot = (newBot) => {
    setBots((prev) => [...prev, newBot]);
    addLog('SUCCESS', `Newly created Bot [${newBot.name}] deployed with $${newBot.allocation} allocation.`);
  };

  // Wallet Transfers
  const handleTransfer = (from, to, amount) => {
    setBalances((prev) => ({
      ...prev,
      [from]: parseFloat((prev[from] - amount).toFixed(2)),
      [to]: parseFloat((prev[to] + amount).toFixed(2))
    }));
    addLog('SUCCESS', `Transferred $${amount} from ${from} pool to ${to} pool.`);
  };

  // Wallet Deposit / Withdrawal
  const handleDepositWithdraw = (type, exchange, amount) => {
    setBalances((prev) => ({
      ...prev,
      [exchange]: type === 'deposit'
        ? parseFloat((prev[exchange] + amount).toFixed(2))
        : parseFloat((prev[exchange] - amount).toFixed(2))
    }));
    addLog('SUCCESS', `${type.toUpperCase()} of $${amount} on ${exchange} completed.`);
  };

  // Dynamic Routing Switcher
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OverviewDashboard
            activeExchange={activeExchange}
            balances={balances}
            pnlToday={pnlToday}
            pnlPercent={pnlPercent}
            dailyTarget={dailyTarget}
            currentProgress={currentProgress}
            targetLocked={targetLocked}
            setTargetLocked={setTargetLocked}
            activePositionsCount={positions.length}
            activeBotsCount={bots.filter(b => b.status === 'active').length}
          />
        );
      case 'trading':
        return (
          <TradingTerminal
            activeExchange={activeExchange}
            balance={balances[activeExchange]}
            onExecuteOrder={handleExecuteOrder}
            positions={positions}
            onClosePosition={handleClosePosition}
          />
        );
      case 'bots':
        return (
          <BotsHub
            bots={bots}
            onToggleBot={handleToggleBot}
            onUpdateTarget={handleUpdateTarget}
            onAddBot={handleAddBot}
          />
        );
      case 'wallet':
        return (
          <WalletManager
            balances={balances}
            onTransfer={handleTransfer}
            onDepositWithdraw={handleDepositWithdraw}
          />
        );
      case 'assistant':
        return <AssistantChat />;
      case 'settings':
        return (
          <SettingsPanel
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      default:
        return <div>View not found.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation (Desktop) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main viewport */}
      <div className="main-layout">
        {/* Top Header */}
        <Header
          activeExchange={activeExchange}
          setActiveExchange={setActiveExchange}
          balances={balances}
          combinedBalance={combinedBalance}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* View container */}
        <main className="main-content">
          {renderActiveView()}
        </main>

        {/* Bottom Navigation Bar (Mobile) */}
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Floating Emergency Panic Button */}
        <EmergencyButton onKillAll={handleKillAll} />
      </div>
    </div>
  );
}
