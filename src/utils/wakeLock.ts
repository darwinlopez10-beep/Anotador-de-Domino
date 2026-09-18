// Screen Wake Lock utility to keep the device display awake during domino matches

let wakeLockSentinel: WakeLockSentinel | null = null;
let keepAwakeRequested = false;
let fallbackVideo: HTMLVideoElement | null = null;

/**
 * Check if the native Screen Wake Lock API is supported
 */
export function isScreenWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/**
 * Fallback mechanism for browsers without WakeLock API or restricted iframes:
 * Plays a loop of a blank 1-second muted video to prevent screen dimming/sleep
 */
function enableFallbackVideo() {
  if (typeof document === 'undefined') return;
  if (fallbackVideo) return;

  try {
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.muted = true;
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';

    // A tiny, blank valid WebM video stream base64
    video.src = 'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17GDD0JAW5ic44AAQkCQAWlXgQJRh4EBU4EBVA==';
    document.body.appendChild(video);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be restricted until user interaction
      });
    }
    fallbackVideo = video;
  } catch (err) {
    console.debug('Wake lock fallback video not initialized', err);
  }
}

function disableFallbackVideo() {
  if (fallbackVideo) {
    try {
      fallbackVideo.pause();
      fallbackVideo.removeAttribute('src');
      fallbackVideo.load();
      if (fallbackVideo.parentNode) {
        fallbackVideo.parentNode.removeChild(fallbackVideo);
      }
    } catch {
      // Ignore cleanup error
    }
    fallbackVideo = null;
  }
}

/**
 * Request screen wake lock
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  keepAwakeRequested = true;

  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        return true;
      }
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Native WakeLock request failed, using fallback video', err);
      enableFallbackVideo();
      return true;
    }
  } else {
    enableFallbackVideo();
    return true;
  }
}

/**
 * Release screen wake lock (allow screen to turn off normally)
 */
export async function releaseScreenWakeLock(): Promise<void> {
  keepAwakeRequested = false;

  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignore release error
    }
    wakeLockSentinel = null;
  }
  disableFallbackVideo();
}

/**
 * Check if wake lock is currently active
 */
export function isScreenWakeLockActive(): boolean {
  return (wakeLockSentinel !== null && !wakeLockSentinel.released) || fallbackVideo !== null || keepAwakeRequested;
}

// Re-acquire lock when page becomes visible again if user requested it
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (keepAwakeRequested && document.visibilityState === 'visible') {
      await requestScreenWakeLock();
    }
  });
}
