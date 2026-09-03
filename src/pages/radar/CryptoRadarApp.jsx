import React from 'react';
import { useRadarScanner } from './hooks/useRadarScanner';
import { RadarHeader } from './components/RadarHeader';
import { RadarStatsBar } from './components/RadarStatsBar';
import { RadarTable } from './components/RadarTable';
import { RadarDetailPanel } from './components/RadarDetailPanel';
import { RadarLogBox } from './components/RadarLogBox';
import './styles/radar.css';

export default function CryptoRadarApp() {
  const {
    selectedExchange,
    changeExchange,
    isRunning,
    status,
    regime,
    rows,
    totalRowsCount,
    selectedSymbol,
    setSelectedSymbol,
    selectedItem,
    logs,
    soundEnabled,
    toggleSound,
    directionFilter,
    setDirectionFilter,
    minScoreFilter,
    setMinScoreFilter,
    searchQuery,
    setSearchQuery,
    countdown,
    marketCount,
    lastUpdated,
    startScanner,
    stopScanner,
    refreshNow,
    clearLogs,
    copyLogs
  } = useRadarScanner();

  return (
    <div className="radar-container p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-5">
        {/* Header & Controls */}
        <RadarHeader
          selectedExchange={selectedExchange}
          onChangeExchange={changeExchange}
          status={status}
          isRunning={isRunning}
          onStart={startScanner}
          onStop={stopScanner}
          onRefresh={refreshNow}
          countdown={countdown}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          directionFilter={directionFilter}
          setDirectionFilter={setDirectionFilter}
          minScoreFilter={minScoreFilter}
          setMinScoreFilter={setMinScoreFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          marketCount={marketCount}
        />

        {/* Top Metric Cards */}
        <RadarStatsBar
          selectedExchange={selectedExchange}
          regime={regime}
          marketCount={marketCount}
          topItem={rows.length > 0 ? rows[0] : null}
          lastUpdated={lastUpdated}
          totalFoundCount={totalRowsCount}
        />

        {/* Main Opportunities Table */}
        <RadarTable
          rows={rows}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
          selectedExchange={selectedExchange}
        />

        {/* Selected Symbol Detail Panel */}
        <RadarDetailPanel
          item={selectedItem}
          selectedExchange={selectedExchange}
        />

        {/* Live Execution Logs */}
        <RadarLogBox
          logs={logs}
          onClear={clearLogs}
          onCopy={copyLogs}
        />

        {/* Dynamic Build Version Footer (Constitution Rule 7) */}
        <div className="mt-8 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-mono">
          <div>
            Crypto Intraday Radar v3.5 • Multi-Exchange Order Flow & CVD Engine (Binance & Bybit)
          </div>
          <div>
            Build: {typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__).toLocaleString('ar-SA') : new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>
    </div>
  );
}
