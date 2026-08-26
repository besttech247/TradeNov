import React, { useState } from 'react';
import { Wallet, ArrowDown, ArrowUp, ArrowLeftRight, History, CreditCard } from 'lucide-react';

export default function WalletManager({ balances, onTransfer, onDepositWithdraw }) {
  const [transferFrom, setTransferFrom] = useState('Binance');
  const [transferTo, setTransferTo] = useState('MEXC');
  const [transferAmount, setTransferAmount] = useState('');

  const [dwType, setDwType] = useState('deposit'); // 'deposit' or 'withdraw'
  const [dwExchange, setDwExchange] = useState('Binance');
  const [dwAmount, setDwAmount] = useState('');

  const [ledger, setLedger] = useState([
    { id: 1, type: 'DEPOSIT', exchange: 'Binance', amount: 5000.0, time: '2026-08-24 14:32', status: 'COMPLETED' },
    { id: 2, type: 'TRANSFER', from: 'Binance', to: 'MEXC', amount: 1500.0, time: '2026-08-24 16:15', status: 'COMPLETED' },
    { id: 3, type: 'WITHDRAW', exchange: 'Bybit', amount: 800.0, time: '2026-08-24 19:40', status: 'COMPLETED' }
  ]);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount) || 0;
    if (amount <= 0) {
      alert('Please enter a valid transfer amount!');
      return;
    }
    if (transferFrom === transferTo) {
      alert('Origin and Destination exchanges cannot be the same!');
      return;
    }
    if (balances[transferFrom] < amount) {
      alert(`Insufficient funds on ${transferFrom}!`);
      return;
    }

    onTransfer(transferFrom, transferTo, amount);
    setLedger((prev) => [
      {
        id: Date.now(),
        type: 'TRANSFER',
        from: transferFrom,
        to: transferTo,
        amount,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'COMPLETED'
      },
      ...prev
    ]);
    setTransferAmount('');
  };

  const handleDwSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(dwAmount) || 0;
    if (amount <= 0) {
      alert('Please enter a valid amount!');
      return;
    }
    if (dwType === 'withdraw' && balances[dwExchange] < amount) {
      alert(`Insufficient funds on ${dwExchange}!`);
      return;
    }

    onDepositWithdraw(dwType, dwExchange, amount);
    setLedger((prev) => [
      {
        id: Date.now(),
        type: dwType.toUpperCase(),
        exchange: dwExchange,
        amount,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'COMPLETED'
      },
      ...prev
    ]);
    setDwAmount('');
  };

  return (
    <div className="dashboard-grid-overview animate-slide-up">
      {/* Title Header */}
      <div className="col-span-12">
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Wallet & Asset Manager</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage your liquidity pool, deposits, and exchange transfers.</p>
      </div>

      {/* 1. Interactive Transfer Wizard */}
      <div className="col-span-6 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeftRight size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Transfer Capital</h3>
        </div>
        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>From</span>
              <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)}>
                <option value="Binance">Binance</option>
                <option value="MEXC">MEXC</option>
                <option value="Bybit">Bybit</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>To</span>
              <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                <option value="Binance">Binance</option>
                <option value="MEXC">MEXC</option>
                <option value="Bybit">Bybit</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Amount (USD)</span>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              style={{ height: '40px' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '40px', marginTop: '4px' }}>
            Confirm Transfer
          </button>
        </form>
      </div>

      {/* 2. Deposit / Withdraw Simulation Form */}
      <div className="col-span-6 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CreditCard size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Deposit / Withdrawal</h3>
        </div>
        <form onSubmit={handleDwSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Action</span>
              <select value={dwType} onChange={(e) => setDwType(e.target.value)}>
                <option value="deposit">Deposit Funds</option>
                <option value="withdraw">Withdraw Funds</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Target Exchange</span>
              <select value={dwExchange} onChange={(e) => setDwExchange(e.target.value)}>
                <option value="Binance">Binance</option>
                <option value="MEXC">MEXC</option>
                <option value="Bybit">Bybit</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Amount (USD)</span>
            <input
              type="number"
              value={dwAmount}
              onChange={(e) => setDwAmount(e.target.value)}
              placeholder="0.00"
              style={{ height: '40px' }}
            />
          </div>
          <button
            type="submit"
            className={dwType === 'deposit' ? 'btn-buy' : 'btn-sell'}
            style={{ height: '40px', marginTop: '4px' }}
          >
            {dwType === 'deposit' ? 'Execute Deposit' : 'Execute Withdrawal'}
          </button>
        </form>
      </div>

      {/* 3. Assets list & Ledger logs */}
      <div className="col-span-12 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Funding Ledgers</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px' }}>Type</th>
                <th style={{ padding: '8px' }}>Details</th>
                <th style={{ padding: '8px' }}>Amount (USD)</th>
                <th style={{ padding: '8px' }}>Timestamp</th>
                <th style={{ padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(35, 45, 63, 0.2)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '700' }}>
                    <span style={{
                      color: item.type === 'DEPOSIT' ? 'var(--accent-profit)' : item.type === 'WITHDRAW' ? 'var(--accent-loss)' : 'var(--accent-cyan)',
                      background: item.type === 'DEPOSIT' ? 'rgba(16, 185, 129, 0.1)' : item.type === 'WITHDRAW' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#FFF' }}>
                    {item.type === 'TRANSFER' ? `From ${item.from} to ${item.to}` : `Exchange: ${item.exchange}`}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>${item.amount.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{item.time}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--accent-profit)' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
