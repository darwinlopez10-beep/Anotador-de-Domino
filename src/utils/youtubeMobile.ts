/**
 * Utilities for opening YouTube and YouTube Music seamlessly on mobile phones and desktop.
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Returns the best universal web link for a YouTube video.
 * On mobile, modern OSs (Android App Links & iOS Universal Links)
 * automatically offer to open or directly launch the YouTube app.
 */
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}&feature=share`;
}

/**
 * Returns direct YouTube App scheme links for mobile.
 */
export function getYouTubeAppDeepLink(videoId: string): string {
  if (isAndroid()) {
    // Android standard app URI
    return `vnd.youtube:${videoId}`;
  }
  if (isIOS()) {
    // iOS YouTube app URI
    return `youtube://watch?v=${videoId}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Returns YouTube search URL for mobile / web
 */
export function getYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Open video in YouTube on mobile or desktop.
 * Tries the native app deep link if requested on mobile, falling back to universal web URL.
 */
export function openInYouTube(videoId: string, preferNativeApp: boolean = true): void {
  if (!videoId) return;

  const webUrl = getYouTubeWatchUrl(videoId);

  try {
    const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = webUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    window.location.href = webUrl;
  }
}

/**
 * Open search query in YouTube on mobile or desktop
 */
export function openYouTubeSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const searchUrl = getYouTubeSearchUrl(q);

  try {
    const win = window.open(searchUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = searchUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    window.location.href = searchUrl;
  }
}
