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
        className={`grid gap-2 sm:gap-3.5 ${
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
              className={`relative overflow-visible rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isLeader
                  ? 'bg-stone-850/95 border-amber-500/50 shadow-xl shadow-amber-950/25 ring-1 ring-amber-500/40'
                  : 'bg-stone-850/90 border-stone-800 shadow-lg'
              }`}
            >
              {/* Top team color banner line */}
              <div
                className="h-2 sm:h-2.5 w-full rounded-t-2xl flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />

              <div className="p-2.5 sm:p-5 landscape:p-3 flex flex-col justify-between flex-1">
                {/* Top Status Strip: Team label & Leader Badge (independent row so it never steals width from the name) */}
                <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[24px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 truncate">
                      {isTwoTeams
                        ? player.id === 'team_1'
                          ? (lang === 'es' ? 'Equipo 1' : 'Team 1')
                          : (lang === 'es' ? 'Equipo 2' : 'Team 2')
                        : `${t.player} ${player.id.replace(/\D/g, '')}`}
                    </span>
                  </div>

                  {/* Leader Badge positioned on dedicated row */}
                  {isLeader ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50 whitespace-nowrap flex-shrink-0 shadow-sm animate-pulse">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{t.leading}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-stone-500 font-medium font-mono">
                      {progressPercent}%
                    </span>
                  )}
                </div>

                {/* Player Name Box: Generous container with 100% width, no truncating, wrapping support */}
                <div className="mb-2">
                  {editingPlayerId === player.id ? (
                    <div className="w-full p-1.5 sm:p-2 bg-stone-900 rounded-xl border-2 border-amber-500/90 shadow-md">
                      {(() => {
                        const defaultFallback = player.id === 'team_1'
                          ? (lang === 'es' ? 'Jugador 1' : 'Player 1')
                          : player.id === 'team_2'
                          ? (lang === 'es' ? 'Jugador 2' : 'Player 2')
                          : displayName;
                        return (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingName}
                              placeholder={defaultFallback}
                              maxLength={35}
                              autoFocus
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(player.id, defaultFallback);
                                if (e.key === 'Escape') setEditingPlayerId(null);
                              }}
                              className="bg-transparent text-sm sm:text-lg md:text-xl text-stone-100 placeholder:text-stone-500 focus:outline-none w-full font-black min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(player.id, defaultFallback)}
                              className="p-1.5 sm:p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer shadow active:scale-95"
                              title={lang === 'es' ? 'Guardar nombre' : 'Save name'}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit(player)}
                      title={lang === 'es' ? 'Toca para editar nombre' : 'Tap to edit name'}
                      className="w-full min-h-[48px] sm:min-h-[58px] px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-900/80 hover:bg-stone-900 border border-stone-750/80 rounded-xl flex items-center justify-between gap-2 group cursor-pointer transition-colors shadow-inner"
                    >
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-2xl md:text-3xl font-black text-stone-50 break-words line-clamp-2 leading-tight tracking-tight">
                          {displayName}
                        </h2>
                      </div>
                      <div className="p-1 text-stone-400 group-hover:text-amber-400 transition-colors flex-shrink-0">
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Score Digits Display: Expanded, High Contrast, Ample Padding */}
                <div className="my-1 sm:my-2.5 landscape:my-1 text-center py-3 sm:py-5 landscape:py-2 px-2 sm:px-4 bg-stone-900/95 rounded-2xl border border-stone-750/90 shadow-inner shadow-black/50 overflow-visible">
                  <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                    <span
                      id={`score-display-${player.id}`}
                      className="text-5xl sm:text-7xl md:text-8xl landscape:text-5xl sm:landscape:text-6xl font-black tracking-tight font-display text-amber-300 drop-shadow-[0_2px_14px_rgba(245,158,11,0.3)] select-all leading-none"
                    >
                      {player.score}
                    </span>
                    <span className="text-xs sm:text-base font-extrabold text-stone-400 select-none">
                      / {targetScore}
                    </span>
                  </div>

                  {/* Status / Points to win */}
                  <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm leading-tight">
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
                    <span className="text-stone-300 font-medium flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
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
                <div className="space-y-1 mb-2 sm:mb-4 landscape:mb-2">
                  <div className="flex justify-between text-[10px] sm:text-xs text-stone-400">
                    <span>{lang === 'es' ? 'Progreso' : 'Progress'}</span>
                    <span className="font-mono font-bold text-stone-300">{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
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
                  className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3.5 landscape:py-2 px-2 sm:px-4 rounded-xl text-stone-950 font-black text-xs sm:text-base landscape:text-xs sm:landscape:text-sm shadow-md transition-all active:scale-[0.98] hover:brightness-110 cursor-pointer"
                  style={{
                    backgroundColor: player.color,
                  }}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] flex-shrink-0" />
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
