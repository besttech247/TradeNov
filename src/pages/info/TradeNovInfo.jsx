import React, { useState } from 'react';
import { InfoHeader } from './components/InfoHeader';
import { OverviewScreen } from './components/OverviewScreen';
import { MacroScreen } from './components/MacroScreen';
import { IndicatorScreen } from './components/IndicatorScreen';
import { PlaybookModal } from './components/PlaybookModal';
import { useInfoData } from './hooks/useInfoData';
import { MARKET_PRESETS, INFO_VERSION } from './utils/infoConstants';
import './styles/info.css';

export default function TradeNovInfo() {
  const [selectedScreen, setSelectedScreen] = useState('overview');
  const [selectedPreset, setSelectedPreset] = useState(MARKET_PRESETS[0]);
  const [customSymbol, setCustomSymbol] = useState('BTCUSDT');
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);

  const {
    framesData,
    macroData,
    loading,
    error,
    countdownMap,
    refresh
  } = useInfoData(selectedPreset, customSymbol);

  const activeSymbol = selectedPreset.id === 'CUSTOM'
    ? (customSymbol ? customSymbol.trim().toUpperCase() : 'BTCUSDT')
    : (selectedPreset.cryptoPair || selectedPreset.symbol);

  return (
    <div className="info-container p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header Controls */}
        <InfoHeader
          selectedScreen={selectedScreen}
          setSelectedScreen={setSelectedScreen}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          customSymbol={customSymbol}
          setCustomSymbol={setCustomSymbol}
          onRefresh={refresh}
          loading={loading}
          onOpenPlaybook={() => setIsPlaybookOpen(true)}
        />

        {/* Error banner if any */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Active Screen View */}
        {selectedScreen === 'overview' && (
          <OverviewScreen
            framesData={framesData}
            activeSymbol={activeSymbol}
          />
        )}

        {selectedScreen === 'fundamental' && (
          <MacroScreen
            macroData={macroData}
            activeSymbol={activeSymbol}
          />
        )}

        {selectedScreen !== 'overview' && selectedScreen !== 'fundamental' && (
          <IndicatorScreen
            selectedScreen={selectedScreen}
            framesData={framesData}
            activeSymbol={activeSymbol}
            countdownMap={countdownMap}
          />
        )}

        {/* Dynamic Build Version Footer (Constitution Rule 7) */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-mono">
          <div>
            TradeNov INFO {INFO_VERSION} • Global Multi-Asset & Fundamental Engine
          </div>
          <div>
            Build: {typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__).toLocaleString('ar-SA') : new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>

        {/* Trading Playbook Modal */}
        <PlaybookModal
          isOpen={isPlaybookOpen}
          onClose={() => setIsPlaybookOpen(false)}
        />
      </div>
    </div>
  );
}
