import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2 } from 'lucide-react';

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [exchange, setExchange] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      // Dummy fetch for now since we are purely frontend, 
      // but it will hit the real API in Vercel.
      const res = await fetch('/api/pro/keys');
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setKeys(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/pro/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange, api_key: apiKey, api_secret: apiSecret, is_demo: true })
      });
      if (res.ok) {
        setApiKey('');
        setApiSecret('');
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch('/api/pro/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchKeys();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-primary" />
          Add API Key
        </h3>
        
        <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Exchange</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary font-bold text-sm"
            >
              <option value="binance">Binance</option>
              <option value="mexc">MEXC</option>
              <option value="okx">OKX</option>
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-text-muted mb-1">API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary"
              placeholder="Your API Key"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-text-muted mb-1">API Secret</label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary"
              placeholder="Your API Secret"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Key</span>
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-primary" />
          Saved API Keys
        </h3>
        
        {keys.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">No API keys added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-text-muted border-b border-white/10 pb-2">
                  <th className="pb-3 font-bold">Exchange</th>
                  <th className="pb-3 font-bold">API Key</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 font-bold capitalize">{k.exchange}</td>
                    <td className="py-3 font-mono text-text-muted">
                      {k.api_key.substring(0, 4)}...{k.api_key.substring(k.api_key.length - 4)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success">
                        Active
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDelete(k.id)}
                        className="p-1.5 text-text-muted hover:text-danger bg-background/50 hover:bg-white/5 border border-white/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
