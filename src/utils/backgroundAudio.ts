import { MusicTrack, MusicHistoryItem } from '../types';

/**
 * Minimal 44-byte PCM WAV silence data URI.
 * Recognised natively across Android (Chrome, Samsung Internet, Edge), iOS (Safari), macOS, and Windows.
 * Looping this silent audio element flags the tab to the OS media subsystem as an active audio session,
 * preventing mobile browsers from killing or suspending the background media process when switching apps or locking the screen.
 */
export const SILENT_AUDIO_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

/**
 * Configure system Media Session API (Android Notification Bar, Lock Screen, iOS Control Center, Bluetooth headsets)
 */
export function syncMediaSession({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onStop,
}: {
  track: MusicTrack | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onStop?: () => void;
}) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

  if (!track) {
    try {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    } catch {}
    return;
  }

  try {
    const artwork = track.artworkUrl
      ? [
          { src: track.artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: track.artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: track.artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: track.artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: track.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      : [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || 'Anotador de Dominó Pro',
      album: 'Música en Segundo Plano • Dominó',
      artwork,
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => {
      onPlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      onPause();
    });

    if (onNext) {
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        onNext();
      });
    }

    if (onPrev) {
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        onPrev();
      });
    }

    if (onStop) {
      navigator.mediaSession.setActionHandler('stop', () => {
        onStop();
      });
    }
  } catch (err) {
    console.warn('MediaSession synchronization notice:', err);
  }
}

export function parseDurationText(durationText?: string): number {
  if (!durationText) return 0;
  const parts = durationText.trim().split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function getTrackObject(item: any): MusicTrack | null {
  if (!item) return null;
  if (item.track && typeof item.track === 'object') {
    return item.track as MusicTrack;
  }
  if (typeof item === 'object' && (item.title || item.artist || item.id || item.videoId)) {
    return item as MusicTrack;
  }
  return null;
}

function findTrackIndex(list: any[], track: MusicTrack): number {
  if (!list || list.length === 0 || !track) return -1;
  const cTitle = (track.title || '').trim().toLowerCase();
  const cArtist = (track.artist || '').trim().toLowerCase();
  const cVid = track.videoId || null;
  const cId = track.id || null;

  return list.findIndex((raw) => {
    const item = getTrackObject(raw);
    if (!item) return false;
    if (cId && item.id === cId) return true;
    if (cVid && item.videoId && item.videoId === cVid) return true;
    if (
      cTitle &&
      cArtist &&
      (item.title || '').trim().toLowerCase() === cTitle &&
      (item.artist || '').trim().toLowerCase() === cArtist
    ) {
      return true;
    }
    if (
      cTitle &&
      item.title &&
      (item.title.toLowerCase().includes(cTitle) || cTitle.includes(item.title.toLowerCase()))
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Calculates next track intelligently from active playlist, curated playlist, or custom tracks.
 * Seamlessly loops forward through the playlist.
 */
export function getNextTrack(
  current: MusicTrack | null,
  playlist: any[] = [],
  curated: MusicTrack[] = [],
  customTracks: MusicTrack[] = []
): MusicTrack | null {
  if (!current) {
    return (
      getTrackObject(playlist[0]) ||
      curated[0] ||
      customTracks[0] ||
      null
    );
  }

  // 1. Search in active playlist (search results, most played, recent, or custom)
  if (playlist && playlist.length > 0) {
    const idx = findTrackIndex(playlist, current);
    if (idx !== -1) {
      return getTrackObject(playlist[(idx + 1) % playlist.length]);
    }
  }

  // 2. Search in curated tracks
  if (curated && curated.length > 0) {
    const idx = findTrackIndex(curated, current);
    if (idx !== -1) {
      return curated[(idx + 1) % curated.length];
    }
  }

  // 3. Search in custom tracks
  if (customTracks && customTracks.length > 0) {
    const idx = findTrackIndex(customTracks, current);
    if (idx !== -1) {
      return customTracks[(idx + 1) % customTracks.length];
    }
  }

  // Fallback: wrap to start of playlist or curated
  if (playlist && playlist.length > 0) return getTrackObject(playlist[0]);
  if (curated && curated.length > 0) return curated[0];
  if (customTracks && customTracks.length > 0) return customTracks[0];
  return null;
}

/**
 * Calculates previous track from active playlist, curated playlist, or custom tracks.
 * Seamlessly loops backward through the playlist.
 */
export function getPrevTrack(
  current: MusicTrack | null,
  playlist: any[] = [],
  curated: MusicTrack[] = [],
  customTracks: MusicTrack[] = []
): MusicTrack | null {
  if (!current) {
    return (
      getTrackObject(playlist[playlist.length - 1]) ||
      curated[curated.length - 1] ||
      customTracks[customTracks.length - 1] ||
      null
    );
  }

  // 1. Search in active playlist
  if (playlist && playlist.length > 0) {
    const idx = findTrackIndex(playlist, current);
    if (idx !== -1) {
      return getTrackObject(playlist[(idx - 1 + playlist.length) % playlist.length]);
    }
  }

  // 2. Search in curated tracks
  if (curated && curated.length > 0) {
    const idx = findTrackIndex(curated, current);
    if (idx !== -1) {
      return curated[(idx - 1 + curated.length) % curated.length];
    }
  }

  // 3. Search in custom tracks
  if (customTracks && customTracks.length > 0) {
    const idx = findTrackIndex(customTracks, current);
    if (idx !== -1) {
      return customTracks[(idx - 1 + customTracks.length) % customTracks.length];
    }
  }

  if (playlist && playlist.length > 0) return getTrackObject(playlist[playlist.length - 1]);
  if (curated && curated.length > 0) return curated[curated.length - 1];
  if (customTracks && customTracks.length > 0) return customTracks[customTracks.length - 1];
  return null;
}

/**
 * Send postMessage commands safely to a YouTube IFrame
 */
export function sendYouTubeIframeCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: (string | number)[] = []
) {
  if (!iframe?.contentWindow) return;
  try {
    const message = JSON.stringify({
      event: 'command',
      func,
      args,
    });
    iframe.contentWindow.postMessage(message, '*');
  } catch {
    // Cross-origin safe ignore
  }
}
