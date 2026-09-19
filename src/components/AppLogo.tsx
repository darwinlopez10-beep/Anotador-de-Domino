import React from 'react';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'banner' | 'header';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isBanner = size === 'banner';
  const isHeader = size === 'header' || (!showText && size === 'md');

  if (isBanner) {
    return (
      <div className={`relative overflow-hidden rounded-2xl shadow-2xl border border-stone-800 ${className}`}>
        <img
          src="/grafico_funciones_1024x500_listo.png"
          alt="MESA & DOMINÓ - ANOTADOR DE PUNTOS"
          className="w-full h-auto object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Header specific layout: fixed 44px x 44px, aspect-ratio 1/1, border-radius 8px, margin-right 12px, object-fit cover
  if (isHeader && !showText) {
    return (
      <div
        id="app-header-logo-container"
        className={`relative flex-shrink-0 w-[44px] h-[44px] min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] aspect-square rounded-[8px] overflow-hidden mr-[12px] shadow-md border border-amber-500/30 bg-[#030914] transition-transform hover:scale-105 ${className}`}
        style={{
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '44px',
          maxWidth: '44px',
          maxHeight: '44px',
          aspectRatio: '1 / 1',
          borderRadius: '8px',
          marginRight: '12px',
        }}
      >
        <img
          src="/pwa-192x192.png"
          alt="Icono MESA & DOMINÓ"
          className="w-full h-full aspect-square object-cover block select-none pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // General dimension classes for other usages
  const dimensionClasses = isSm
    ? 'w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-[6px]'
    : isLg
    ? 'w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-[10px]'
    : 'w-[44px] h-[44px] min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-[8px]';

  // Generic Icon container element
  const iconElement = (
    <div
      className={`relative flex-shrink-0 aspect-square overflow-hidden shadow-md border border-amber-500/35 bg-[#030914] transition-transform hover:scale-105 ${dimensionClasses} ${
        !showText ? className : ''
      }`}
      style={{ aspectRatio: '1 / 1', borderRadius: isSm ? '6px' : isLg ? '10px' : '8px' }}
    >
      <img
        src="/pwa-192x192.png"
        alt="Icono Dominó"
        className="w-full h-full aspect-square object-cover block select-none pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );

  if (!showText) {
    return iconElement;
  }

  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{ gap: '12px' }}
    >
      <div style={{ marginRight: '12px' }}>
        {iconElement}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col min-w-0 leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase font-display ${
              isSm ? 'text-xs' : isLg ? 'text-lg' : 'text-sm sm:text-base'
            }`}
          >
            MESA &amp; DOMINÓ
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={`font-extrabold tracking-widest text-sky-400 uppercase drop-shadow-[0_0_4px_rgba(56,189,248,0.5)] ${
              isSm ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'
            }`}
          >
            - ANOTADOR -
          </span>
        </div>
      </div>
    </div>
  );
};
