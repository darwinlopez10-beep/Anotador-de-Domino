import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ScoreHeader } from './components/ScoreHeader';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundHistory } from './components/RoundHistory';
import { AddRoundModal } from './components/AddRoundModal';
import { TrancaCalculatorModal } from './components/TrancaCalculatorModal';
import { TurnTimerModal } from './components/TurnTimerModal';
import { SettingsModal } from './components/SettingsModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { VictoryModal } from './components/VictoryModal';
import { MusicPlayerModal } from './components/MusicPlayerModal';
import { MiniMusicPlayer } from './components/MiniMusicPlayer';
import {
  GameSettings,
  PlayerScore,
  Round,
  WinReason,
  PastMatch,
  MusicTrack,
  GameMode,
} from './types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadActiveGame,
  saveActiveGame,
  clearActiveGame,
  loadMatchHistory,
  savePastMatch,
  deletePastMatch,
  clearMatchHistory,
  loadCustomTracks,
  saveCustomTracks,
  ActiveGameState,
} from './utils/storage';
import {
  playScoreAddedSound,
  playUndoSound,
  playTileClickSound,
  triggerVibration,
} from './utils/sound';
import { Plus, Calculator, Timer, Trophy, Music } from 'lucide-react';

const TEAM_COLORS = ['#10b981', '#f59e0b', '#38bdf8', '#ec4899'];

