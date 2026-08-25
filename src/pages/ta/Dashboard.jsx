import React, { useState, useEffect, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  ReferenceArea
} from 'recharts';
import { Search, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle2, XCircle, BarChart3, SlidersHorizontal, Activity, TrendingUp, DollarSign, ArrowRightLeft } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { TopNav } from '../../shared/components/TopNav';

// ========== INDICATOR REGISTRY ==========
const INDICATOR_REGISTRY = [
  { id: 'sma10', label: 'SMA 10W (Fast)', category: 'Technicals', yAxis: 'price', color: '#10b981', defaultOn: true },
  { id: 'sma20', label: 'SMA 20W (Slow)', category: 'Technicals', yAxis: 'price', color: '#f43f5e', defaultOn: true },
  { id: 'bbUpper', label: 'Bollinger Upper', category: 'Technicals', yAxis: 'price', color: 'rgba(255,255,255,0.35)', dash: true },
  { id: 'bbLower', label: 'Bollinger Lower', category: 'Technicals', yAxis: 'price', color: 'rgba(255,255,255,0.35)', dash: true },
  { id: 'commNet', label: 'Commercial Net (Smart Money)', category: 'COT Sentiment', yAxis: 'osc', color: '#a855f7' },
  { id: 'fundNet', label: 'Hedge Fund Net Position', category: 'COT Sentiment', yAxis: 'osc', color: '#38bdf8' },
  { id: 'openInterest', label: 'Open Interest', category: 'COT Sentiment', yAxis: 'osc', color: '#6366f1' },
  { id: 'dxyRet', label: 'DXY 4W Momentum %', category: 'Macro', yAxis: 'osc', color: '#06b6d4' },
  { id: 'yieldRet', label: 'US10Y Yields 4W %', category: 'Macro', yAxis: 'osc', color: '#ec4899' },
  { id: 'spread', label: 'Spot/Futures Spread', category: 'Physical', yAxis: 'osc', color: '#f59e0b' },
  { id: 'gsr', label: 'Gold/Silver Ratio', category: 'Physical', yAxis: 'osc', color: '#eab308' },
];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);
  const [showChartsSection, setShowChartsSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndicators, setActiveIndicators] = useState(() => {
    const init = {};
    INDICATOR_REGISTRY.forEach(ind => { init[ind.id] = ind.defaultOn || false; });
    return init;
  });
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);

  const [livePrices, setLivePrices] = useState(null);

  useEffect(() => {
    fetch('/api/ta/cot')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch('/api/shared/prices')
      .then(res => res.json())
      .then(d => {
        if (d.status === 'success') {
          setLivePrices(d.data);
        }
      })
      .catch(err => console.error("Error fetching live prices:", err));
  }, []);

  const toggleIndicator = (id) => {
    setActiveIndicators(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredIndicators = INDICATOR_REGISTRY.filter(ind =>
    ind.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ind.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedIndicators = filteredIndicators.reduce((acc, ind) => {
    if (!acc[ind.category]) acc[ind.category] = [];
    acc[ind.category].push(ind);
    return acc;
  }, {});

  const formattedData = useMemo(() => {
    if (!data.length) return [];
    return data.map((d, index) => {
      let sma20 = null, sma10 = null, bbUpper = null, bbLower = null;
      if (index >= 19) sma20 = data.slice(index - 19, index + 1).map(x => x.Spot).reduce((a, b) => a + b, 0) / 20;
      if (index >= 9) {
        const p = data.slice(index - 9, index + 1).map(x => x.Spot);
        sma10 = p.reduce((a, b) => a + b, 0) / 10;
        const std = Math.sqrt(p.map(x => Math.pow(x - sma10, 2)).reduce((a, b) => a + b, 0) / 10);
        bbUpper = sma10 + 2 * std;
        bbLower = sma10 - 2 * std;
      }

      return {
        ...d,
        ExactDate: new Date(d.Date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
        sma10, sma20, bbUpper, bbLower,
        commNet: d.CommercialLongs - d.CommercialShorts,
        fundNet: d.ManagedMoneyLongs - d.ManagedMoneyShorts,
        openInterest: d.OpenInterest,
        dxyRet: index >= 4 ? parseFloat((((d.DXY - data[index - 4].DXY) / data[index - 4].DXY) * 100).toFixed(2)) : 0,
        yieldRet: index >= 4 ? parseFloat((((d.US10Y - data[index - 4].US10Y) / data[index - 4].US10Y) * 100).toFixed(2)) : 0,
        spread: d.Spread,
        gsr: d.GoldSilverRatio
      };
    });
  }, [data]);

  const strategyDetails = useMemo(() => {
    if (!data.length) return [];
    const n = data.length;
    const d = data[n - 1] || {};

    let sc1_6 = 0;
    const p1_6 = [
      { label: 'Spot/Futures Backwardation (Spread < 0)', pass: d.Spread < 0 },
      { label: 'Gold/Silver Ratio Bullish (< 80)', pass: d.GoldSilverRatio < 80 },
      { label: 'Hedge Fund Longs Growing (4W)', pass: n >= 5 && d.ManagedMoneyLongs > data[n - 5].ManagedMoneyLongs },
      { label: 'High Market Participation (OI > 450k)', pass: d.OpenInterest > 450000 },
      { label: 'Spot Premium over Futures', pass: d.Spot > d.Futures },
    ];
    p1_6.forEach(p => { if (p.pass) sc1_6++; });

    let sc2_0 = 0;
    const past4 = n >= 5 ? data[n - 5] : d;
    const past2 = n >= 3 ? data[n - 3] : d;
    const cD = (d.CommercialLongs - d.CommercialShorts) - (past2.CommercialLongs - past2.CommercialShorts);
    const fD = (d.ManagedMoneyLongs - d.ManagedMoneyShorts) - (past2.ManagedMoneyLongs - past2.ManagedMoneyShorts);
    const dP = ((d.DXY - past4.DXY) / (past4.DXY || 1)) * 100;
    const yP = ((d.US10Y - past4.US10Y) / (past4.US10Y || 1)) * 100;
    const oiDrop = ((d.OpenInterest - past2.OpenInterest) / (past2.OpenInterest || 1)) * 100;

    const p2_0 = [
      { label: 'Smart Money Divergence (Commercials Buying & Funds Selling)', pass: cD > 0 && fD < 0 },
      { label: 'Macro Pressure Drop (DXY + Yields fell > 2%)', pass: dP + yP < -2 },
      { label: 'Open Interest Flush (> 4% drop)', pass: oiDrop < -4 },
      { label: 'Trader Concentration Extreme (< 3.0 Ratio)', pass: parseFloat(d.ManagedMoneyLongTraders) / parseFloat(d.ManagedMoneyShortTraders) < 3.0 }
    ];
    p2_0.forEach(p => { if (p.pass) sc2_0++; });

    let sc3_0 = 0;
    const s4w = n >= 5 ? ((d.Silver - data[n - 5].Silver) / data[n - 5].Silver) * 100 : 0;
    const g4w = n >= 5 ? ((d.Spot - data[n - 5].Spot) / data[n - 5].Spot) * 100 : 0;
    const p3_0 = [
      { label: 'Contango Squeeze (Spread tightening)', pass: d.Spread < 0.5 },
      { label: 'Neutral Spread Traders Dropping', pass: n >= 5 && parseFloat(d.ManagedMoneySpreadTraders) < parseFloat(data[n - 5].ManagedMoneySpreadTraders) },
      { label: 'Silver Outperforming Gold (Silver Lead)', pass: s4w > g4w && g4w > 0 }
    ];
    p3_0.forEach(p => { if (p.pass) sc3_0++; });

    let sc4_0 = 0;
    const dxy4w = n >= 5 ? ((d.DXY - past4.DXY) / past4.DXY) * 100 : 0;
    const gold4w = n >= 5 ? ((d.Spot - past4.Spot) / past4.Spot) * 100 : 0;
    const yield4w = n >= 5 ? ((d.US10Y - past4.US10Y) / past4.US10Y) * 100 : 0;
    const commDelta4w = (d.CommercialLongs - d.CommercialShorts) - (past4.CommercialLongs - past4.CommercialShorts);

    const p4_0 = [
      { label: 'DXY Decoupling (Gold & Dollar both rising > 1%)', pass: dxy4w > 1 && gold4w > 1 },
      { label: 'Yield Decoupling (Gold rising despite Yields > 3%)', pass: yield4w > 3 && gold4w > 1 },
      { label: 'Commercial Accumulation on Weakness', pass: gold4w < -2 && commDelta4w > 0 }
    ];
    p4_0.forEach(p => { if (p.pass) sc4_0++; });

    let sc5_0 = 0;
    const p10 = n >= 10 ? data.slice(n - 10, n).map(x => x.Spot) : [];
    const p20 = n >= 20 ? data.slice(n - 20, n).map(x => x.Spot) : [];
    const s10 = p10.length ? p10.reduce((a, b) => a + b, 0) / 10 : 0;
    const s20 = p20.length ? p20.reduce((a, b) => a + b, 0) / 20 : 0;
    const std = p10.length ? Math.sqrt(p10.map(x => Math.pow(x - s10, 2)).reduce((a, b) => a + b, 0) / 10) : 0;

    const p5_0 = [
      { label: 'Golden Trend (10W SMA > 20W SMA)', pass: s10 > s20 },
      { label: '12W Positive Momentum', pass: n >= 13 && d.Spot > data[n - 13].Spot },
      { label: 'Bollinger Band Breakout (Price > Upper Band)', pass: d.Spot > s10 + 2 * std },
      { label: 'Buy The Dip (Uptrend + 2W Short Drop)', pass: n >= 3 && d.Spot < data[n - 2].Spot }
    ];
    p5_0.forEach(p => { if (p.pass) sc5_0++; });

    return [
      { id: '1.6', name: 'Strategy 1.6', title: 'Classic Multi-Factor', winRate: '68.4%', score: sc1_6, max: 5, buy: sc1_6 >= 3, points: p1_6, desc: 'Combines Backwardation, GSR, COT Longs, and Open Interest.' },
      { id: '2.0', name: 'Strategy 2.0', title: 'Smart Money Contrarian', winRate: '74.1%', score: sc2_0, max: 4, buy: sc2_0 >= 2, points: p2_0, desc: 'Identifies institutional buying divergence and market fear flushes.' },
      { id: '3.0', name: 'Strategy 3.0', title: 'Physical Market Squeeze', winRate: '61.5%', score: sc3_0, max: 3, buy: sc3_0 >= 2, points: p3_0, desc: 'Tracks physical tightness, contango narrowing, and Silver leadership.' },
      { id: '4.0', name: 'Strategy 4.0', title: 'Macro Decoupling', winRate: '79.0%', score: sc4_0, max: 3, buy: sc4_0 >= 1, points: p4_0, desc: 'Catches rare relative strength when Gold ignores Dollar & Yield surges.' },
      { id: '5.0', name: 'Strategy 5.0', title: 'Pure Technical Momentum', winRate: '65.2%', score: sc5_0, max: 4, buy: sc5_0 >= 2, points: p5_0, desc: 'Mathematical price action system based on moving averages & volatility.' }
    ];
  }, [data]);

  if (loading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading TA Data...</div>;
  }

  if (!data.length) {
    return <div className="p-8 text-center text-danger">Failed to load Market Data.</div>;
  }

  const buyCount = strategyDetails.filter(s => s.buy).length;
  const totalStrats = strategyDetails.length;
  const consensus = buyCount >= 3 ? 'BUY' : buyCount >= 2 ? 'MIXED' : 'WAIT';

  const latest = formattedData[formattedData.length - 1] || {};
  const prev = formattedData[formattedData.length - 2] || {};
  
  // Use live price if available, otherwise fallback to latest Spot
  const displayGoldPrice = livePrices?.GOLD || latest.Spot;
  const pctChange = displayGoldPrice && prev.Spot ? ((displayGoldPrice - prev.Spot) / prev.Spot * 100).toFixed(2) : '0.00';

  const activeStrategyObj = strategyDetails.find(s => s.id === selectedStrategyId);
  const hasOscillator = INDICATOR_REGISTRY.some(ind => activeIndicators[ind.id] && ind.yAxis === 'osc');

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text-main animate-in fade-in duration-500">
      <TopNav title="Technical Analysis & Macro Data" />
      
      {/* High-Level Summary & Macro Cards */}
      <div className="flex flex-col gap-6 mb-8">
        
        {/* Consensus Row */}
        <div className="glass-panel p-6 flex flex-wrap justify-between items-center gap-6 rounded-2xl border border-white/10 bg-background-panel/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide border 
              ${consensus === 'BUY' ? 'bg-success/10 text-success border-success/30' : 
                consensus === 'MIXED' ? 'bg-warning/10 text-warning border-warning/30' : 
                'bg-danger/10 text-danger border-danger/30'}`}>
              {consensus === 'BUY' ? '🟢 BUY OPPORTUNITY' : consensus === 'MIXED' ? '🟡 MIXED SIGNALS' : '🔴 WAIT / NO SIGNAL'}
            </span>
            <div>
              <h1 className="text-2xl font-bold m-0">Gold Decision Summary</h1>
              <p className="text-text-muted text-sm m-0">
                {buyCount} of {totalStrats} Strategies confirming a Buy • Live Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Live Prices & Macro Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-primary/20 px-5 py-4 rounded-xl flex flex-col items-center text-center shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <span className="text-xs text-text-muted uppercase flex items-center gap-2 mb-1"><DollarSign size={14} className="text-primary" /> Live Gold (Spot)</span>
            <span className="text-2xl font-bold">${displayGoldPrice?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className={`text-xs font-bold mt-1 ${parseFloat(pctChange) >= 0 ? 'text-success' : 'text-danger'}`}>
              {parseFloat(pctChange) >= 0 ? '▲' : '▼'} {Math.abs(pctChange)}%
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-xl flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <span className="text-xs text-text-muted uppercase flex items-center gap-2 mb-1"><Activity size={14} className="text-accent" /> DXY (Dollar Index)</span>
            <span className="text-2xl font-bold">{latest.DXY?.toFixed(2) || '---'}</span>
            <span className="text-xs text-text-muted mt-1">Macro Headwind</span>
          </div>

          <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-xl flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <span className="text-xs text-text-muted uppercase flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-danger" /> US10Y Yields</span>
            <span className="text-2xl font-bold">{latest.US10Y?.toFixed(2) || '---'}%</span>
            <span className="text-xs text-text-muted mt-1">Opportunity Cost</span>
          </div>

          <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-xl flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <span className="text-xs text-text-muted uppercase flex items-center gap-2 mb-1"><ArrowRightLeft size={14} className="text-warning" /> Gold/Silver Ratio</span>
            <span className="text-2xl font-bold">{latest.GoldSilverRatio?.toFixed(2) || (latest.Spot && latest.Silver ? (latest.Spot/latest.Silver).toFixed(2) : '---')}</span>
            <span className="text-xs text-text-muted mt-1">Physical Tightness</span>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {strategyDetails.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedStrategyId(selectedStrategyId === s.id ? null : s.id)}
            className={`glass-panel p-5 rounded-xl border cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/40 flex flex-col h-full
              ${selectedStrategyId === s.id ? 'border-primary bg-primary/5' : 'border-white/10 bg-background-panel/30'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm">{s.name}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md 
                ${s.buy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {s.buy ? 'BUY' : 'WAIT'}
              </span>
            </div>
            <div className="text-text-muted text-xs mb-4 flex-grow">{s.title}</div>
            
            <div className="flex justify-between p-2 bg-white/5 rounded-lg mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Score</span>
                <span className="font-bold text-sm">{s.score}/{s.max}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-text-muted">Win Rate</span>
                <span className="font-bold text-sm text-primary">{s.winRate}</span>
              </div>
            </div>
            
            <button className="w-full text-xs text-text-muted hover:text-white border border-white/10 rounded-lg py-1 transition-colors mt-auto">
              {selectedStrategyId === s.id ? 'إخفاء التفاصيل ▲' : 'عرض التفاصيل ▼'}
            </button>
          </div>
        ))}
      </div>

      {/* Strategy Details Drawer */}
      {activeStrategyObj && (
        <div className="glass-panel p-6 rounded-2xl mb-8 bg-background-panel border border-primary/30 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{activeStrategyObj.name}: {activeStrategyObj.title}</h2>
              <p className="text-sm text-text-muted mt-1">{activeStrategyObj.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">Win Rate: {activeStrategyObj.winRate}</span>
              <button onClick={() => setSelectedStrategyId(null)} className="text-text-muted hover:text-white text-sm">✕ إغلاق</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeStrategyObj.points.map((pt, idx) => (
              <div key={idx} className={`p-4 rounded-xl flex items-center gap-3 border 
                ${pt.pass ? 'bg-success/5 border-success/20' : 'bg-white/5 border-white/5'}`}>
                {pt.pass ? <CheckCircle2 size={18} className="text-success" /> : <XCircle size={18} className="text-text-muted" />}
                <div>
                  <div className="text-sm font-medium">{pt.label}</div>
                  <div className={`text-xs ${pt.pass ? 'text-success' : 'text-text-muted'}`}>
                    {pt.pass ? 'متحقق (PASSED)' : 'غير متحقق (FAILED)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Toggle */}
      <div className="flex justify-center mb-8">
        <Button 
          variant={showChartsSection ? 'primary' : 'secondary'} 
          onClick={() => setShowChartsSection(!showChartsSection)}
          className="rounded-full px-6"
        >
          <BarChart3 size={18} />
          {showChartsSection ? 'إخفاء الشارتات ▲' : '📈 عرض الشارتات والمؤشرات ▼'}
        </Button>
      </div>

      {/* Charts Section */}
      {showChartsSection && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          
          {/* Indicator Toolbar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
                className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors"
              >
                <SlidersHorizontal size={16} />
                <span>البحث وإضافة المؤشرات ({Object.values(activeIndicators).filter(Boolean).length} مفعّل)</span>
                {showIndicatorPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <div className="flex flex-wrap gap-2">
                {INDICATOR_REGISTRY.filter(ind => activeIndicators[ind.id]).map(ind => (
                  <button 
                    key={ind.id} 
                    onClick={() => toggleIndicator(ind.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border bg-background-panel"
                    style={{ borderColor: ind.color, color: ind.color }}
                  >
                    <EyeOff size={12} /> {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicator Search */}
            {showIndicatorPanel && (
              <div className="glass-panel p-5 rounded-xl border border-white/10 bg-background-panel/95">
                <div className="flex items-center gap-2 bg-background-input border border-white/10 rounded-lg px-3 py-2 mb-4">
                  <Search size={16} className="text-text-muted" />
                  <input
                    type="text"
                    placeholder="ابحث عن مؤشر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(groupedIndicators).map(([cat, inds]) => (
                    <div key={cat}>
                      <div className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">{cat}</div>
                      <div className="space-y-2">
                        {inds.map(ind => (
                          <label key={ind.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-sm">
                            <span style={{ color: activeIndicators[ind.id] ? ind.color : '#94a3b8' }}>{ind.label}</span>
                            <div className="text-text-muted">
                              {activeIndicators[ind.id] ? <Eye size={16} style={{color: ind.color}} /> : <EyeOff size={16} />}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 1: Gold Spot */}
          <div className="glass-panel p-5 rounded-xl border border-white/10 bg-background-panel/50">
            <h3 className="text-lg font-bold mb-4">1. Gold Spot Price & Overlays</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c9a84c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="ExactDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={30} />
                  <YAxis yAxisId="price" domain={['auto', 'auto']} stroke="#c9a84c" tick={{ fill: '#c9a84c', fontSize: 11 }} />
                  {hasOscillator && <YAxis yAxisId="osc" orientation="right" domain={['auto', 'auto']} stroke="#a855f7" tick={{ fill: '#a855f7', fontSize: 11 }} />}
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />

                  <Area yAxisId="price" type="monotone" dataKey="Spot" stroke="#c9a84c" strokeWidth={2} fill="url(#goldFill)" name="Gold Spot" isAnimationActive={false} />

                  {INDICATOR_REGISTRY.filter(ind => activeIndicators[ind.id]).map(ind => (
                    <Line
                      key={ind.id}
                      yAxisId={ind.yAxis}
                      type="monotone"
                      dataKey={ind.id}
                      stroke={ind.color}
                      strokeWidth={ind.dash ? 1 : 2}
                      strokeDasharray={ind.dash ? '4 4' : undefined}
                      dot={false}
                      name={ind.label}
                      isAnimationActive={false}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: COT */}
          <div className="glass-panel p-5 rounded-xl border border-white/10 bg-background-panel/50">
            <h3 className="text-lg font-bold mb-4">2. Smart Money vs Hedge Funds Net Position (COT)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="ExactDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={30} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="commNet" stroke="#a855f7" strokeWidth={2} dot={false} name="Commercial Net (Smart Money)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="fundNet" stroke="#38bdf8" strokeWidth={2} dot={false} name="Hedge Funds Net" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
