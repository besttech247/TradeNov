import React, { useState } from 'react';
import { Bot, Plus, Target, Check, HelpCircle } from 'lucide-react';
import BotCardsGrid from './BotCardsGrid';

export default function BotsHub({ bots, onToggleBot, onUpdateTarget, onAddBot }) {
  const [showWizard, setShowWizard] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotStrategy, setNewBotStrategy] = useState('Grid Trading');
  const [newBotAllocation, setNewBotAllocation] = useState(500);
  const [newBotTarget, setNewBotTarget] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBotName.trim()) {
      alert('Please enter a valid Bot Name!');
      return;
    }

    const createdBot = {
      id: Date.now(),
      name: `🤖 ${newBotName}`,
      strategy: newBotStrategy,
      status: 'active',
      pnl: 0.00,
      pnlPercent: 0.0,
      target: newBotTarget,
      allocation: newBotAllocation
    };

    onAddBot(createdBot);
    setShowWizard(false);

    // Reset Form
    setNewBotName('');
    setNewBotStrategy('Grid Trading');
    setNewBotAllocation(500);
    setNewBotTarget(50);
  };

  return (
    <div className="dashboard-grid-overview animate-slide-up">
      {/* Title Header */}
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Bots Control Hub</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure, build, and deploy automated trade strategies.</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="btn-primary"
          style={{ height: '40px', gap: '8px', padding: '0 16px' }}
        >
          <Plus size={16} /> Deploy New Bot
        </button>
      </div>

      {/* Bot Creator Wizard Panel */}
      {showWizard && (
        <div className="col-span-12 glass-card animate-slide-up" style={{ border: '1px solid var(--accent-cyan)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', color: 'var(--accent-cyan)' }}>
            Bot Deployer Wizard
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Bot Name</label>
              <input
                type="text"
                placeholder="e.g. BTC Ultra Grid"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                style={{ height: '40px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Strategy</label>
              <select
                value={newBotStrategy}
                onChange={(e) => setNewBotStrategy(e.target.value)}
                style={{ height: '40px' }}
              >
                <option value="Grid Trading">Grid Scalper (Range bound)</option>
                <option value="Trend Following">Trend Momentum (Breakouts)</option>
                <option value="DCA Strategy">DCA Auto-Invest</option>
                <option value="Arbitrage">High Frequency Arbitrage</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Initial Capital ($)</label>
              <input
                type="number"
                value={newBotAllocation}
                onChange={(e) => setNewBotAllocation(parseFloat(e.target.value) || 0)}
                style={{ height: '40px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Target Profit Limit ($)</label>
              <input
                type="number"
                value={newBotTarget}
                onChange={(e) => setNewBotTarget(parseFloat(e.target.value) || 0)}
                style={{ height: '40px' }}
              />
            </div>

            <div className="col-span-12" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="btn-secondary"
                style={{ height: '40px', padding: '0 16px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-buy"
                style={{ height: '40px', padding: '0 20px', gap: '6px' }}
              >
                <Check size={16} /> Deploy Bot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bots Grid Render */}
      <div className="col-span-8">
        <BotCardsGrid
          bots={bots}
          onToggleBot={onToggleBot}
          onUpdateTarget={onUpdateTarget}
        />
      </div>

      {/* Strategy Advisor Panel */}
      <div className="col-span-4 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Strategy Advisor</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          For range-bound markets (like BTC oscillating between 58k and 61k), the **Grid Scalper** strategy yields high efficiency.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          To trade high volatility periods on meme coins or SOL/LINK, deploy the **Trend Momentum** bot with tight stops.
        </p>
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid var(--border-color-glow)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--accent-cyan)',
          textAlign: 'center'
        }}>
          Recommendation: Run 2 Grid + 1 Trend Bot
        </div>
      </div>

    </div>
  );
}
