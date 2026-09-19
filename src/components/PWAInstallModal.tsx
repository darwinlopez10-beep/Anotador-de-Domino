import React from 'react';
import { Download, Share2, PlusSquare, Check, X, Smartphone, Sparkles } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';
import { usePWAInstall } from '../utils/usePWAInstall';
import { AppLogo } from './AppLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="pwa-install-dialog"
        className="relative w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-stone-100 overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center">
            <AppLogo size="header" showText={false} />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 uppercase font-display">
                  MESA &amp; DOMINÓ
                </span>
              </div>
              <p className="text-[11px] font-extrabold tracking-widest text-sky-400 uppercase">
                - ANOTADOR DE PUNTOS -
              </p>
            </div>
          </div>
          <button
            id="pwa-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          <p className="text-sm text-stone-300 leading-relaxed">
            {t.downloadAppSubtitle}
          </p>

          {/* Key Advantages */}
          <div className="bg-stone-950/60 rounded-xl p-3.5 border border-stone-800/80 space-y-2.5 text-xs text-stone-300">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </span>
              <span>{t.pwaFeaturesHome}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </span>
              <span>{t.pwaFeaturesFast}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </span>
              <span>{t.pwaFeaturesOffline}</span>
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 text-center text-sm text-emerald-300 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t.alreadyInstalled}</span>
            </div>
          )}

          {/* Android / Chromium / Desktop Install Button */}
          {!isInstalled && isInstallable && (
            <div className="space-y-2 pt-2">
              <button
                id="pwa-direct-install-btn"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition min-h-[48px]"
              >
                <Download className="w-5 h-5" />
                <span>{t.installApp}</span>
              </button>
              <p className="text-[11px] text-center text-stone-400">
                {t.androidDirectPrompt}
              </p>
            </div>
          )}

          {/* iOS Safari Guide */}
          {!isInstalled && (isIOS || !isInstallable) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.iosGuideTitle}</span>
              </h3>

              <div className="space-y-2.5 text-xs text-stone-300">
                <div className="flex items-start gap-3 bg-stone-850 p-2.5 rounded-lg border border-stone-800">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-100">1. </span>
                    {t.iosStep1}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-stone-850 p-2.5 rounded-lg border border-stone-800">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-100">2. </span>
                    {t.iosStep2}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-stone-850 p-2.5 rounded-lg border border-stone-800">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-100">3. </span>
                    {t.iosStep3}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition min-h-[40px]"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
