import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  Youtube,
  ExternalLink,
  Search,
  Smartphone,
  ChevronUp,
  Tv,
} from 'lucide-react';
import { MusicTrack } from '../types';
import {
  openInYouTube,
  openYouTubeSearch,
} from '../utils/youtubeMobile';

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  onSelectTrack: (track: MusicTrack) => void;
  onTogglePlay: () => void;
  onVolumeChange: (newVol: number) => void;
  onToggleMute?: () => void;
  customTracks?: MusicTrack[];
  onAddCustomTrack?: (track: MusicTrack) => void;
  onDeleteCustomTrack?: (trackId: string) => void;
  initialTab?: string;
}

// Preset Curated YouTube Tracks ideal for Domino games
export const CURATED_DOMINO_YOUTUBE_TRACKS: MusicTrack[] = [
  {
    id: 'yt_0nBFWzpWXuM',
    videoId: '0nBFWzpWXuM',
    title: 'La Vida Es Un Carnaval',
    artist: 'Celia Cruz',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/0nBFWzpWXuM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0nBFWzpWXuM/hqdefault.jpg',
    durationText: '4:38',
  },
  {
    id: 'yt_t6nW_X_fQ7c',
    videoId: 't6nW_X_fQ7c',
    title: 'Chan Chan',
    artist: 'Buena Vista Social Club',
    genre: 'Son Cubano',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/t6nW_X_fQ7c?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/t6nW_X_fQ7c/hqdefault.jpg',
    durationText: '4:16',
  },
  {
    id: 'yt_8O_MwlZ2dEg',
    videoId: '8O_MwlZ2dEg',
    title: 'Brujería',
    artist: 'El Gran Combo de Puerto Rico',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/8O_MwlZ2dEg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/8O_MwlZ2dEg/hqdefault.jpg',
    durationText: '4:18',
  },
  {
    id: 'yt_BVYLOe4Xkg0',
    videoId: 'BVYLOe4Xkg0',
    title: 'Mix Salsa Clásica Brava para Bailar y Jugar',
    artist: 'Salsa de Oro',
    genre: 'Mixes Largos',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/BVYLOe4Xkg0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BVYLOe4Xkg0/hqdefault.jpg',
    durationText: '45:00',
  },
  {
    id: 'yt_t5Jq636J4aA',
    videoId: 't5Jq636J4aA',
    title: 'Bachata Rosa',
    artist: 'Juan Luis Guerra 4.40',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/t5Jq636J4aA?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/t5Jq636J4aA/hqdefault.jpg',
    durationText: '4:13',
  },
  {
    id: 'yt_Z6x_X7rQ48g',
    videoId: 'Z6x_X7rQ48g',
    title: 'Merengues Clásicos de los 80 y 90 Bailable Mix',
    artist: 'Ritmo Latino',
    genre: 'Mixes Largos',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/Z6x_X7rQ48g?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/Z6x_X7rQ48g/hqdefault.jpg',
    durationText: '58:20',
  },
  {
    id: 'yt_2jR9f5hH9vI',
    videoId: '2jR9f5hH9vI',
    title: 'La Rebelión (No Le Pegue a la Negra)',
    artist: 'Joe Arroyo',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/2jR9f5hH9vI?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/2jR9f5hH9vI/hqdefault.jpg',
    durationText: '4:45',
  },
  {
    id: 'yt_Y1j_yqN1_7U',
    videoId: 'Y1j_yqN1_7U',
    title: 'La Dueña del Swing',
    artist: 'Los Hermanos Rosario',
    genre: 'Merengue',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/Y1j_yqN1_7U?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/Y1j_yqN1_7U/hqdefault.jpg',
    durationText: '4:35',
  },
  {
    id: 'yt_N5s_w2nB_W4',
    videoId: 'N5s_w2nB_W4',
    title: 'Guantanamera',
    artist: 'Compay Segundo',
    genre: 'Son Cubano',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/N5s_w2nB_W4?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/N5s_w2nB_W4/hqdefault.jpg',
    durationText: '4:52',
  },
  {
    id: 'yt_qF2oYJ_kMvQ',
    videoId: 'qF2oYJ_kMvQ',
    title: 'Un Verano en Nueva York',
    artist: 'El Gran Combo de Puerto Rico',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/qF2oYJ_kMvQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/qF2oYJ_kMvQ/hqdefault.jpg',
    durationText: '5:15',
  },
  {
    id: 'yt_c7R9P_W2mQk',
    videoId: 'c7R9P_W2mQk',
    title: 'Mix Son Cubano & Boleros del Recuerdo',
    artist: 'Tradición Cubana',
    genre: 'Mixes Largos',
    sourceType: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/c7R9P_W2mQk?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/c7R9P_W2mQk/hqdefault.jpg',
    durationText: '35:10',
  },
];

