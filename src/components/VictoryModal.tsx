import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, ArrowRight, Clock, Target, X } from 'lucide-react';
import { PlayerScore, Round } from '../types';
import { playVictorySound } from '../utils/sound';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: PlayerScore | null;
  players: PlayerScore[];
  rounds: Round[];
  targetScore: number;
  startTime: number;
  soundEnabled: boolean;
  onRematch: () => void;
  onNewGameSetup: () => void;
  onResetGame?: () => void;
  lang: AppLanguage;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  winner,
  players,
  rounds,
  targetScore,
  startTime,
  soundEnabled,
  onRematch,
  onNewGameSetup,
  onResetGame,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!isOpen || !winner) return;

    // Trigger victory fanfare
    playVictorySound(soundEnabled);

    // Fire celebratory confetti bursts
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch {
      // Ignore confetti errors
    }
  }, [isOpen, winner, soundEnabled]);

  if (!isOpen || !winner) return null;

  // Match statistics calculations
  const totalDurationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
  const totalRounds = rounds.length;

  let highestRoundPts = 0;
  let highestRoundWinner = '';
  rounds.forEach((r) => {
    if (r.points > highestRoundPts) {
      highestRoundPts = r.points;
      const p = players.find((pl) => pl.id === r.winnerId);
      highestRoundWinner = p ? p.name : '';
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-stone-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors z-20 cursor-pointer"
          title={lang === 'es' ? 'Cerrar ventana' : 'Close window'}
          aria-label={lang === 'es' ? 'Cerrar ventana' : 'Close window'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow accent */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: winner.color }}
        />

        {/* Trophy icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <Trophy className="w-9 h-9 text-amber-400 stroke-[2.2]" />
        </div>

        {/* Victory Announcement */}
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          {lang === 'es' ? '¡Partida Finalizada!' : 'Match Finished!'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-100 font-display mb-2">
          {lang === 'es'
            ? `¡Victoria para ${formatPlayerDisplayName(winner.name, lang)}!`
            : `Victory for ${formatPlayerDisplayName(winner.name, lang)}!`}
        </h2>
        <p className="text-sm text-stone-400 mb-5">
          {lang === 'es'
            ? `Alcanzó la meta de ${targetScore} puntos con un marcador final de `
            : `Reached the target of ${targetScore} points with a final score of `}
          <strong className="text-amber-300 font-mono">{winner.score} {t.pts}</strong>.
        </p>

        {/* Final Standings / Scores */}
        <div className="space-y-2 mb-5">
          {players.map((p) => {
            const isW = p.id === winner.id;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isW
                    ? 'bg-amber-500/15 border-amber-500/40 text-stone-100 font-bold'
                    : 'bg-stone-850 border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{formatPlayerDisplayName(p.name, lang)}</span>
                  {isW && (
                    <span className="text-xs text-amber-400 font-semibold">
                      ({lang === 'es' ? 'Ganador' : 'Winner'})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 font-normal">
                    {p.handsWon} {p.handsWon === 1 ? (lang === 'es' ? 'mano' : 'hand') : (lang === 'es' ? 'manos' : 'hands')}
                  </span>
                  <span className="text-lg font-black font-display font-mono">
                    {p.score} {t.pts}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-stone-950/80 p-3 rounded-2xl border border-stone-800 text-center mb-6">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" /> {t.hands}
            </div>
            <div className="text-base font-black font-display text-stone-200 mt-0.5">
              {totalRounds}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center gap-1">
              <Award className="w-3 h-3" /> {lang === 'es' ? 'Mayor Mano' : 'Highest Hand'}
            </div>
            <div className="text-base font-black font-display text-amber-400 mt-0.5">
              +{highestRoundPts}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> {lang === 'es' ? 'Duración' : 'Duration'}
            </div>
            <div className="text-base font-black font-display text-stone-200 mt-0.5">
              {totalDurationMinutes}m
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRematch}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'es' ? 'Revancha (Mismos Equipos)' : 'Rematch (Same Teams)'}</span>
          </button>
          <div className="flex items-center gap-2">
            {onResetGame && (
              <button
                onClick={() => {
                  onClose();
                  onResetGame();
                }}
                className="flex-1 py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-semibold rounded-xl text-xs border border-amber-500/40 transition-all cursor-pointer"
              >
                {lang === 'es' ? 'Reiniciar Puntos y Nombres' : 'Reset Points & Names'}
              </button>
            )}
            <button
              onClick={onNewGameSetup}
              className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold rounded-xl text-xs border border-stone-700 transition-all cursor-pointer"
            >
              {t.settings}
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 font-semibold rounded-xl text-xs border border-stone-800 transition-all cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
