import React from 'react';

// شعارات وأيقونات المنصات المركزية واللامركزية CEX / DEX
export const PLATFORM_INFO = {
  BINANCE: {
    id: 'BINANCE',
    name: 'Binance',
    nameAr: 'بينانس',
    type: 'CEX',
    color: '#F3BA2F',
    bgColor: 'rgba(243, 186, 47, 0.15)',
    borderColor: 'rgba(243, 186, 47, 0.3)',
    icon: '🟡'
  },
  BYBIT: {
    id: 'BYBIT',
    name: 'Bybit',
    nameAr: 'باي بيت',
    type: 'CEX',
    color: '#F7A600',
    bgColor: 'rgba(247, 166, 0, 0.15)',
    borderColor: 'rgba(247, 166, 0, 0.3)',
    icon: '🟠'
  },
  OKX: {
    id: 'OKX',
    name: 'OKX',
    nameAr: 'أو كيه إكس',
    type: 'CEX',
    color: '#FFFFFF',
    bgColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    icon: '⚪'
  },
  DEX: {
    id: 'DEX',
    name: 'DEX / On-Chain',
    nameAr: 'المنصات اللامركزية (Raydium / Uniswap)',
    type: 'DEX',
    color: '#00F0FF',
    bgColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    icon: '🦄'
  }
};

export const PlatformBadge = ({ platformId }) => {
  const info = PLATFORM_INFO[platformId] || PLATFORM_INFO.BINANCE;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border"
      style={{
        backgroundColor: info.bgColor,
        borderColor: info.borderColor,
        color: info.color
      }}
      title={`المنصة: ${info.nameAr} (${info.type})`}
    >
      <span>{info.icon}</span>
      <span className="hidden sm:inline">{info.name}</span>
    </span>
  );
};
