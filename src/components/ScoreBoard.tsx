import React, { useState } from 'react';
import { Plus, Edit2, Check, Flame, Award, Users, User } from 'lucide-react';
import { PlayerScore } from '../types';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface ScoreBoardProps {
  players: PlayerScore[];
  targetScore: number;
  lang: AppLanguage;
  onAddRoundForPlayer: (playerId: string) => void;
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onUpdatePlayerMembers?: (playerId: string, members: string[]) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  lang,
  onAddRoundForPlayer,
  onUpdatePlayerName,
  onUpdatePlayerMembers,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const t = TRANSLATIONS[lang];

  const highestScore = Math.max(...players.map((p) => p.score), 0);

  const startEdit = (player: PlayerScore) => {
    setEditingPlayerId(player.id);
    // Limpiar automáticamente si tiene el nombre por defecto ("Jugador 1", "Player 1", etc.)
    const isDefault = /^(jugador|player)\s*\d*$/i.test(player.name.trim());
    if (isDefault) {
      setEditingName('');
    } else {
      setEditingName(player.name);
    }
  };

  const saveEdit = (playerId: string, defaultName: string) => {
    const trimmed = editingName.trim();
    const finalName = trimmed || defaultName;
    onUpdatePlayerName(playerId, finalName);
    if (onUpdatePlayerMembers) {
      onUpdatePlayerMembers(playerId, [finalName]);
    }
    setEditingPlayerId(null);
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
          const isAtLeyDe = pointsRemaining > 0 && pointsRemaining <= 25; // Domino term!
          const displayName = formatPlayerDisplayName(player.name, lang);

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
                <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2 landscape:mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: player.color }}
                    />
                    {editingPlayerId === player.id ? (
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
                        {(() => {
                          const defaultFallback = player.id === 'team_1'
                            ? (lang === 'es' ? 'Jugador 1' : 'Player 1')
                            : player.id === 'team_2'
                            ? (lang === 'es' ? 'Jugador 2' : 'Player 2')
                            : displayName;
                          return (
                            <>
                              <input
                                type="text"
                                value={editingName}
                                placeholder={defaultFallback}
                                maxLength={25}
                                autoFocus
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(player.id, defaultFallback);
                                  if (e.key === 'Escape') setEditingPlayerId(null);
                                }}
                                className="bg-stone-900 border border-amber-500/60 rounded-lg px-2 py-0.5 text-base sm:text-xl text-stone-100 placeholder:text-stone-500 focus:outline-none w-full font-black"
                              />
                              <button
                                type="button"
                                onClick={() => saveEdit(player.id, defaultFallback)}
                                className="p-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs flex-shrink-0 cursor-pointer"
                                title={lang === 'es' ? 'Guardar nombre' : 'Save name'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group cursor-pointer min-w-0" onClick={() => startEdit(player)}>
                        <h2 className="text-xl sm:text-3xl landscape:text-2xl font-black text-stone-50 truncate tracking-tight">
                          {displayName}
                        </h2>
                        <button
                          type="button"
                          className="text-stone-400 hover:text-stone-200 opacity-80 group-hover:opacity-100 transition-opacity p-0.5 flex-shrink-0"
                          title={lang === 'es' ? 'Editar nombre' : 'Edit name'}
                        >
                          <Edit2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Leader Badge */}
                  {isLeader && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap flex-shrink-0 shadow-sm">
                      <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span>{t.leading}</span>
                    </span>
                  )}
                </div>

                {/* Main Score Digits Display */}
                <div className="my-1.5 sm:my-3 landscape:my-1 text-center py-2 sm:py-3.5 landscape:py-1 px-1.5 bg-stone-900/90 rounded-2xl border border-stone-750 shadow-inner shadow-black/40">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      id={`score-display-${player.id}`}
                      className="text-5xl sm:text-7xl md:text-8xl landscape:text-5xl sm:landscape:text-6xl font-black tracking-tight font-display text-amber-300 drop-shadow-[0_2px_14px_rgba(245,158,11,0.3)] select-all"
                    >
                      {player.score}
                    </span>
                    <span className="text-sm sm:text-lg font-extrabold text-stone-400">
                      / {targetScore}
                    </span>
                  </div>

                  {/* Status / Points to win */}
                  <div className="mt-1 sm:mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs leading-tight">
                    {pointsRemaining === 0 ? (
                      <span className="font-extrabold text-emerald-400">
                        {lang === 'es' ? '¡Meta lograda!' : 'Target reached!'}
                      </span>
                    ) : isAtLeyDe ? (
                      <span className="font-extrabold text-amber-400 animate-pulse">
                        {lang === 'es' ? `¡A ley de ${pointsRemaining}!` : `${pointsRemaining} ${t.pointsToWin}!`}
                      </span>
                    ) : (
                      <span className="text-stone-300 font-semibold">
                        {lang === 'es' ? `Faltan ${pointsRemaining}` : `${pointsRemaining} ${t.pointsToWin}`}
                      </span>
                    )}
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-300 font-medium flex items-center gap-0.5">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 flex-shrink-0" />
                      <span>
                        {player.handsWon}{' '}
                        {player.handsWon === 1
                          ? (lang === 'es' ? 'mano' : 'hand')
                          : (lang === 'es' ? 'manos' : 'hands')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-0.5 sm:space-y-1 mb-1.5 sm:mb-4 landscape:mb-2">
                  <div className="flex justify-between text-[9px] sm:text-[11px] text-stone-400">
                    <span>{lang === 'es' ? 'Progreso' : 'Progress'}</span>
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
                  <span className="hidden sm:inline">
                    {lang === 'es' ? `Anotar Mano para ${displayName}` : `Record Hand for ${displayName}`}
                  </span>
                  <span className="sm:hidden font-bold truncate">
                    {t.addPoints}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
