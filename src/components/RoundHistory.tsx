import React from 'react';
import { RotateCcw, Trash2, Sparkles, Lock, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { PlayerScore, Round } from '../types';

interface RoundHistoryProps {
  rounds: Round[];
  players: PlayerScore[];
  onUndoLastRound: () => void;
  onDeleteRound: (roundId: string) => void;
}

export const RoundHistory: React.FC<RoundHistoryProps> = ({
  rounds,
  players,
  onUndoLastRound,
  onDeleteRound,
}) => {
  const isTwoTeams = players.length === 2;

  const getBadgeForReason = (reason: string) => {
    switch (reason) {
      case 'tranca':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Lock className="w-2.5 h-2.5" />
            Tranca
          </span>
        );
      case 'capicua':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            Capicúa
          </span>
        );
      case 'penalizacion':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            Falta
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Dominó
          </span>
        );
    }
  };

  return (
    <section className="bg-stone-850/90 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
      {/* Header of Round History */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-900/60">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-stone-100 font-display text-sm sm:text-base">
            Libreta de Anotaciones
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
            {rounds.length} {rounds.length === 1 ? 'mano' : 'manos'}
          </span>
        </div>

        {rounds.length > 0 && (
          <button
            id="btn-undo-last-round"
            onClick={onUndoLastRound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-all active:scale-95"
            title="Deshacer última mano anotada"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Deshacer última</span>
          </button>
        )}
      </div>

      {rounds.length === 0 ? (
        <div className="p-8 text-center text-stone-500">
          <p className="text-sm font-medium">Aún no hay manos registradas en esta partida.</p>
          <p className="text-xs text-stone-600 mt-1">
            Usa el botón &quot;+ Anotar Mano&quot; para registrar la primera jugada.
          </p>
        </div>
      ) : isTwoTeams ? (
        /* Classic 2-column domino notebook layout (Nosotros vs Ellos) */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400 text-xs">
                <th className="py-2.5 px-3 sm:px-4 w-12 text-center font-bold">#</th>
                <th
                  className="py-2.5 px-3 sm:px-4 font-bold border-r border-stone-800/80"
                  style={{ color: players[0].color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold tracking-tight">{players[0].name}</span>
                    <span className="text-[11px] sm:text-xs opacity-75 font-normal">Acumulado</span>
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 sm:px-4 font-bold"
                  style={{ color: players[1].color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold tracking-tight">{players[1].name}</span>
                    <span className="text-[11px] sm:text-xs opacity-75 font-normal">Acumulado</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-10 text-center font-normal text-stone-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {rounds.map((round) => {
                const team1Won = round.winnerId === players[0].id;
                const team2Won = round.winnerId === players[1].id;

                const team1ScoreSnap = round.scoresSnapshot[players[0].id] ?? 0;
                const team2ScoreSnap = round.scoresSnapshot[players[1].id] ?? 0;

                return (
                  <tr
                    key={round.id}
                    className="hover:bg-stone-800/30 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-stone-500 font-sans font-bold text-xs">
                      {round.roundNumber}
                    </td>

                    {/* Team 1 Cell */}
                    <td className="py-3 px-4 border-r border-stone-800/80">
                      {team1Won ? (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-emerald-400">
                                +{round.points}
                              </span>
                              <div className="font-sans">{getBadgeForReason(round.reason)}</div>
                            </div>
                            {round.winnerPlayerName && (
                              <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-300/90">
                                <User className="w-3 h-3 text-emerald-400" />
                                <span>Salió: <strong>{round.winnerPlayerName}</strong></span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-stone-100">
                            {team1ScoreSnap}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-xs font-sans text-stone-600">-</span>
                          <span className="text-xs text-stone-400">{team1ScoreSnap}</span>
                        </div>
                      )}
                    </td>

                    {/* Team 2 Cell */}
                    <td className="py-3 px-4">
                      {team2Won ? (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-amber-400">
                                +{round.points}
                              </span>
                              <div className="font-sans">{getBadgeForReason(round.reason)}</div>
                            </div>
                            {round.winnerPlayerName && (
                              <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-amber-300/90">
                                <User className="w-3 h-3 text-amber-400" />
                                <span>Salió: <strong>{round.winnerPlayerName}</strong></span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-stone-100">
                            {team2ScoreSnap}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-xs font-sans text-stone-600">-</span>
                          <span className="text-xs text-stone-400">{team2ScoreSnap}</span>
                        </div>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteRound(round.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 p-1 rounded transition-opacity"
                        title="Eliminar esta mano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Multi-player table for individual mode */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400 text-xs">
                <th className="py-2.5 px-3 text-center w-12 font-bold">#</th>
                <th className="py-2.5 px-4 font-bold text-stone-300">Ganador de Mano</th>
                <th className="py-2.5 px-3 font-bold text-center">Puntos</th>
                <th className="py-2.5 px-3 font-bold text-center">Tipo</th>
                {players.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 font-bold text-right" style={{ color: p.color }}>
                    {p.name}
                  </th>
                ))}
                <th className="py-2.5 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {rounds.map((round) => {
                const winnerPlayer = players.find((p) => p.id === round.winnerId);
                return (
                  <tr key={round.id} className="hover:bg-stone-800/30 transition-colors group">
                    <td className="py-3 px-3 text-center text-stone-500 font-sans font-bold text-xs">
                      {round.roundNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-stone-200">
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: winnerPlayer?.color }}
                          />
                          {winnerPlayer?.name}
                        </span>
                        {round.winnerPlayerName && round.winnerPlayerName !== winnerPlayer?.name && (
                          <span className="text-[11px] text-stone-400 pl-3.5">
                            Salió: <strong>{round.winnerPlayerName}</strong>
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      +{round.points}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {getBadgeForReason(round.reason)}
                    </td>
                    {players.map((p) => (
                      <td key={p.id} className="py-3 px-3 text-right font-medium text-stone-300">
                        {round.scoresSnapshot[p.id] ?? 0}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteRound(round.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 p-1 rounded transition-opacity"
                        title="Eliminar esta mano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
