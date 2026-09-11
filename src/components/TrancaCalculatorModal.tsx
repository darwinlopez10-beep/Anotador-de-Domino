import React, { useState } from 'react';
import { X, Calculator, ArrowRight, Award, AlertCircle } from 'lucide-react';
import { PlayerScore, TrancaRule } from '../types';
import { playTileClickSound, triggerVibration } from '../utils/sound';

interface TrancaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerScore[];
  trancaRule: TrancaRule;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onApplyTrancaPoints: (winnerId: string, points: number, notes: string) => void;
}

export const TrancaCalculatorModal: React.FC<TrancaCalculatorModalProps> = ({
  isOpen,
  onClose,
  players,
  trancaRule,
  soundEnabled,
  vibrationEnabled,
  onApplyTrancaPoints,
}) => {
  // Store remaining points input for each player
  const [playerTilePoints, setPlayerTilePoints] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    players.forEach((p) => {
      init[p.id] = '';
    });
    return init;
  });

  const [activeRule, setActiveRule] = useState<TrancaRule>(trancaRule);

  if (!isOpen) return null;

  const handleInputChange = (playerId: string, val: string) => {
    // Only numeric, max 3 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPlayerTilePoints((prev) => ({
      ...prev,
      [playerId]: cleaned,
    }));
  };

  const numericScores: { player: PlayerScore; pips: number }[] = players.map((p) => ({
    player: p,
    pips: parseInt(playerTilePoints[p.id] || '0', 10),
  }));

  const isFilled = players.every((p) => (playerTilePoints[p.id] ?? '').trim() !== '');

  // Calculate winner (lowest pip count)
  let winner: PlayerScore | null = null;
  let pointsToAward = 0;
  let isTie = false;
  let explanation = '';

  if (isFilled) {
    const minPips = Math.min(...numericScores.map((s) => s.pips));
    const winners = numericScores.filter((s) => s.pips === minPips);

    if (winners.length > 1) {
      isTie = true;
      explanation = '¡Empate en la tranca! Ambos equipos sumaron la misma cantidad de puntos en sus fichas.';
    } else {
      winner = winners[0].player;
      const loserPipsTotal = numericScores
        .filter((s) => s.player.id !== winner!.id)
        .reduce((sum, s) => sum + s.pips, 0);

      if (activeRule === 'sum_opponent') {
        pointsToAward = loserPipsTotal;
        explanation = `Gana ${winner.name} por tener menos fichas (${winners[0].pips} pts). Se anota la suma de las fichas rivales: ${pointsToAward} pts.`;
      } else {
        // Difference rule
        pointsToAward = Math.max(0, loserPipsTotal - winners[0].pips);
        explanation = `Gana ${winner.name} (${winners[0].pips} pts). Por regla de diferencia: ${loserPipsTotal} - ${winners[0].pips} = ${pointsToAward} pts.`;
      }
    }
  }

  const handleApply = () => {
    if (!winner || pointsToAward <= 0) return;
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 40);
    onApplyTrancaPoints(
      winner.id,
      pointsToAward,
      `Tranca: ${numericScores.map((s) => `${s.player.name}: ${s.pips}`).join(' vs ')}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 font-display">
                Calculadora de Tranca / Cierre
              </h3>
              <p className="text-xs text-stone-400">
                Determina quién gana y cuántos puntos suma al cerrarse el juego
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Rule Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Regla de conteo de puntos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveRule('sum_opponent')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  activeRule === 'sum_opponent'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-stone-100 mb-0.5">Suma del Rival</div>
                <div className="text-[11px] text-stone-400">
                  El ganador se lleva todos los puntos de las fichas rivales
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveRule('point_difference')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  activeRule === 'point_difference'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-stone-100 mb-0.5">Diferencia de Puntos</div>
                <div className="text-[11px] text-stone-400">
                  El ganador se lleva la resta entre puntos rivales y propios
                </div>
              </button>
            </div>
          </div>

          {/* Remaining Pips Input per player/team */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Puntos restantes en las fichas
            </label>
            <div className="space-y-2.5">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-850 border border-stone-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="font-bold text-stone-100 text-sm truncate">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="168"
                      placeholder="0"
                      value={playerTilePoints[player.id] ?? ''}
                      onChange={(e) => handleInputChange(player.id, e.target.value)}
                      className="w-20 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-center text-stone-100 font-bold text-base focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-stone-400 font-medium">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result Calculation Preview */}
          {isFilled && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isTie
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-amber-500/10 border-amber-500/40'
              }`}
            >
              {isTie ? (
                <div className="flex items-start gap-2.5 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Empate en la Tranca</div>
                    <div className="text-xs text-red-300/90 mt-1">{explanation}</div>
                  </div>
                </div>
              ) : winner ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Ganador de la tranca
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-stone-950"
                      style={{ backgroundColor: winner.color }}
                    >
                      {winner.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-3xl font-black font-display text-amber-400">
                      +{pointsToAward}
                    </span>
                    <span className="text-sm font-semibold text-stone-300">
                      puntos para el marcador
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">{explanation}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!winner || pointsToAward <= 0 || isTie}
              onClick={handleApply}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                winner && pointsToAward > 0 && !isTie
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-950/40 active:scale-[0.98] cursor-pointer'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
              }`}
            >
              <span>Anotar {pointsToAward > 0 ? `+${pointsToAward} pts` : ''} en la partida</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
