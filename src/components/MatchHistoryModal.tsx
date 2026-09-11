import React, { useState } from 'react';
import {
  X,
  Trophy,
  Calendar,
  Clock,
  Trash2,
  Award,
  Users,
  Swords,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  User,
  Medal,
  CheckCircle2,
  Sparkles,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { GameMode, PastMatch, WinReason } from '../types';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: PastMatch[];
  onDeleteMatch: (matchId: string) => void;
  onClearHistory: (mode?: GameMode) => void;
  canSaveCurrentGame?: boolean;
  onSaveCurrentGame?: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  matches,
  onDeleteMatch,
  onClearHistory,
  canSaveCurrentGame,
  onSaveCurrentGame,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'teams' | 'individual'>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter matches based on selected tab
  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'all') return true;
    return m.gameMode === activeTab;
  });

  const teamsMatches = matches.filter((m) => m.gameMode === 'teams');
  const individualMatches = matches.filter((m) => m.gameMode === 'individual');

  // Series Stats for Teams Mode
  const teamWinStats: Record<string, { wins: number; color: string; totalPoints: number }> = {};
  teamsMatches.forEach((m) => {
    if (!teamWinStats[m.winnerName]) {
      teamWinStats[m.winnerName] = { wins: 0, color: m.winnerColor, totalPoints: 0 };
    }
    teamWinStats[m.winnerName].wins += 1;
    m.finalScores.forEach((s) => {
      if (!teamWinStats[s.name]) {
        teamWinStats[s.name] = { wins: 0, color: s.color, totalPoints: 0 };
      }
      teamWinStats[s.name].totalPoints += s.score;
    });
  });

  // Series Stats for Individual Mode (Todos contra Todos)
  const individualWinStats: Record<string, { wins: number; color: string; totalPoints: number; matchesPlayed: number }> = {};
  individualMatches.forEach((m) => {
    m.finalScores.forEach((s) => {
      if (!individualWinStats[s.name]) {
        individualWinStats[s.name] = { wins: 0, color: s.color, totalPoints: 0, matchesPlayed: 0 };
      }
      individualWinStats[s.name].matchesPlayed += 1;
      individualWinStats[s.name].totalPoints += s.score;
    });
    if (individualWinStats[m.winnerName]) {
      individualWinStats[m.winnerName].wins += 1;
    }
  });

  const sortedIndividualRankings = Object.entries(individualWinStats).sort((a, b) => {
    if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
    return b[1].totalPoints - a[1].totalPoints;
  });

  const getBadgeForReason = (reason: WinReason) => {
    switch (reason) {
      case 'tranca':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Lock className="w-2.5 h-2.5" />
            Tranca
          </span>
        );
      case 'capicua':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            Capicúa
          </span>
        );
      case 'penalizacion':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            Penalización
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Dominó
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 font-display">
                Historial de Partidas
              </h3>
              <p className="text-xs text-stone-400">
                Guarda y consulta partidas por pareja e individual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canSaveCurrentGame && onSaveCurrentGame && (
              <button
                type="button"
                onClick={onSaveCurrentGame}
                title="Guardar estado de la partida actual en el historial"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Archivar actual</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {matches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'teams'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Por Parejas (2 Equipos)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {teamsMatches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'individual'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Individual (Todos vs Todos)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {individualMatches.length}
            </span>
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Mobile button to save current game */}
          {canSaveCurrentGame && onSaveCurrentGame && (
            <div className="sm:hidden">
              <button
                type="button"
                onClick={onSaveCurrentGame}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Archivar partida en curso al historial</span>
              </button>
            </div>
          )}

          {/* TEAMS MODE: Global Series Counter */}
          {activeTab === 'teams' && Object.keys(teamWinStats).length > 0 && (
            <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Récord de la Serie en Parejas
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {teamsMatches.length} {teamsMatches.length === 1 ? 'partida' : 'partidas'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(teamWinStats).map(([name, data]) => (
                  <div
                    key={name}
                    className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-xs font-bold text-stone-100 truncate">{name}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {data.totalPoints} pts acumulados
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black font-display text-amber-400">
                        {data.wins}
                      </span>
                      <span className="text-[10px] text-stone-400 block -mt-1 font-semibold">
                        victorias
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INDIVIDUAL MODE: Podio & Leaderboard */}
          {activeTab === 'individual' && sortedIndividualRankings.length > 0 && (
            <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-400" />
                  Tabla de Posiciones (Todos contra Todos)
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {individualMatches.length} {individualMatches.length === 1 ? 'partida' : 'partidas'}
                </span>
              </div>
              <div className="space-y-1.5">
                {sortedIndividualRankings.map(([name, data], idx) => (
                  <div
                    key={name}
                    className="px-3 py-2 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 text-center text-xs font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="text-xs font-bold text-stone-100 truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-stone-400">
                        {data.matchesPlayed} {data.matchesPlayed === 1 ? 'partida' : 'partidas'}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-amber-400 text-sm">
                          {data.wins} {data.wins === 1 ? 'victoria' : 'victorias'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-stone-500 bg-stone-850/40 rounded-2xl border border-dashed border-stone-800">
              <Trophy className="w-8 h-8 mx-auto text-stone-600 mb-2 opacity-50" />
              <p className="text-sm font-medium text-stone-400">
                No hay partidas registradas{' '}
                {activeTab === 'teams'
                  ? 'en la categoría por Parejas'
                  : activeTab === 'individual'
                  ? 'en Todos contra Todos'
                  : 'en el historial'}
                .
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Al terminar una partida o al pulsar &quot;Archivar actual&quot;, se guardará
                automáticamente con todo el detalle de sus manos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => {
                const isExpanded = expandedMatchId === match.id;
                const isTeams = match.gameMode === 'teams';

                return (
                  <div
                    key={match.id}
                    className="bg-stone-850/90 rounded-2xl border border-stone-800 overflow-hidden shadow-sm transition-all"
                  >
                    {/* Match Card Main Header */}
                    <div className="p-3.5 sm:p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isTeams
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            }`}
                          >
                            {isTeams ? 'Por Parejas' : 'Todos vs Todos'}
                          </span>
                          <span className="flex items-center gap-1 text-stone-400">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            {match.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-stone-400 text-[11px]">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {match.durationMinutes} min
                          </span>
                          <span className="text-stone-600">•</span>
                          <span className="text-stone-400 text-[11px]">
                            Meta: <strong>{match.targetScore}</strong> pts
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Deseas eliminar esta partida del historial?')) {
                                onDeleteMatch(match.id);
                              }
                            }}
                            title="Eliminar esta partida"
                            className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Winner highlight & final scores */}
                      <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-stone-400">Ganador:</span>
                            <span className="font-extrabold text-sm text-stone-100 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: match.winnerColor }}
                              />
                              {match.winnerName}
                            </span>
                          </div>
                          <span className="text-xs text-stone-400">
                            {match.totalRounds} {match.totalRounds === 1 ? 'mano' : 'manos'}
                          </span>
                        </div>

                        {/* Scores breakdown */}
                        {isTeams ? (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/60 text-xs">
                            {match.finalScores.map((team, idx) => {
                              const isWinner = team.name === match.winnerName;
                              const members = idx === 0 ? match.team1Members : match.team2Members;
                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg ${
                                    isWinner
                                      ? 'bg-amber-500/10 border border-amber-500/30'
                                      : 'bg-stone-950/60 border border-stone-800/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-stone-200 truncate">
                                      {team.name}
                                    </span>
                                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                                      {team.score}
                                    </span>
                                  </div>
                                  {members && members.length === 2 && (
                                    <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                                      <Users className="w-3 h-3 text-stone-500 flex-shrink-0" />
                                      <span className="truncate">
                                        {members[0]} &amp; {members[1]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-stone-800/60 text-xs">
                            {match.finalScores.map((p, idx) => {
                              const isWinner = p.name === match.winnerName;
                              return (
                                <div
                                  key={idx}
                                  className={`p-1.5 rounded-lg flex items-center justify-between ${
                                    isWinner
                                      ? 'bg-amber-500/15 border border-amber-500/30'
                                      : 'bg-stone-950/60 border border-stone-800/50'
                                  }`}
                                >
                                  <span className="font-medium text-stone-200 truncate pr-1">
                                    {p.name}
                                  </span>
                                  <span className="font-mono font-bold text-amber-400">
                                    {p.score}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Expandable detailed hands button */}
                      {match.rounds && match.rounds.length > 0 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            className="w-full py-1.5 px-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center justify-between border border-stone-800/80 transition-colors"
                          >
                            <span>
                              {isExpanded
                                ? 'Ocultar manos jugadas'
                                : `Ver detalle de las ${match.rounds.length} manos`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Expanded Hand-by-Hand Breakdown */}
                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 text-xs">
                              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                                Registro de Manos
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                {match.rounds.map((round) => (
                                  <div
                                    key={round.id}
                                    className="p-1.5 rounded bg-stone-900 border border-stone-800/70 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 text-stone-500 font-mono text-[11px]">
                                        #{round.roundNumber}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {getBadgeForReason(round.reason)}
                                        {round.winnerPlayerName && (
                                          <span className="text-[11px] text-stone-300 flex items-center gap-0.5">
                                            <User className="w-2.5 h-2.5 text-stone-400" />
                                            {round.winnerPlayerName}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {round.notes && (
                                        <span className="text-[10px] text-stone-500 italic truncate max-w-[100px]">
                                          {round.notes}
                                        </span>
                                      )}
                                      <span className="font-mono font-bold text-amber-400">
                                        +{round.points} pts
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {filteredMatches.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-800 bg-stone-850 flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Mostrando {filteredMatches.length} de {matches.length} partidas
            </span>

            <button
              type="button"
              onClick={() => {
                const confirmMsg =
                  activeTab === 'all'
                    ? '¿Deseas borrar TODO el historial de partidas guardadas?'
                    : activeTab === 'teams'
                    ? '¿Deseas borrar solo el historial de partidas por Parejas?'
                    : '¿Deseas borrar solo el historial de partidas Individuales?';

                if (window.confirm(confirmMsg)) {
                  onClearHistory(activeTab === 'all' ? undefined : activeTab);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/10 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'all'
                  ? 'Borrar todo'
                  : activeTab === 'teams'
                  ? 'Borrar parejas'
                  : 'Borrar individuales'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
