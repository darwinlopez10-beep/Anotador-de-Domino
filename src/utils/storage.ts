import { GameMode, GameSettings, MusicTrack, PastMatch, PlayerScore, Round } from '../types';

const STORAGE_KEYS = {
  CURRENT_GAME: 'domino_current_game_v1',
  SETTINGS: 'domino_settings_v1',
  MATCH_HISTORY: 'domino_match_history_v1',
  CUSTOM_TRACKS: 'domino_custom_tracks_v1',
};

export const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 100,
  gameMode: 'teams',
  team1Name: 'Nosotros',
  team2Name: 'Ellos',
  team1Members: ['Jugador 1', 'Jugador 2'],
  team2Members: ['Jugador 1', 'Jugador 2'],
  individualPlayerNames: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
  trancaRule: 'sum_opponent', // sum_opponent: suma de todas las fichas de los rivales
  capicuaBonus: 25, // bonus opcional para capicúa si aplica
  soundEnabled: true,
  vibrationEnabled: true,
  timerDurationSeconds: 25,
};

export interface ActiveGameState {
  players: PlayerScore[];
  rounds: Round[];
  startTime: number;
  matchOver: boolean;
  winnerId: string | null;
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      team1Members: parsed.team1Members || DEFAULT_SETTINGS.team1Members,
      team2Members: parsed.team2Members || DEFAULT_SETTINGS.team2Members,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadActiveGame(): ActiveGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveGame(state: ActiveGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export function clearActiveGame(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch {
    // Ignore
  }
}

export function loadMatchHistory(): PastMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePastMatch(match: PastMatch): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadMatchHistory();
    // Prepend new match, avoiding duplicates
    const filtered = history.filter((m) => m.id !== match.id);
    const updated = [match, ...filtered.slice(0, 99)]; // keep up to 100 games
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function deletePastMatch(matchId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadMatchHistory();
    const updated = history.filter((m) => m.id !== matchId);
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function clearMatchHistory(mode?: GameMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (!mode) {
      localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
    } else {
      const history = loadMatchHistory();
      const updated = history.filter((m) => m.gameMode !== mode);
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }
}

export function loadCustomTracks(): MusicTrack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TRACKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomTracks(tracks: MusicTrack[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TRACKS, JSON.stringify(tracks));
  } catch {
    // Ignore
  }
}
