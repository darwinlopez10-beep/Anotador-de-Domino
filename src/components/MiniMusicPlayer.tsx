import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { MusicTrack } from '../types';
import { extractYouTubeId } from './MusicPlayerModal';
import { openInYouTube } from '../utils/youtubeMobile';

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

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
      // Retry once after 100ms in case iframe was just un-paused
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

  // When YouTube iframe finishes loading, initialize its state
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    // Tell YouTube API we are listening
    sendYouTubeCommand('listening');
    // Set initial volume
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

  // Construct standard embed URL with JavaScript API enabled
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = ytVideoId
    ? `https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&playsinline=1&enablejsapi=1&version=3&origin=${encodeURIComponent(
        origin
      )}`
    : '';

  return (
    <div
      id="mini-music-player-container"
      className="fixed bottom-16 sm:bottom-6 landscape:bottom-2 left-2 right-2 sm:left-auto sm:right-6 landscape:left-auto landscape:right-3 sm:w-96 landscape:w-84 z-40 animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="bg-stone-900/95 backdrop-blur-md border border-stone-750/90 rounded-2xl shadow-2xl shadow-black/80 p-2.5 sm:p-3 flex flex-col gap-2">
        {/* Single persistent YouTube iframe element (prevents restarting song when toggling video) */}
        {isYouTube && ytVideoId && (
          <div
            className={`transition-all duration-300 overflow-hidden rounded-xl bg-black border border-stone-800 ${
              showVideo ? 'w-full aspect-video opacity-100 mb-1' : 'w-full h-1 opacity-0 pointer-events-none'
            }`}
          >
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={track.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

        {/* Main Track Info & Primary Controls */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Track Cover & Info */}
          <div
            onClick={onOpenFullPlayer}
            className="flex items-center gap-2.5 truncate cursor-pointer group flex-1"
            title="Abrir buscador y lista completa"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-800 border border-stone-700/80 flex-shrink-0 flex items-center justify-center shadow-inner">
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
                  {isPlaying ? 'Reproduciendo' : 'En Pausa'}
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
            {/* Toggle Video Frame (if YouTube) */}
            {isYouTube && (
              <button
                type="button"
                onClick={() => setShowVideo((prev) => !prev)}
                title={showVideo ? 'Ocultar video' : 'Ver video de YouTube'}
                className={`p-1.5 rounded-lg transition-colors ${
                  showVideo
                    ? 'text-red-400 bg-red-500/20 border border-red-500/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Abrir en YouTube en Celular / App */}
            {isYouTube && ytVideoId && (
              <button
                type="button"
                onClick={() => openInYouTube(ytVideoId)}
                title="Abrir en YouTube en tu celular o app"
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Volume Controls */}
            <button
              type="button"
              onClick={() => setShowVolumeControls((prev) => !prev)}
              title={showVolumeControls ? 'Ocultar barra de volumen' : 'Mostrar controles de volumen'}
              className={`p-1.5 rounded-lg transition-colors ${
                showVolumeControls
                  ? 'text-amber-400 bg-amber-500/15'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              id="btn-mini-play-pause"
              type="button"
              onClick={onTogglePlay}
              title={isPlaying ? 'Pausar música' : 'Reanudar música'}
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

            {/* Expand / Open Modal */}
            <button
              type="button"
              onClick={onOpenFullPlayer}
              title="Buscar más música"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Stop & Close */}
            <button
              type="button"
              onClick={onClosePlayer}
              title="Cerrar reproductor"
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
              title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
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
              title="Bajar volumen (-10%)"
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
              title="Subir volumen (+10%)"
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
