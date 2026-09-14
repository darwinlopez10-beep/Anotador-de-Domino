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

/**
 * Calculates next track intelligently from recently played history, curated playlist, or custom tracks
 */
export function getNextTrack(
  current: MusicTrack | null,
  history: MusicHistoryItem[] = [],
  curated: MusicTrack[] = [],
  customTracks: MusicTrack[] = []
): MusicTrack | null {
  if (!current) return curated[0] || customTracks[0] || null;

  // 1. Check if current is in customTracks
  if (customTracks && customTracks.length > 0) {
    const customIdx = customTracks.findIndex(
      (t) => (t.videoId && t.videoId === current.videoId) || t.id === current.id
    );
    if (customIdx !== -1) {
      if (customIdx < customTracks.length - 1) {
        return customTracks[customIdx + 1];
      } else {
        return curated.length > 0 ? curated[0] : customTracks[0];
      }
    }
  }

  // 2. Check if current is in curated list
  if (curated && curated.length > 0) {
    const curatedIdx = curated.findIndex(
      (t) => (t.videoId && t.videoId === current.videoId) || t.id === current.id
    );

    if (curatedIdx !== -1) {
      if (curatedIdx < curated.length - 1) {
        return curated[curatedIdx + 1];
      } else {
        // Wrap around to the start of curated
        return curated[0];
      }
    }
  }

  // 3. If in history
  if (history && history.length > 1) {
    const histIdx = history.findIndex(
      (h) => (h.track.videoId && h.track.videoId === current.videoId) || h.track.id === current.id
    );
    if (histIdx !== -1 && histIdx < history.length - 1) {
      return history[histIdx + 1].track;
    }
  }

  // 4. Default wrap-around to start of curated or custom
  return curated[0] || customTracks[0] || null;
}

/**
 * Calculates previous track
 */
export function getPrevTrack(
  current: MusicTrack | null,
  history: MusicHistoryItem[] = [],
  curated: MusicTrack[] = [],
  customTracks: MusicTrack[] = []
): MusicTrack | null {
  if (!current) return curated[0] || customTracks[0] || null;

  if (customTracks && customTracks.length > 0) {
    const customIdx = customTracks.findIndex(
      (t) => (t.videoId && t.videoId === current.videoId) || t.id === current.id
    );
    if (customIdx > 0) {
      return customTracks[customIdx - 1];
    } else if (customIdx === 0) {
      return customTracks[customTracks.length - 1];
    }
  }

  if (curated && curated.length > 0) {
    const curatedIdx = curated.findIndex(
      (t) => (t.videoId && t.videoId === current.videoId) || t.id === current.id
    );

    if (curatedIdx > 0) {
      return curated[curatedIdx - 1];
    } else if (curatedIdx === 0) {
      return curated[curated.length - 1];
    }
  }

  if (history && history.length > 1) {
    const histIdx = history.findIndex(
      (h) => (h.track.videoId && h.track.videoId === current.videoId) || h.track.id === current.id
    );
    if (histIdx > 0) {
      return history[histIdx - 1].track;
    }
  }

  return curated[curated.length - 1] || customTracks[0] || null;
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