function createInitialPlayers(settings: GameSettings): PlayerScore[] {
  if (settings.gameMode === 'teams') {
    return [
      {
        id: 'team_1',
        name: settings.team1Name || 'Nosotros',
        color: TEAM_COLORS[0],
        score: 0,
        handsWon: 0,
        members: settings.team1Members || ['Jugador 1', 'Jugador 2'],
      },
      {
        id: 'team_2',
        name: settings.team2Name || 'Ellos',
        color: TEAM_COLORS[1],
        score: 0,
        handsWon: 0,
        members: settings.team2Members || ['Jugador 3', 'Jugador 4'],
      },
    ];
  } else {
    return settings.individualPlayerNames.map((name, idx) => ({
      id: `player_${idx + 1}`,
      name: name || `Jugador ${idx + 1}`,
      color: TEAM_COLORS[idx % TEAM_COLORS.length],
      score: 0,
      handsWon: 0,
    }));
  }
}

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [players, setPlayers] = useState<PlayerScore[]>(() => {
    const saved = loadActiveGame();
    const currentSettings = loadSettings();
    if (saved && saved.players && saved.players.length > 0) {
      return saved.players.map((p) => {
        if (p.id === 'team_1' && (!p.members || p.members.length === 0)) {
          return { ...p, members: currentSettings.team1Members || ['Jugador 1', 'Jugador 2'] };
        }
        if (p.id === 'team_2' && (!p.members || p.members.length === 0)) {
          return { ...p, members: currentSettings.team2Members || ['Jugador 3', 'Jugador 4'] };
        }
        return p;
      });
    }
    return createInitialPlayers(currentSettings);
  });

  const [rounds, setRounds] = useState<Round[]>(() => {
    const saved = loadActiveGame();
    return saved?.rounds ?? [];
  });

  const [startTime, setStartTime] = useState<number>(() => {
    const saved = loadActiveGame();
    return saved?.startTime ?? Date.now();
  });

  const [matchOver, setMatchOver] = useState<boolean>(() => {
    const saved = loadActiveGame();
    return saved?.matchOver ?? false;
  });

  const [winnerId, setWinnerId] = useState<string | null>(() => {
    const saved = loadActiveGame();
    return saved?.winnerId ?? null;
  });

  const [pastMatches, setPastMatches] = useState<PastMatch[]>(() => loadMatchHistory());

  // Modal Visibility States
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [activeAddRoundPlayerId, setActiveAddRoundPlayerId] = useState<string | undefined>();
  const [isTrancaCalcOpen, setIsTrancaCalcOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

  // Music Player States
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [preMuteVolume, setPreMuteVolume] = useState(0.7);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [customTracks, setCustomTracks] = useState<MusicTrack[]>(() => loadCustomTracks());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and manage audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = musicVolume;

    const onTimeUpdate = () => {
      setMusicCurrentTime(audio.currentTime);
      setMusicDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsMusicPlaying(false);
      setMusicCurrentTime(0);
    };

    const onError = () => {
      setIsMusicPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    const state: ActiveGameState = {
      players,
      rounds,
      startTime,
      matchOver,
      winnerId,
    };
    saveActiveGame(state);
  }, [players, rounds, startTime, matchOver, winnerId]);

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Active winner player object
  const winnerPlayer = useMemo(() => {
    if (!winnerId) return null;
    return players.find((p) => p.id === winnerId) || null;
  }, [winnerId, players]);

  // Recalculate scores & hands won from a list of rounds
  const calculatePlayerStatsFromRounds = useCallback((
    basePlayers: PlayerScore[],
    roundList: Round[]
  ): PlayerScore[] => {
    const scoresMap: Record<string, number> = {};
    const handsWonMap: Record<string, number> = {};

    basePlayers.forEach((p) => {
      scoresMap[p.id] = 0;
      handsWonMap[p.id] = 0;
    });

    roundList.forEach((r) => {
      scoresMap[r.winnerId] = (scoresMap[r.winnerId] || 0) + r.points;
      handsWonMap[r.winnerId] = (handsWonMap[r.winnerId] || 0) + 1;
    });

    return basePlayers.map((p) => ({
      ...p,
      score: scoresMap[p.id] ?? 0,
      handsWon: handsWonMap[p.id] ?? 0,
    }));
  }, []);

  // Save a new round
  const handleSaveRound = (
    roundWinnerId: string,
    points: number,
    reason: WinReason,
    notes?: string,
    winnerPlayerName?: string
  ) => {
    if (points <= 0) return;

    // Calculate new running score for winner
    const updatedPlayers = players.map((p) => {
      if (p.id === roundWinnerId) {
        return {
          ...p,
          score: p.score + points,
          handsWon: p.handsWon + 1,
        };
      }
      return p;
    });

    const newSnapshot: Record<string, number> = {};
    updatedPlayers.forEach((p) => {
      newSnapshot[p.id] = p.score;
    });

    const newRound: Round = {
      id: `round_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      roundNumber: rounds.length + 1,
      winnerId: roundWinnerId,
      winnerPlayerName,
      points,
      reason,
      notes,
      timestamp: Date.now(),
      scoresSnapshot: newSnapshot,
    };

    const newRounds = [...rounds, newRound];
    setRounds(newRounds);
    setPlayers(updatedPlayers);

    playScoreAddedSound(settings.soundEnabled);
    triggerVibration(settings.vibrationEnabled, [40, 20, 60]);

    // Check if winner reached or surpassed target score
    const winningCandidate = updatedPlayers.find((p) => p.score >= settings.targetScore);
    if (winningCandidate) {
      setMatchOver(true);
      setWinnerId(winningCandidate.id);
      setIsVictoryOpen(true);

      // Save match to past match history
      const finalScoresList = updatedPlayers.map((p) => ({
        name: p.name,
        score: p.score,
        color: p.color,
        members: p.members,
      }));

      const team1 = updatedPlayers.find((p) => p.id === 'team_1');
      const team2 = updatedPlayers.find((p) => p.id === 'team_2');

      const pastMatch: PastMatch = {
        id: `match_${Date.now()}`,
        date: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        gameMode: settings.gameMode,
        targetScore: settings.targetScore,
        winnerName: winningCandidate.name,
        winnerColor: winningCandidate.color,
        finalScores: finalScoresList,
        totalRounds: newRounds.length,
        durationMinutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
        team1Members: settings.gameMode === 'teams' ? team1?.members : undefined,
        team2Members: settings.gameMode === 'teams' ? team2?.members : undefined,
        rounds: newRounds,
      };

      savePastMatch(pastMatch);
      setPastMatches((prev) => [pastMatch, ...prev.filter((m) => m.id !== pastMatch.id)]);
    }
  };

  // Quick action from scoreboard: opens add round modal for a specific player
  const handleOpenAddRoundForPlayer = (playerId: string) => {
    playTileClickSound(settings.soundEnabled);
    setActiveAddRoundPlayerId(playerId);
    setIsAddRoundOpen(true);
  };

  // Undo last round
  const handleUndoLastRound = () => {
    if (rounds.length === 0) return;
    playUndoSound(settings.soundEnabled);
    triggerVibration(settings.vibrationEnabled, 30);

    const remainingRounds = rounds.slice(0, -1);
    const updatedPlayers = calculatePlayerStatsFromRounds(players, remainingRounds);

    setRounds(remainingRounds);
    setPlayers(updatedPlayers);

    // If match was over, re-evaluate
    const hasWinner = updatedPlayers.some((p) => p.score >= settings.targetScore);
    if (!hasWinner) {
      setMatchOver(false);
      setWinnerId(null);
    }
  };

  // Delete a specific round by id
  const handleDeleteRound = (roundId: string) => {
    playUndoSound(settings.soundEnabled);
    triggerVibration(settings.vibrationEnabled, 30);

    const filtered = rounds.filter((r) => r.id !== roundId);
    // Re-index round numbers
    const reindexed = filtered.map((r, idx) => ({
      ...r,
      roundNumber: idx + 1,
    }));

    const updatedPlayers = calculatePlayerStatsFromRounds(players, reindexed);

    // Rebuild snapshots
    let runningScores: Record<string, number> = {};
    players.forEach((p) => (runningScores[p.id] = 0));

    const finalRounds = reindexed.map((r) => {
      runningScores[r.winnerId] = (runningScores[r.winnerId] || 0) + r.points;
      return {
        ...r,
        scoresSnapshot: { ...runningScores },
      };
    });

    setRounds(finalRounds);
    setPlayers(updatedPlayers);

    const hasWinner = updatedPlayers.some((p) => p.score >= settings.targetScore);
    if (!hasWinner) {
      setMatchOver(false);
      setWinnerId(null);
    }
  };

  // Reset / New Game
  const handleNewGame = () => {
    if (rounds.length > 0) {
      const confirmed = window.confirm(
        '¿Deseas reiniciar la partida actual? Los puntos de esta partida volverán a 0.'
      );
      if (!confirmed) return;
    }

    playTileClickSound(settings.soundEnabled);
    clearActiveGame();
    setRounds([]);
    setMatchOver(false);
    setWinnerId(null);
    setStartTime(Date.now());
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        handsWon: 0,
      }))
    );
  };

  // Rematch after victory
  const handleRematch = () => {
    playTileClickSound(settings.soundEnabled);
    setIsVictoryOpen(false);
    setRounds([]);
    setMatchOver(false);
    setWinnerId(null);
    setStartTime(Date.now());
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        handsWon: 0,
      }))
    );
  };

  // Open settings from victory modal
  const handleNewGameSetup = () => {
    setIsVictoryOpen(false);
    setIsSettingsOpen(true);
  };

  // Update a single player's name inline
  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
    );
    // Also sync with settings
    if (settings.gameMode === 'teams') {
      if (playerId === 'team_1') {
        setSettings((s) => ({ ...s, team1Name: newName }));
      } else if (playerId === 'team_2') {
        setSettings((s) => ({ ...s, team2Name: newName }));
      }
    }
  };

  // Update members for a team (Nosotros / Ellos)
  const handleUpdatePlayerMembers = (playerId: string, members: string[]) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, members } : p))
    );
    // Also sync with settings
    if (playerId === 'team_1') {
      setSettings((s) => ({ ...s, team1Members: members }));
    } else if (playerId === 'team_2') {
      setSettings((s) => ({ ...s, team2Members: members }));
    }
  };

  // Apply tranca points from calculator
  const handleApplyTrancaPoints = (
    trancaWinnerId: string,
    points: number,
    notes: string
  ) => {
    handleSaveRound(trancaWinnerId, points, 'tranca', notes);
  };

  // Save modified settings
  const handleSaveSettings = (newSettings: GameSettings, shouldResetGame: boolean) => {
    setSettings(newSettings);

    const modeChanged = newSettings.gameMode !== settings.gameMode;
    const countChanged =
      newSettings.gameMode === 'individual' &&
      newSettings.individualPlayerNames.length !== players.length;

    if (shouldResetGame || modeChanged || countChanged) {
      // Re-initialize players completely
      const newPlayers = createInitialPlayers(newSettings);
      setPlayers(newPlayers);
      setRounds([]);
      setMatchOver(false);
      setWinnerId(null);
      setStartTime(Date.now());
      clearActiveGame();
    } else {
      // Update team names and members in existing players while preserving current points
      setPlayers((prev) => {
        if (newSettings.gameMode === 'teams') {
          return prev.map((p) => {
            if (p.id === 'team_1') {
              return {
                ...p,
                name: newSettings.team1Name,
                members: newSettings.team1Members || p.members,
              };
            }
            if (p.id === 'team_2') {
              return {
                ...p,
                name: newSettings.team2Name,
                members: newSettings.team2Members || p.members,
              };
            }
            return p;
          });
        } else {
          return prev.map((p, idx) => ({
            ...p,
            name: newSettings.individualPlayerNames[idx] || p.name,
          }));
        }
      });
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // History Handlers
  const handleManualSaveMatch = () => {
    if (rounds.length === 0) {
      alert('Anota al menos una mano para poder archivar la partida en el historial.');
      return;
    }

    const sorted = [...players].sort((a, b) => b.score - a.score);
    const leader = sorted[0];

    const finalScoresList = players.map((p) => ({
      name: p.name,
      score: p.score,
      color: p.color,
      members: p.members,
    }));

    const team1 = players.find((p) => p.id === 'team_1');
    const team2 = players.find((p) => p.id === 'team_2');

    const pastMatch: PastMatch = {
      id: `match_${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      gameMode: settings.gameMode,
      targetScore: settings.targetScore,
      winnerName: leader.name,
      winnerColor: leader.color,
      finalScores: finalScoresList,
      totalRounds: rounds.length,
      durationMinutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      team1Members: settings.gameMode === 'teams' ? team1?.members : undefined,
      team2Members: settings.gameMode === 'teams' ? team2?.members : undefined,
      rounds: [...rounds],
    };

    savePastMatch(pastMatch);
    setPastMatches((prev) => [pastMatch, ...prev.filter((m) => m.id !== pastMatch.id)]);
    alert('¡Partida archivada con éxito en el historial!');
  };

  const handleDeletePastMatch = (matchId: string) => {
    deletePastMatch(matchId);
    setPastMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const handleClearMatchHistory = (mode?: GameMode) => {
    clearMatchHistory(mode);
    if (!mode) {
      setPastMatches([]);
    } else {
      setPastMatches((prev) => prev.filter((m) => m.gameMode !== mode));
    }
  };

  // Music Handlers
  const handleSelectMusicTrack = (track: MusicTrack) => {
    setCurrentMusicTrack(track);

    if (track.sourceType === 'youtube') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsMusicPlaying(true);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch((err) => {
            console.warn('Playback notice:', err);
            setIsMusicPlaying(false);
          });
      }
    }
  };

  const handleToggleMusicPlay = () => {
    if (!currentMusicTrack) {
      setIsMusicModalOpen(true);
      return;
    }

    if (currentMusicTrack.sourceType === 'youtube') {
      setIsMusicPlaying((prev) => !prev);
    } else if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch((err) => console.warn(err));
      }
    }
  };

  const handleMusicVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setMusicVolume(clamped);
    if (clamped > 0) {
      setPreMuteVolume(clamped);
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const handleToggleMute = () => {
    if (musicVolume > 0) {
      // Guardar el nivel exacto antes de silenciar
      setPreMuteVolume(musicVolume);
      setMusicVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    } else {
      // Restaurar exactamente al nivel previo donde el usuario lo tenía
      const restored = preMuteVolume > 0 ? preMuteVolume : 0.7;
      setMusicVolume(restored);
      if (audioRef.current) {
        audioRef.current.volume = restored;
      }
    }
  };

  const handleAddCustomTrack = (track: MusicTrack) => {
    const updated = [track, ...customTracks];
    setCustomTracks(updated);
    saveCustomTracks(updated);
  };

  const handleDeleteCustomTrack = (trackId: string) => {
    const updated = customTracks.filter((t) => t.id !== trackId);
    setCustomTracks(updated);
    saveCustomTracks(updated);
  };

  const handleCloseMusicPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsMusicPlaying(false);
    setCurrentMusicTrack(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <ScoreHeader
        targetScore={settings.targetScore}
        gameMode={settings.gameMode}
        soundEnabled={settings.soundEnabled}
        isMusicPlaying={isMusicPlaying}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTrancaCalc={() => setIsTrancaCalcOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMusic={() => setIsMusicModalOpen(true)}
        onNewGame={handleNewGame}
        roundsCount={rounds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-6 landscape:p-3 space-y-3 sm:space-y-5 landscape:space-y-3 pb-28 sm:pb-16 landscape:pb-16">
        {/* Score Board Cards */}
        <ScoreBoard
          players={players}
          targetScore={settings.targetScore}
          onAddRoundForPlayer={handleOpenAddRoundForPlayer}
          onUpdatePlayerName={handleUpdatePlayerName}
          onUpdatePlayerMembers={handleUpdatePlayerMembers}
        />

        {/* Quick Utilities Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-quick-tranca"
            onClick={() => setIsTrancaCalcOpen(true)}
            title="Calcular Tranca / Cierre"
            className="flex-1 py-2.5 sm:py-3 landscape:py-2 px-3 sm:px-4 bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl sm:rounded-2xl border border-stone-750 font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm active:scale-95 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Calculadora Tranca</span>
          </button>

          <button
            id="btn-quick-music"
            onClick={() => setIsMusicModalOpen(true)}
            title="Buscar música o reproducir"
            className={`flex-1 py-2.5 sm:py-3 landscape:py-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm active:scale-95 shadow-sm ${
              isMusicPlaying
                ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-red-950/40'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border-stone-750'
            }`}
          >
            <Music className={`w-4 h-4 text-amber-400 flex-shrink-0 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
            <span>Música</span>
          </button>
        </div>

        {/* Round History Table */}
        <RoundHistory
          rounds={rounds}
          players={players}
          onUndoLastRound={handleUndoLastRound}
          onDeleteRound={handleDeleteRound}
        />
      </main>

      {/* Persistent Mini Music Player Bar when a track is chosen */}
      {currentMusicTrack && (
        <MiniMusicPlayer
          track={currentMusicTrack}
          isPlaying={isMusicPlaying}
          volume={musicVolume}
          currentTime={musicCurrentTime}
          duration={musicDuration}
          onTogglePlay={handleToggleMusicPlay}
          onVolumeChange={handleMusicVolumeChange}
          onToggleMute={handleToggleMute}
          onOpenFullPlayer={() => setIsMusicModalOpen(true)}
          onClosePlayer={handleCloseMusicPlayer}
        />
      )}

      {/* Bottom Sticky Mobile Navigation (hidden in landscape to keep both score cards full view) */}
      <nav className="sm:hidden landscape:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveAddRoundPlayerId(undefined);
            setIsAddRoundOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-amber-400"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span className="text-[10px] font-bold">Anotar</span>
        </button>

        <button
          onClick={() => setIsTrancaCalcOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200"
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium">Tranca</span>
        </button>

        <button
          onClick={() => setIsTimerOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200"
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reloj</span>
        </button>

        <button
          onClick={() => setIsMusicModalOpen(true)}
          className={`flex flex-col items-center gap-1 ${
            isMusicPlaying ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Music className={`w-5 h-5 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
          <span className="text-[10px] font-medium">Música</span>
        </button>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">Partidas</span>
        </button>
      </nav>

      {/* Modals */}
      <AddRoundModal
        isOpen={isAddRoundOpen}
        onClose={() => setIsAddRoundOpen(false)}
        players={players}
        defaultWinnerId={activeAddRoundPlayerId}
        roundNumber={rounds.length + 1}
        capicuaBonus={settings.capicuaBonus}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onSaveRound={handleSaveRound}
        onUpdatePlayerMembers={handleUpdatePlayerMembers}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      <TrancaCalculatorModal
        isOpen={isTrancaCalcOpen}
        onClose={() => setIsTrancaCalcOpen(false)}
        players={players}
        trancaRule={settings.trancaRule}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onApplyTrancaPoints={handleApplyTrancaPoints}
      />

      <TurnTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        defaultSeconds={settings.timerDurationSeconds}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        matches={pastMatches}
        onDeleteMatch={handleDeletePastMatch}
        onClearHistory={handleClearMatchHistory}
        canSaveCurrentGame={rounds.length > 0}
        onSaveCurrentGame={handleManualSaveMatch}
      />

      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        currentTrack={currentMusicTrack}
        isPlaying={isMusicPlaying}
        volume={musicVolume}
        onSelectTrack={handleSelectMusicTrack}
        onTogglePlay={handleToggleMusicPlay}
        onVolumeChange={handleMusicVolumeChange}
        onToggleMute={handleToggleMute}
        customTracks={customTracks}
        onAddCustomTrack={handleAddCustomTrack}
        onDeleteCustomTrack={handleDeleteCustomTrack}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        winner={winnerPlayer}
        players={players}
        rounds={rounds}
        targetScore={settings.targetScore}
        startTime={startTime}
        soundEnabled={settings.soundEnabled}
        onRematch={handleRematch}
        onNewGameSetup={handleNewGameSetup}
      />
    </div>
  );
}
