import React from 'react';
import {
  RotateCcw,
  Settings,
  Calculator,
  Trophy,
  Sun,
  Moon,
} from 'lucide-react';
import { DominoTileIcon } from './DominoTileIcon';
import { GameMode } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';

interface ScoreHeaderProps {
  targetScore: number;
  gameMode: GameMode;
  soundEnabled?: boolean;
  isMusicPlaying?: boolean;
  lang: AppLanguage;
  isScreenAwake?: boolean;
  onToggleSound?: () => void;
  onToggleScreenAwake?: () => void;
  onOpenSettings: () => void;
  onOpenTrancaCalc: () => void;
  onOpenTimer?: () => void;
  onOpenHistory: () => void;
  onOpenMusic?: () => void;
  onOpenAddRound?: () => void;
  onNewGame: () => void;
  roundsCount: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  targetScore,
  gameMode,
  soundEnabled: _soundEnabled,
  isMusicPlaying: _isMusicPlaying,
  lang,
  isScreenAwake = true,
  onToggleSound: _onToggleSound,
  onToggleScreenAwake,
  onOpenSettings,
  onOpenTrancaCalc,
  onOpenTimer: _onOpenTimer,
  onOpenHistory,
  onOpenMusic: _onOpenMusic,
  onOpenAddRound: _onOpenAddRound,
  onNewGame,
  roundsCount,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="bg-stone-900/95 backdrop-blur-md border-b border-stone-800 sticky top-0 z-20 px-2 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="flex items-center gap-1 bg-stone-800/90 p-1 sm:p-1.5 rounded-xl border border-stone-700/80 shadow-inner flex-shrink-0">
            <DominoTileIcon top={6} bottom={6} className="w-4 h-8 sm:w-5 sm:h-10" />
            <DominoTileIcon top={4} bottom={2} className="w-4 h-8 sm:w-5 sm:h-10 -ml-1 hidden xs:block" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-stone-100 font-display truncate">
                {t.appName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
                {t.targetScore}: {targetScore} {t.pts}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 flex items-center gap-1 truncate">
              <span>{gameMode === 'teams' ? t.modeTeams : t.modeIndividual}</span>
              <span>•</span>
              <span>
                {roundsCount === 0
                  ? (lang === 'es' ? 'Sin manos' : 'No hands yet')
                  : `${roundsCount} ${roundsCount === 1 ? (lang === 'es' ? 'mano' : 'hand') : (lang === 'es' ? 'manos' : 'hands')}`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Quick Tranca Calculator (hidden on mobile, available in bottom nav) */}
          <button
            id="btn-open-tranca-calc"
            onClick={onOpenTrancaCalc}
            title={t.trancaTitle}
            className="hidden sm:flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 hover:text-white text-xs font-medium border border-stone-700/70 transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] justify-center"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">{t.trancaCalculator}</span>
          </button>


          {/* Match History / Copa (hidden on mobile, available in bottom nav) */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            title={t.history}
            className="hidden sm:flex p-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] items-center justify-center"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Screen Wake Lock / Pantalla activa - al lado de ajustes */}
          <button
            id="btn-toggle-wake-lock"
            onClick={onToggleScreenAwake}
            title={
              isScreenAwake
                ? (lang === 'es' ? 'Pantalla activa (No se apaga) - Clic para desactivar' : 'Screen awake ON (Stay awake) - Click to allow sleep')
                : (lang === 'es' ? 'Mantener pantalla activa (Evitar suspensión) - Clic para activar' : 'Keep screen awake - Click to activate')
            }
            aria-label={lang === 'es' ? 'Mantener pantalla activa' : 'Keep screen awake'}
            className={`p-2 rounded-lg transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center border ${
              isScreenAwake
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                : 'bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-400 hover:text-stone-200 border-stone-700/70'
            }`}
          >
            {isScreenAwake ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title={t.settings}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <Settings className="w-4 h-4" />
          </button>


          {/* Reset / New Game Button */}
          <button
            id="btn-new-game"
            onClick={onNewGame}
            title={t.confirmNewMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-950/40 transition-all active:scale-95 flex-shrink-0 cursor-pointer select-none"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
            <span className="font-extrabold text-xs sm:text-sm">{lang === 'es' ? 'Reiniciar' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
