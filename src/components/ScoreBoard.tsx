import React, { useState } from 'react';
import { Plus, Edit2, Check, Flame, Award, Users, User } from 'lucide-react';
import { PlayerScore } from '../types';

interface ScoreBoardProps {
  players: PlayerScore[];
  targetScore: number;
  onAddRoundForPlayer: (playerId: string) => void;
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onUpdatePlayerMembers?: (playerId: string, members: string[]) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  onAddRoundForPlayer,
  onUpdatePlayerName,
  onUpdatePlayerMembers,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const [editingMembersTeamId, setEditingMembersTeamId] = useState<string | null>(null);
  const [member1Input, setMember1Input] = useState<string>('');
  const [member2Input, setMember2Input] = useState<string>('');

  const highestScore = Math.max(...players.map((p) => p.score), 0);

  const startEdit = (player: PlayerScore) => {
    setEditingPlayerId(player.id);
    setEditingName(player.name);
  };

  const saveEdit = (playerId: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onUpdatePlayerName(playerId, trimmed);
    }
    setEditingPlayerId(null);
  };

  const startEditMembers = (player: PlayerScore) => {
    setEditingMembersTeamId(player.id);
    setMember1Input(player.members?.[0] || 'Jugador 1');
    setMember2Input(player.members?.[1] || 'Jugador 2');
  };

  const saveEditMembers = (playerId: string) => {
    if (onUpdatePlayerMembers) {
      onUpdatePlayerMembers(playerId, [
        member1Input.trim() || 'Jugador 1',
        member2Input.trim() || 'Jugador 2',
      ]);
    }
    setEditingMembersTeamId(null);
  };

  const isTwoTeams = players.length === 2;

  return (
    <section className="w-full">
      <div
        className={`grid gap-2 sm:gap-4 ${
          isTwoTeams
            ? 'grid-cols-2'
            : players.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {players.map((player) => {
          const progressPercent = Math.min(100, Math.round((player.score / targetScore) * 100));
          const pointsRemaining = Math.max(0, targetScore - player.score);
          const isLeader = player.score > 0 && player.score === highestScore;
          const isAtLeyDe = pointsRemaining > 0 && pointsRemaining <= 25; // "A ley de..." popular domino term!

          return (
            <div
              key={player.id}
              id={`player-card-${player.id}`}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isLeader
                  ? 'bg-stone-850/95 border-amber-500/40 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-stone-850/80 border-stone-800 shadow-lg'
              }`}
            >
              {/* Top team color banner line */}
              <div
                className="h-1.5 sm:h-2 w-full flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />

              <div className="p-2 sm:p-5 landscape:p-3 flex flex-col justify-between flex-1">
                {/* Header: Name & Badges */}
                <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5 landscape:mb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    {editingPlayerId === player.id ? (
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          maxLength={25}
                          autoFocus
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(player.id);
                            if (e.key === 'Escape') setEditingPlayerId(null);
                          }}
                          className="bg-stone-900 border border-amber-500/60 rounded px-1.5 py-0.5 text-sm sm:text-base text-stone-100 focus:outline-none w-full font-bold"
                        />
                        <button
                          onClick={() => saveEdit(player.id)}
                          className="p-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs flex-shrink-0"
                          title="Guardar nombre"
                        >
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group cursor-pointer min-w-0" onClick={() => startEdit(player)}>
                        <h2 className="text-base sm:text-2xl landscape:text-lg font-black text-stone-100 truncate tracking-tight">
                          {player.name}
                        </h2>
                        <button
                          type="button"
                          className="text-stone-400 hover:text-stone-200 opacity-80 group-hover:opacity-100 transition-opacity p-0.5 flex-shrink-0"
                          title="Editar nombre"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Leader Badge */}
                  {isLeader && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap flex-shrink-0">
                      <Flame className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span>Líder</span>
                    </span>
                  )}
                </div>

                {/* Team Members Display / Editing for teams mode */}
                {isTwoTeams && (
                  <div className="mb-1 sm:mb-1.5 landscape:mb-1">
                    {editingMembersTeamId === player.id ? (
                      <div className="flex flex-col sm:flex-row items-center gap-1 p-1 bg-stone-900/90 border border-amber-500/50 rounded-lg sm:rounded-xl">
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={member1Input}
                            maxLength={18}
                            placeholder="Jugador 1"
                            onChange={(e) => setMember1Input(e.target.value)}
                            className="w-1/2 bg-stone-950 border border-stone-750 rounded px-1.5 py-1 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-bold"
                          />
                          <span className="text-stone-500 text-xs sm:text-sm font-bold">&</span>
                          <input
                            type="text"
                            value={member2Input}
                            maxLength={18}
                            placeholder="Jugador 2"
                            onChange={(e) => setMember2Input(e.target.value)}
                            className="w-1/2 bg-stone-950 border border-stone-750 rounded px-1.5 py-1 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => saveEditMembers(player.id)}
                          className="w-full sm:w-auto p-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs flex items-center justify-center flex-shrink-0"
                          title="Guardar jugadores"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditMembers(player)}
                        className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg bg-stone-900/60 hover:bg-stone-900 border border-stone-800/60 cursor-pointer group/members transition-colors max-w-full"
                        title="Toca para editar los nombres de los jugadores"
                      >
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                        <span className="font-bold text-xs sm:text-sm text-stone-200 truncate flex-1">
                          {player.members && player.members.length === 2
                            ? `${player.members[0]} & ${player.members[1]}`
                            : 'Jugador 1 & Jugador 2'}
                        </span>
                        <Edit2 className="w-3 h-3 text-stone-400 opacity-70 group-hover/members:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    )}
                  </div>
                )}

                {/* Main Score Digits Display */}
                <div className="my-1 sm:my-3 landscape:my-1 text-center py-1 sm:py-2 landscape:py-1 px-1 bg-stone-900/60 rounded-xl border border-stone-800/80">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      id={`score-display-${player.id}`}
                      className="text-3xl sm:text-6xl md:text-7xl landscape:text-4xl sm:landscape:text-5xl font-black tracking-tight font-display text-stone-50 select-all"
                    >
                      {player.score}
                    </span>
                    <span className="text-[10px] sm:text-sm font-semibold text-stone-400">
                      / {targetScore}
                    </span>
                  </div>

                  {/* Status / A ley de... */}
                  <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[9px] sm:text-xs leading-tight">
                    {pointsRemaining === 0 ? (
                      <span className="font-bold text-emerald-400">¡Meta lograda!</span>
                    ) : isAtLeyDe ? (
                      <span className="font-bold text-amber-400 animate-pulse">
                        ¡A ley de {pointsRemaining}!
                      </span>
                    ) : (
                      <span className="text-stone-400 font-medium">
                        Faltan {pointsRemaining}
                      </span>
                    )}
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-400 flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-stone-400 flex-shrink-0" />
                      <span>{player.handsWon} {player.handsWon === 1 ? 'mano' : 'manos'}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-0.5 sm:space-y-1 mb-1.5 sm:mb-4 landscape:mb-2">
                  <div className="flex justify-between text-[9px] sm:text-[11px] text-stone-400">
                    <span>Progreso</span>
                    <span className="font-mono font-medium">{progressPercent}%</span>
                  </div>
                  <div className="h-1 sm:h-2 w-full bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: player.color,
                      }}
                    />
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  id={`btn-add-points-${player.id}`}
                  onClick={() => onAddRoundForPlayer(player.id)}
                  className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-3 landscape:py-2 px-1.5 sm:px-4 rounded-xl text-stone-950 font-bold text-xs sm:text-base landscape:text-xs sm:landscape:text-sm shadow-md transition-all active:scale-[0.98] hover:brightness-110"
                  style={{
                    backgroundColor: player.color,
                  }}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5] flex-shrink-0" />
                  <span className="hidden sm:inline">Anotar Mano para {player.name}</span>
                  <span className="sm:hidden font-bold truncate">Anotar mano</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
