import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Bitcoin, CheckSquare, Square, TrendingUp, Package, Landmark, Banknote } from 'lucide-react';

export default function WelcomeOnboarding({ onComplete }) {
  const { lang, setPlatformMode, setActiveWorkspace, setActiveScreen } = useApp();
  const isRtl = lang === 'ar';
  
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (id) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    if (selectedOptions.length === 0) return;
    
    const hasMetals = selectedOptions.includes('metals');
    const hasCrypto = selectedOptions.includes('crypto');
    
    let mode = 'both';
    let primaryWorkspace = 'crypto';
    let startingScreen = 'overview';

    if (hasMetals && hasCrypto) {
      mode = 'both';
      primaryWorkspace = 'metals'; // Gold is primary if both are selected
      startingScreen = 'metals-market';
    } else if (hasMetals) {
      mode = 'metals_only';
      primaryWorkspace = 'metals';
      startingScreen = 'metals-market';
    } else if (hasCrypto) {
      mode = 'crypto_only';
      primaryWorkspace = 'crypto';
      startingScreen = 'overview';
    }
    
    setPlatformMode(mode);
    localStorage.setItem('platform_mode', mode);
    
    setActiveWorkspace(primaryWorkspace);
    setActiveScreen(startingScreen);
    
    localStorage.setItem('onboarding_complete_v4', 'true');
    
    if (onComplete) onComplete();
  };

  const options = [
    {
      id: 'metals',
      title: isRtl ? 'المعادن الثمينة (الذهب والفضة)' : 'Precious Metals',
      desc: isRtl ? 'إدارة سبائك الذهب والفضة وتتبع الأسعار' : 'Manage gold and silver bars',
      icon: <Coins className="w-6 h-6 text-amber-500" />,
      disabled: false
    },
    {
      id: 'crypto',
      title: isRtl ? 'العملات الرقمية (Crypto)' : 'Crypto Assets',
      desc: isRtl ? 'تداول وتتبع أسواق الكريبتو' : 'Track and trade crypto markets',
      icon: <Bitcoin className="w-6 h-6 text-cyan-400" />,
      disabled: false
    },
    {
      id: 'stocks',
      title: isRtl ? 'الأسهم (Stocks)' : 'Stocks',
      desc: isRtl ? 'محافظ الأسهم العالمية والمحلية' : 'Global and local stock portfolios',
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      disabled: true
    },
    {
      id: 'commodities',
      title: isRtl ? 'السلع (Commodities)' : 'Commodities',
      desc: isRtl ? 'تتبع سلع الطاقة والزراعة' : 'Energy and agriculture commodities',
      icon: <Package className="w-6 h-6 text-emerald-400" />,
      disabled: true
    },
    {
      id: 'bonds',
      title: isRtl ? 'السندات والأوراق المالية' : 'Bonds & Securities',
      desc: isRtl ? 'إدارة السندات الحكومية والشركات' : 'Manage government and corporate bonds',
      icon: <Landmark className="w-6 h-6 text-blue-400" />,
      disabled: true
    },
    {
      id: 'forex',
      title: isRtl ? 'الفوركس والعملات' : 'Forex & Currencies',
      desc: isRtl ? 'تداول أزواج العملات الأجنبية' : 'Foreign exchange currency pairs',
      icon: <Banknote className="w-6 h-6 text-green-400" />,
      disabled: true
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[95vh] shadow-2xl relative flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-3">
            {isRtl ? 'أهلاً بك في منصتك الاستثمارية 👋' : 'Welcome to Your Platform 👋'}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            {isRtl 
              ? 'اختر الأسواق التي تهتم بالتداول فيها (يمكنك اختيار أكثر من سوق):' 
              : 'Select the markets you are interested in trading (you can select multiple):'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {options.map((opt) => {
            const isSelected = selectedOptions.includes(opt.id);
            return (
              <button
                key={opt.id}
                disabled={opt.disabled}
                onClick={() => toggleOption(opt.id)}
                className={`relative flex items-center text-start p-4 rounded-2xl border-2 transition-all duration-300 ${
                  opt.disabled 
                  ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                  : isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex-shrink-0 ml-4 mr-4">
                  {isSelected ? (
                    <CheckSquare className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-black/40`}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">{opt.title}</h3>
                      {opt.disabled && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                          {isRtl ? 'قريباً' : 'SOON'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-auto pt-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleComplete}
            disabled={selectedOptions.length === 0}
            className={`px-12 py-4 rounded-xl text-black font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
              selectedOptions.length > 0 
              ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20 hover:-translate-y-1' 
              : 'bg-gray-500 opacity-50 cursor-not-allowed'
            }`}
          >
            {isRtl ? 'ابدأ الاستثمار' : 'Start Investing'}
          </button>
        </div>
      </div>
    </div>
  );
}
