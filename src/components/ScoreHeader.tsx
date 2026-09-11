import React from 'react';
import {
  RotateCcw,
  Settings,
  Calculator,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { DominoTileIcon } from './DominoTileIcon';
import { GameMode } from '../types';

interface ScoreHeaderProps {
  targetScore: number;
  gameMode: GameMode;
  soundEnabled: boolean;
  isMusicPlaying?: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenTrancaCalc: () => void;
  onOpenTimer: () => void;
  onOpenHistory: () => void;
  onOpenMusic: () => void;
  onNewGame: () => void;
  roundsCount: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  targetScore,
  gameMode,
  soundEnabled,
  isMusicPlaying,
  onToggleSound,
  onOpenSettings,
  onOpenTrancaCalc,
  onOpenTimer,
  onOpenHistory,
  onOpenMusic,
  onNewGame,
  roundsCount,
}) => {
  return (
    <header className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800 sticky top-0 z-20 px-3 sm:px-6 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-stone-800/90 p-1.5 rounded-xl border border-stone-700/80 shadow-inner">
            <DominoTileIcon top={6} bottom={6} className="w-5 h-10" />
            <DominoTileIcon top={4} bottom={2} className="w-5 h-10 -ml-1.5 hidden xs:block" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-100 font-display">
                Anotador de Dominó
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Meta: {targetScore} pts
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <span>{gameMode === 'teams' ? 'Por Parejas' : 'Individual'}</span>
              <span>•</span>
              <span>{roundsCount === 0 ? 'Sin manos jugadas' : `${roundsCount} ${roundsCount === 1 ? 'mano' : 'manos'}`}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Tranca Calculator */}
          <button
            id="btn-open-tranca-calc"
            onClick={onOpenTrancaCalc}
            title="Calculadora de Tranca / Cierre"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs sm:text-sm font-medium border border-stone-700/70 transition-all active:scale-95"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Tranca</span>
          </button>

          {/* Turn Timer */}
          <button
            id="btn-open-timer"
            onClick={onOpenTimer}
            title="Temporizador de jugada"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95"
          >
            <Timer className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Music Player */}
          <button
            id="btn-open-music"
            onClick={onOpenMusic}
            title={isMusicPlaying ? 'Música activa (toca para ver)' : 'Buscar y reproducir música'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 ${
              isMusicPlaying
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border-stone-700/70'
            }`}
          >
            <Music className={`w-4 h-4 text-amber-400 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Música</span>
          </button>

          {/* Match History */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            title="Historial de partidas"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title="Configuración de la partida"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset / New Game */}
          <button
            id="btn-new-game"
            onClick={onNewGame}
            title="Nueva partida"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs sm:text-sm shadow-md shadow-amber-900/30 transition-all active:scale-95 ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
