import React from 'react';

// أيقونات المتجهات الأصلية SVG لشعارات المنصات CEX & DEX بدقة فائقة
export const ExchangeIcons = {
  BINANCE: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F3BA2F"/>
      <path d="M16 7.42871L20.2857 11.7144L16 16.0001L11.7143 11.7144L16 7.42871Z" fill="black"/>
      <path d="M22.8572 14.2856L27.1429 18.5714L22.8572 22.8571L18.5714 18.5714L22.8572 14.2856Z" fill="black"/>
      <path d="M9.14286 14.2856L13.4286 18.5714L9.14286 22.8571L4.85714 18.5714L9.14286 14.2856Z" fill="black"/>
      <path d="M16 21.1426L20.2857 25.4283L16 29.714L11.7143 25.4283L16 21.1426Z" fill="black"/>
      <path d="M16 17.7144L17.7143 16.0001L16 14.2857L14.2857 16.0001L16 17.7144Z" fill="black"/>
    </svg>
  ),
  BYBIT: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#17181E"/>
      <path d="M8 8H15C17.2 8 19 9.8 19 12C19 13.5 18.2 14.8 17 15.5C18.7 16.2 20 17.9 20 20C20 22.2 18.2 24 16 24H8V8Z" fill="#F7A600"/>
      <rect x="21" y="8" width="3" height="16" rx="1.5" fill="#F7A600"/>
    </svg>
  ),
  DEX: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0B132B"/>
      <path d="M16 6L24 22H8L16 6Z" fill="#00F0FF" fillOpacity="0.8"/>
      <circle cx="16" cy="18" r="4" fill="#FF007A"/>
      <path d="M12 25L16 22L20 25H12Z" fill="#00F0FF"/>
    </svg>
  ),
  OKX: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#000000"/>
      <rect x="7" y="7" width="7" height="7" fill="white" rx="1"/>
      <rect x="18" y="7" width="7" height="7" fill="white" rx="1"/>
      <rect x="7" y="18" width="7" height="7" fill="white" rx="1"/>
      <rect x="18" y="18" width="7" height="7" fill="white" rx="1"/>
      <rect x="12.5" y="12.5" width="7" height="7" fill="#00F0FF" rx="1"/>
    </svg>
  )
};

export const PLATFORM_INFO = {
  BINANCE: {
    id: 'BINANCE',
    name: 'Binance',
    nameAr: 'بينانس',
    type: 'CEX',
    color: '#F3BA2F',
    Icon: ExchangeIcons.BINANCE
  },
  BYBIT: {
    id: 'BYBIT',
    name: 'Bybit',
    nameAr: 'باي بيت',
    type: 'CEX',
    color: '#F7A600',
    Icon: ExchangeIcons.BYBIT
  },
  DEX: {
    id: 'DEX',
    name: 'DEX (Raydium/Uniswap)',
    nameAr: 'منصات لا مركزية (Raydium/Uniswap)',
    type: 'DEX',
    color: '#00F0FF',
    Icon: ExchangeIcons.DEX
  },
  OKX: {
    id: 'OKX',
    name: 'OKX',
    nameAr: 'أو كيه إكس',
    type: 'CEX',
    color: '#FFFFFF',
    Icon: ExchangeIcons.OKX
  }
};

/**
 * شارة المنصة: تعرض الأيقونة الأصلية فقط وبشكل أنيق وواضح مع Tooltip
 */
export const PlatformBadge = ({ platformId, size = "w-4 h-4" }) => {
  const info = PLATFORM_INFO[platformId] || PLATFORM_INFO.BINANCE;
  const IconComponent = info.Icon || ExchangeIcons.BINANCE;

  return (
    <span
      className="inline-flex items-center justify-center p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-transform hover:scale-110 cursor-help"
      title={`منصة: ${info.nameAr} (${info.type})`}
    >
      <IconComponent className={size} />
    </span>
  );
};