// Helper to extract YouTube video ID from any link or text
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) return match[1];

  const trimmed = url.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }
  return null;
}

const POPULAR_SEARCH_TAGS = [
  'Salsa Brava',
  'Joe Arroyo',
  'Hector Lavoe',
  'Frankie Ruiz',
  'El Gran Combo',
  'Merengue Clásico',
  'Bachata Sensual',
  'Mix Dominó',
];

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  volume,
  onSelectTrack,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active YouTube video ID
  const activeVideoId = currentTrack?.videoId || (currentTrack?.url ? extractYouTubeId(currentTrack.url) : null);

  const handleSearchYouTube = async (termToSearch?: string) => {
    const query = (termToSearch !== undefined ? termToSearch : searchQuery).trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase())
        );
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
        } else {
          setSearchResults([]);
          setSearchError(`No se encontraron resultados para "${query}". Puedes abrir la búsqueda directamente en la app de YouTube.`);
        }
      }
    } catch (err: unknown) {
      console.warn('YouTube search notice:', err);
      const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localMatches.length > 0 ? localMatches : CURATED_DOMINO_YOUTUBE_TRACKS);
      setSearchError('No se pudo conectar a la búsqueda en línea. Puedes abrir YouTube directamente en tu celular.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearchYouTube(tag);
  };

  const handleSelectAndScrollToPlayer = (track: MusicTrack) => {
    onSelectTrack(track);
    setIsVideoExpanded(true);
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMuteClick = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      if (volume > 0) {
        onVolumeChange(0);
      } else {
        onVolumeChange(0.7);
      }
    }
  };

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = activeVideoId
    ? `https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(
        origin
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-stone-800 bg-stone-850 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                Buscar Canciones
              </h3>
              <p className="text-[11px] text-stone-400">
                Reproduce música en la aplicación o ábrela en tu celular
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Cerrar buscador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">
          {/* Active Song Player (Structure matching Karaoke Pro) */}
          {currentTrack && activeVideoId && (
            <div
              ref={playerContainerRef}
              className="bg-stone-950 border border-stone-800 rounded-2xl p-3 shadow-lg flex flex-col gap-2.5 transition-all"
            >
              {/* Header with song title & minimize toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                      {currentTrack.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 truncate">
                      {currentTrack.artist} {currentTrack.durationText ? `• ${currentTrack.durationText}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsVideoExpanded((prev) => !prev)}
                    className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-850 transition-colors text-xs font-semibold flex items-center gap-1"
                    title={isVideoExpanded ? 'Minimizar video' : 'Ver video completo'}
                  >
                    <span className="text-[11px] hidden sm:inline">{isVideoExpanded ? 'Ocultar video' : 'Ver video'}</span>
                    <ChevronUp className={`w-4 h-4 transition-transform ${isVideoExpanded ? '' : 'rotate-180'}`} />
                  </button>
                </div>
              </div>

              {/* Embedded YouTube Video Player (Always visible when expanded for full mobile support) */}
              {isVideoExpanded && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800 shadow-md">
                  <iframe
                    src={embedUrl}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Player Controls & Prominent Mobile YouTube Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-850">
                {/* DIRECT BUTTON TO OPEN IN YOUTUBE APP ON MOBILE */}
                <button
                  type="button"
                  onClick={() => openInYouTube(activeVideoId)}
                  className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-950/40 transition-all active:scale-95 cursor-pointer touch-manipulation"
                  title="Abrir esta canción directamente en la app de YouTube en tu celular"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Abrir en YouTube (Celular)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </button>

                {/* In-App Audio Controls */}
                <div className="flex items-center gap-2">
                  {/* Volume */}
                  <div className="flex items-center gap-1 bg-stone-900 px-2 py-1.5 rounded-xl border border-stone-800">
                    <button
                      type="button"
                      onClick={handleMuteClick}
                      title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                      className="text-stone-400 hover:text-stone-200"
                    >
                      {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onVolumeChange(Math.max(0, Math.round((volume - 0.1) * 100) / 100))}
                      className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold"
                      title="Bajar volumen"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => onVolumeChange(Math.min(1, Math.round((volume + 0.1) * 100) / 100))}
                      className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold"
                      title="Subir volumen"
                    >
                      +
                    </button>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold w-7 text-right hidden sm:inline">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-950/30 transition-transform active:scale-95 flex items-center gap-1.5"
                    title={isPlaying ? 'Pausar música' : 'Reanudar música'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span className="text-xs hidden sm:inline">Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span className="text-xs hidden sm:inline">Reproducir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar Form */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchYouTube();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="flex gap-2 items-center flex-1">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    enterKeyHint="search"
                    inputMode="search"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.currentTarget.value || searchQuery).trim();
                        if (val) {
                          handleSearchYouTube(val);
                        }
                      }
                    }}
                    placeholder="Buscar canción, artista o salsa..."
                    className="w-full bg-stone-950 border border-stone-750 focus:border-red-500 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors"
                      title="Borrar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  onClick={(e) => {
                    if (searchQuery.trim()) {
                      e.preventDefault();
                      handleSearchYouTube();
                    }
                  }}
                  className="px-3.5 sm:px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[42px] touch-manipulation"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="sm:hidden font-bold">Buscar</span>
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>

              {/* Direct Button to open current search on Mobile YouTube App */}
              <button
                type="button"
                onClick={() => openYouTubeSearch(searchQuery.trim() || 'salsa para jugar domino')}
                title="Abrir la búsqueda directamente en la app de YouTube en tu celular"
                className="px-3 py-2.5 bg-stone-850 hover:bg-stone-800 active:bg-stone-750 border border-stone-700/80 text-stone-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all flex-shrink-0 min-h-[42px] touch-manipulation"
              >
                <Smartphone className="w-4 h-4 text-red-400" />
                <span>Abrir en App YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </form>

            {/* Popular quick-tap search chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Populares:
              </span>
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-850 hover:bg-stone-800 active:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-750 transition-colors cursor-pointer active:scale-95 touch-manipulation"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice if search failed */}
          {searchError && (
            <div className="p-3 text-xs text-amber-200 bg-amber-950/40 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <p className="flex-1 text-left">{searchError}</p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleSearchYouTube()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  onClick={() => openYouTubeSearch(searchQuery.trim() || 'salsa')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isSearching && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              <p className="text-xs">Buscando canciones en YouTube...</p>
            </div>
          )}

          {/* Song Results Section */}
          {!isSearching && (
            <div className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-500" />
                  {hasSearched
                    ? `Resultados para "${searchQuery}" (${searchResults.length})`
                    : 'Canciones Recomendadas para Dominó'}
                </h4>
              </div>

              {/* Songs List */}
              <div className="space-y-2">
                {(hasSearched ? searchResults : CURATED_DOMINO_YOUTUBE_TRACKS).map((track) => {
                  const trackVideoId = track.videoId || extractYouTubeId(track.url) || '';
                  const isThisPlaying = isPlaying && currentTrack?.id === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isThisPlaying
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20'
                          : 'bg-stone-850/80 hover:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                      }`}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div
                        onClick={() => handleSelectAndScrollToPlayer(track)}
                        className="flex items-center gap-3 truncate flex-1 cursor-pointer group"
                      >
                        <div className="relative w-14 sm:w-16 h-10 sm:h-11 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                          {track.artworkUrl ? (
                            <img
                              src={track.artworkUrl}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Youtube className="w-5 h-5 text-red-500" />
                          )}
                          {track.durationText && (
                            <div className="absolute bottom-0 right-0 bg-black/85 text-white font-mono text-[9px] px-1 rounded-tl">
                              {track.durationText}
                            </div>
                          )}
                        </div>

                        <div className="truncate flex-1">
                          <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-red-400 transition-colors truncate">
                            {track.title}
                          </h5>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Right: Two direct actions (Play in App & Open in Phone) */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 1. BUTTON TO OPEN ON MOBILE PHONE YOUTUBE APP */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInYouTube(trackVideoId);
                          }}
                          title="Abrir en YouTube en tu celular"
                          className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-800 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Celular</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>

                        {/* 2. BUTTON TO PLAY IN APPLICATION */}
                        <button
                          type="button"
                          onClick={() => handleSelectAndScrollToPlayer(track)}
                          title={isThisPlaying ? 'Pausar' : 'Reproducir en la aplicación'}
                          className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 touch-manipulation cursor-pointer ${
                            isThisPlaying
                              ? 'bg-amber-500 text-stone-950 shadow-amber-950/30'
                              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/30'
                          }`}
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs hidden sm:inline">Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              <span className="text-xs hidden sm:inline">Reproducir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
