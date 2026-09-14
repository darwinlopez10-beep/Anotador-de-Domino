import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  X,
  Disc3,
  Maximize2,
  Youtube,
  Tv,
  Plus,
  Minus,
  Sliders,
  ExternalLink,
  SkipBack,
  SkipForward,
  Radio,
  Repeat,
} from 'lucide-react';
import { MusicTrack } from '../types';
import { AppLanguage } from '../utils/i18n';
import { extractYouTubeId } from './MusicPlayerModal';

interface MiniMusicPlayerProps {
  track: MusicTrack;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onVolumeChange: (newVol: number) => void;
  onToggleMute?: () => void;
  onOpenFullPlayer: () => void;
  onClosePlayer: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  isAutoplay?: boolean;
  onToggleAutoplay?: () => void;
  isModalOpen?: boolean;
  lang?: AppLanguage;
}

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  track,
  isPlaying,
  volume,
  currentTime,
  duration,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  onOpenFullPlayer,
  onClosePlayer,
  onNextTrack,
  onPrevTrack,
  isAutoplay = true,
  onToggleAutoplay,
  isModalOpen = false,
  lang = 'es',
}) => {
  const [showVideo, setShowVideo] = useState(true);
  const [showVolumeControls, setShowVolumeControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const preMuteRef = useRef(volume > 0 ? volume : 0.7);

  // Mantener guardado el último volumen activo no nulo
  useEffect(() => {
    if (volume > 0) {
      preMuteRef.current = volume;
    }
  }, [volume]);

  const handleMuteClick = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      if (volume > 0) {
        preMuteRef.current = volume;
        onVolumeChange(0);
      } else {
        const restored = preMuteRef.current > 0 ? preMuteRef.current : 0.7;
        onVolumeChange(restored);
      }
    }
  };

  const isYouTube = track.sourceType === 'youtube';
  const ytVideoId = track.videoId || extractYouTubeId(track.url);

  // Calculate percentage for progress bar
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Helper to send commands to YouTube IFrame API
  const sendYouTubeCommand = (func: string, args: (string | number)[] = []) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const message = JSON.stringify({
        event: 'command',
        func,
        args,
      });
      iframeRef.current.contentWindow.postMessage(message, '*');
    } catch (err) {
      console.warn('YouTube postMessage notice:', err);
    }
  };

  // Handle Play / Pause for YouTube iframe via postMessage
  useEffect(() => {
    if (!isYouTube || !iframeLoaded) return;

    if (isPlaying) {
      sendYouTubeCommand('playVideo');
      const t = setTimeout(() => sendYouTubeCommand('playVideo'), 100);
      return () => clearTimeout(t);
    } else {
      sendYouTubeCommand('pauseVideo');
      const t = setTimeout(() => sendYouTubeCommand('pauseVideo'), 100);
      return () => clearTimeout(t);
    }
  }, [isPlaying, isYouTube, iframeLoaded]);

  // Handle Volume change for YouTube iframe (0 to 100)
  useEffect(() => {
    if (!isYouTube || !iframeLoaded) return;

    const targetVol = Math.round(volume * 100);

    if (volume === 0) {
      sendYouTubeCommand('mute');
      sendYouTubeCommand('setVolume', [0]);
    } else {
      sendYouTubeCommand('unMute');
      sendYouTubeCommand('setVolume', [targetVol]);
    }
  }, [volume, isYouTube, iframeLoaded]);

  // Protección y resistencia para reproducción en segundo plano:
  // Cuando el usuario cambia de app (WhatsApp, navegador, etc.) o bloquea la pantalla,
  // los navegadores móviles pueden intentar pausar videos en iframes.
  // Enviamos inmediatamente el comando playVideo para evitar la pausa automática.
  useEffect(() => {
    if (!isYouTube) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying) {
        sendYouTubeCommand('playVideo');
        setTimeout(() => sendYouTubeCommand('playVideo'), 150);
        setTimeout(() => sendYouTubeCommand('playVideo'), 450);
        setTimeout(() => sendYouTubeCommand('playVideo'), 1200);
      } else if (document.visibilityState === 'visible' && isPlaying) {
        sendYouTubeCommand('playVideo');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, [isYouTube, isPlaying]);

  // Guard against duplicate triggers of next track for the same song
  const hasTriggeredNextRef = useRef(false);
  const prevLoadedVideoIdRef = useRef<string | null>(ytVideoId || track.id || null);

  // Reset trigger flag when track changes
  useEffect(() => {
    hasTriggeredNextRef.current = false;
  }, [track.id, track.videoId]);

  const triggerNextTrack = useCallback(() => {
    // If Autoplay is disabled, pause instead of skipping automatically
    if (!isAutoplay) {
      if (isPlaying) {
        onTogglePlay();
      }
      return;
    }

    if (hasTriggeredNextRef.current) return;
    hasTriggeredNextRef.current = true;
    if (onNextTrack) {
      onNextTrack();
    }
  }, [isAutoplay, isPlaying, onTogglePlay, onNextTrack]);

  // Listen to YouTube postMessage events (onStateChange: 0 means ENDED, infoDelivery playerState: 0)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || typeof data !== 'object') return;

      // 1. YouTube onStateChange event:
      // YT.PlayerState.ENDED = 0
      if (data.event === 'onStateChange') {
        const state = data.info !== undefined ? data.info : data.data;
        if (state === 0) {
          triggerNextTrack();
        }
      }

      // 2. YouTube infoDelivery event:
      if (data.event === 'infoDelivery' && data.info) {
        if (data.info.playerState === 0) {
          triggerNextTrack();
        } else if (
          typeof data.info.currentTime === 'number' &&
          typeof data.info.duration === 'number' &&
          data.info.duration > 10 &&
          data.info.currentTime >= data.info.duration - 1.2
        ) {
          triggerNextTrack();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isYouTube, triggerNextTrack]);

  // Polling fallback to query YouTube player state and detect song completion
  useEffect(() => {
    if (!isYouTube || !isPlaying || !iframeLoaded) return;

    const interval = setInterval(() => {
      sendYouTubeCommand('getPlayerState');
      sendYouTubeCommand('getCurrentTime');
      sendYouTubeCommand('getDuration');
    }, 1500);

    return () => clearInterval(interval);
  }, [isYouTube, isPlaying, iframeLoaded]);

  // Construct standard embed URL with JavaScript API enabled and origin
  const originParam =
    typeof window !== 'undefined' && window.location.origin
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';

  const embedUrl = ytVideoId
    ? `https://www.youtube.com/embed/${ytVideoId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&version=3&rel=0${originParam}`
    : track.url && track.url.includes('embed')
    ? `${track.url}&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&version=3&rel=0${originParam}`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
        track.artist + ' ' + track.title
      )}&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&version=3&rel=0${originParam}`;

  // Handle seamless track transition in existing iframe on mobile
  // Mobile browsers block autoplay if a new iframe DOM element is mounted,
  // but allow loadVideoById on an already activated iframe!
  useEffect(() => {
    if (!isYouTube || !iframeLoaded) return;

    const currentKey = ytVideoId || track.id || track.url;
    if (prevLoadedVideoIdRef.current === currentKey) return;
    prevLoadedVideoIdRef.current = currentKey;

    if (ytVideoId) {
      sendYouTubeCommand('loadVideoById', [ytVideoId, 0]);
      sendYouTubeCommand('setVolume', [Math.round(volume * 100)]);
      if (volume === 0) {
        sendYouTubeCommand('mute');
      } else {
        sendYouTubeCommand('unMute');
      }
      sendYouTubeCommand('playVideo');
      const t1 = setTimeout(() => sendYouTubeCommand('playVideo'), 200);
      const t2 = setTimeout(() => sendYouTubeCommand('playVideo'), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (track.url) {
      sendYouTubeCommand('loadVideoByUrl', [embedUrl]);
      sendYouTubeCommand('playVideo');
    }
  }, [ytVideoId, track.id, track.url, isYouTube, iframeLoaded, volume, embedUrl]);

  // When YouTube iframe finishes loading, initialize its state
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    sendYouTubeCommand('listening');
    sendYouTubeCommand('addEventListener', ['onStateChange']);
    sendYouTubeCommand('setVolume', [Math.round(volume * 100)]);

    if (volume === 0) {
      sendYouTubeCommand('mute');
    }

    if (!isPlaying) {
      sendYouTubeCommand('pauseVideo');
    } else {
      sendYouTubeCommand('playVideo');
    }
  };

  // Subir volumen (+10%)
  const handleIncreaseVolume = () => {
    const next = Math.min(1, Math.round((volume + 0.1) * 100) / 100);
    onVolumeChange(next);
  };

  // Bajar volumen (-10%)
  const handleDecreaseVolume = () => {
    const next = Math.max(0, Math.round((volume - 0.1) * 100) / 100);
    onVolumeChange(next);
  };

  return (
    <div
      id="mini-music-player-container"
      className={`transition-all duration-300 ${
        isModalOpen
          ? 'opacity-0 pointer-events-none fixed -bottom-96 -right-96 z-0'
          : 'fixed bottom-16 sm:bottom-6 landscape:bottom-2 left-2 right-2 sm:left-auto sm:right-6 landscape:left-auto landscape:right-3 sm:w-96 landscape:w-84 z-40 animate-in slide-in-from-bottom-3 duration-200'
      }`}
    >
      <div className="bg-stone-900/95 backdrop-blur-md border border-stone-750/90 rounded-2xl shadow-2xl shadow-black/80 p-2.5 sm:p-3 flex flex-col gap-2">
        {/* Persistent YouTube iframe element (keeps playing in background even if modal is open) */}
        {isYouTube && (ytVideoId || track.artist || track.url) && (
          <div
            className={`transition-all duration-300 overflow-hidden rounded-xl bg-black border border-stone-800 ${
              showVideo ? 'w-full aspect-video opacity-100 mb-1' : 'w-full h-1 opacity-0 pointer-events-none'
            }`}
          >
            <iframe
              ref={iframeRef}
              id="persistent-domino-youtube-iframe"
              src={embedUrl}
              title={track.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Progress Bar (if track has finite duration) */}
        {duration > 0 && (
          <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Header indicator: Segundo Plano activo & Auto Siguiente / Autoplay */}
        <div className="flex items-center justify-between text-[10px] text-stone-400 px-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div
              className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full"
              title={
                lang === 'es'
                  ? 'Sonando en segundo plano: Puedes salir de la app o apagar la pantalla y la música continuará sonando.'
                  : 'Playing in background: Music continues playing when leaving app or turning off screen.'
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wide uppercase text-[9px]">
                {lang === 'es' ? 'Segundo Plano' : 'Background'}
              </span>
            </div>

            {onToggleAutoplay ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoplay();
                }}
                className={`flex items-center gap-1 border px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  isAutoplay
                    ? 'text-amber-300 bg-amber-500/20 border-amber-500/45 hover:bg-amber-500/30'
                    : 'text-stone-400 bg-stone-850 border-stone-700 hover:text-stone-200'
                }`}
                title={
                  lang === 'es'
                    ? isAutoplay
                      ? 'Autoplay activado: Pasa automáticamente a la siguiente canción solo en el celular. Toca para desactivar.'
                      : 'Autoplay desactivado: Se detendrá al terminar la canción. Toca para activar.'
                    : isAutoplay
                      ? 'Autoplay enabled: Advances automatically on mobile. Tap to disable.'
                      : 'Autoplay disabled: Stops when track finishes. Tap to enable.'
                }
              >
                <Repeat className={`w-2.5 h-2.5 ${isAutoplay ? 'text-amber-400' : 'text-stone-500'}`} />
                <span className="font-semibold tracking-wide uppercase text-[9px]">
                  {isAutoplay
                    ? (lang === 'es' ? 'Autoplay: Activado' : 'Autoplay: ON')
                    : (lang === 'es' ? 'Autoplay: Desactivado' : 'Autoplay: OFF')}
                </span>
              </button>
            ) : (
              <div
                className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full"
                title={
                  lang === 'es'
                    ? 'Reproducción continua automática: Al terminar la canción se reproduce la siguiente.'
                    : 'Continuous auto-play: Next track plays automatically when current finishes.'
                }
              >
                <Repeat className="w-2.5 h-2.5" />
                <span className="font-semibold tracking-wide uppercase text-[9px]">
                  {lang === 'es' ? 'Autoplay: Activado' : 'Autoplay: ON'}
                </span>
              </div>
            )}
          </div>

          <span className="text-stone-500 text-[10px] hidden sm:inline">
            {lang === 'es' ? 'Bloqueo / Notificaciones' : 'Lock screen'}
          </span>
        </div>

        {/* Main Track Info & Primary Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Track Cover & Info */}
          <div
            onClick={onOpenFullPlayer}
            className="flex items-center gap-2.5 truncate cursor-pointer group flex-1"
            title={lang === 'es' ? 'Abrir buscador y lista completa' : 'Open full player and search'}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-stone-800 border border-stone-700/80 flex-shrink-0 flex items-center justify-center shadow-inner">
              {track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : isYouTube ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Disc3
                  className={`w-5 h-5 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
              )}

              {/* Status Ring / Indicator */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                {isPlaying ? (
                  <span
                    className={`w-2.5 h-2.5 rounded-full animate-ping ${
                      isYouTube ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-400 opacity-80" />
                )}
              </div>
            </div>

            <div className="truncate">
              <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 truncate transition-colors flex items-center gap-1.5">
                <span className="truncate">{track.title}</span>
                {isYouTube && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">
                    YT
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                <span className="truncate">{track.artist}</span>
                <span className="text-stone-600">•</span>
                <span className="font-mono text-[10px] font-semibold text-amber-400/90">
                  {isPlaying
                    ? lang === 'es'
                      ? 'Reproduciendo'
                      : 'Playing'
                    : lang === 'es'
                    ? 'En Pausa'
                    : 'Paused'}
                </span>
                {track.durationText && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {track.durationText}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Previous Track Button */}
            {onPrevTrack && (
              <button
                type="button"
                onClick={onPrevTrack}
                title={lang === 'es' ? 'Canción anterior' : 'Previous song'}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors active:scale-95"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Play / Pause Toggle Button */}
            <button
              id="btn-mini-play-pause"
              type="button"
              onClick={onTogglePlay}
              title={
                isPlaying
                  ? lang === 'es'
                    ? 'Pausar música'
                    : 'Pause'
                  : lang === 'es'
                  ? 'Reanudar música'
                  : 'Play'
              }
              className={`p-2 rounded-xl active:scale-95 font-bold shadow-md transition-all flex items-center justify-center ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/40 ring-2 ring-amber-400/50'
                  : 'bg-stone-750 hover:bg-amber-500 hover:text-stone-950 text-stone-100 border border-stone-600'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            {onNextTrack && (
              <button
                type="button"
                onClick={onNextTrack}
                title={lang === 'es' ? 'Siguiente canción' : 'Next song'}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors active:scale-95"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Toggle Video Frame (if YouTube) */}
            {isYouTube && (
              <button
                type="button"
                onClick={() => setShowVideo((prev) => !prev)}
                title={
                  showVideo
                    ? lang === 'es'
                      ? 'Ocultar video'
                      : 'Hide video'
                    : lang === 'es'
                    ? 'Ver video de YouTube'
                    : 'Show video'
                }
                className={`p-1.5 rounded-lg transition-colors ${
                  showVideo
                    ? 'text-red-400 bg-red-500/20 border border-red-500/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Volume Controls */}
            <button
              type="button"
              onClick={() => setShowVolumeControls((prev) => !prev)}
              title={
                showVolumeControls
                  ? lang === 'es'
                    ? 'Ocultar controles de volumen'
                    : 'Hide volume'
                  : lang === 'es'
                  ? 'Mostrar volumen'
                  : 'Show volume'
              }
              className={`p-1.5 rounded-lg transition-colors ${
                showVolumeControls
                  ? 'text-amber-400 bg-amber-500/15'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Open Modal */}
            <button
              type="button"
              onClick={onOpenFullPlayer}
              title={lang === 'es' ? 'Buscar más música' : 'Search more music'}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Open in YouTube App (Android / Web) */}
            {ytVideoId && (
              <a
                href={`https://www.youtube.com/watch?v=${ytVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                title={lang === 'es' ? 'Abrir en YouTube oficial' : 'Open in official YouTube'}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Stop & Close */}
            <button
              type="button"
              onClick={onClosePlayer}
              title={lang === 'es' ? 'Cerrar reproductor' : 'Close player'}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dedicated Volume Control Bar: Subir y Bajar Volumen */}
        {showVolumeControls && (
          <div className="pt-2 border-t border-stone-800/90 flex items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
            {/* Mute toggle */}
            <button
              type="button"
              onClick={handleMuteClick}
              title={volume === 0 ? (lang === 'es' ? 'Activar sonido' : 'Unmute') : (lang === 'es' ? 'Silenciar' : 'Mute')}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors flex-shrink-0"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Bajar Volumen (-) */}
            <button
              type="button"
              onClick={handleDecreaseVolume}
              disabled={volume <= 0}
              title={lang === 'es' ? 'Bajar volumen (-10%)' : 'Decrease volume'}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-750 active:scale-95 disabled:opacity-40 text-stone-300 hover:text-white border border-stone-700 transition-all flex items-center justify-center flex-shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Interactive Volume Slider */}
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <input
                id="mini-player-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                title={`Volumen: ${Math.round(volume * 100)}%`}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer transition-all"
              />
            </div>

            {/* Subir Volumen (+) */}
            <button
              type="button"
              onClick={handleIncreaseVolume}
              disabled={volume >= 1}
              title={lang === 'es' ? 'Subir volumen (+10%)' : 'Increase volume'}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-750 active:scale-95 disabled:opacity-40 text-stone-300 hover:text-white border border-stone-700 transition-all flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Numeric Percentage Badge */}
            <span className="font-mono text-[11px] font-bold text-amber-400 w-9 text-right flex-shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
