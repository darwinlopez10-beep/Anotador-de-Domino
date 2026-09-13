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
  Search,
  ChevronUp,
  Tv,
  Globe,
  Disc3,
} from 'lucide-react';
import { MusicTrack } from '../types';

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

// Canciones icónicas preconfiguradas para reproducción instantánea al tocar cada botón popular
const POPULAR_QUICK_PICKS: Record<string, MusicTrack> = {
  'Salsa Brava': {
    id: 'yt_0nBFWzpWXuM',
    videoId: '0nBFWzpWXuM',
    title: 'La Vida Es Un Carnaval',
    artist: 'Celia Cruz',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0nBFWzpWXuM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0nBFWzpWXuM/hqdefault.jpg',
    durationText: '4:38',
  },
  'Joe Arroyo': {
    id: 'yt_2jR9f5hH9vI',
    videoId: '2jR9f5hH9vI',
    title: 'La Rebelión (No Le Pegue a la Negra)',
    artist: 'Joe Arroyo',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/2jR9f5hH9vI?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/2jR9f5hH9vI/hqdefault.jpg',
    durationText: '4:45',
  },
  'Hector Lavoe': {
    id: 'yt_BNo0vkEYWRc',
    videoId: 'BNo0vkEYWRc',
    title: 'El Cantante',
    artist: 'Héctor Lavoe',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BNo0vkEYWRc?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BNo0vkEYWRc/hqdefault.jpg',
    durationText: '10:20',
  },
  'Frankie Ruiz': {
    id: 'yt_0v4n4L1N_pM',
    videoId: '0v4n4L1N_pM',
    title: 'Tú Con Él',
    artist: 'Frankie Ruiz',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0v4n4L1N_pM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0v4n4L1N_pM/hqdefault.jpg',
    durationText: '4:58',
  },
  'El Gran Combo': {
    id: 'yt_8O_MwlZ2dEg',
    videoId: '8O_MwlZ2dEg',
    title: 'Brujería',
    artist: 'El Gran Combo de Puerto Rico',
    genre: 'Salsa Brava',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/8O_MwlZ2dEg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/8O_MwlZ2dEg/hqdefault.jpg',
    durationText: '4:18',
  },
  'Merengue Clásico': {
    id: 'yt_Y1j_yqN1_7U',
    videoId: 'Y1j_yqN1_7U',
    title: 'La Dueña del Swing',
    artist: 'Los Hermanos Rosario',
    genre: 'Merengue',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/Y1j_yqN1_7U?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/Y1j_yqN1_7U/hqdefault.jpg',
    durationText: '4:35',
  },
  'Bachata Sensual': {
    id: 'yt_t5Jq636J4aA',
    videoId: 't5Jq636J4aA',
    title: 'Bachata Rosa',
    artist: 'Juan Luis Guerra 4.40',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/t5Jq636J4aA?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/t5Jq636J4aA/hqdefault.jpg',
    durationText: '4:13',
  },
  'Mix Dominó': {
    id: 'yt_BVYLOe4Xkg0',
    videoId: 'BVYLOe4Xkg0',
    title: 'Mix Salsa Clásica Brava para Bailar y Jugar',
    artist: 'Salsa de Oro',
    genre: 'Mixes Largos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BVYLOe4Xkg0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BVYLOe4Xkg0/hqdefault.jpg',
    durationText: '45:00',
  },
};

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
  const searchResultsAnchorRef = useRef<HTMLDivElement>(null);

  // Active YouTube video ID
  const activeVideoId = currentTrack?.videoId || (currentTrack?.url ? extractYouTubeId(currentTrack.url) : null);

  const handleSelectAndScrollToPlayer = (track: MusicTrack) => {
    onSelectTrack(track);
    setIsVideoExpanded(true);
    setTimeout(() => {
      if (playerContainerRef.current) {
        playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSearchYouTube = async (termToSearch?: string, autoPlayFirst: boolean = true) => {
    const rawVal = termToSearch !== undefined ? termToSearch : (searchInputRef.current?.value || searchQuery);
    const query = (rawVal || '').trim() || 'salsa';

    // Sincronizar input y ocultar teclado táctil móvil para ver el reproductor
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setSearchResults(data.results);
        if (autoPlayFirst) {
          handleSelectAndScrollToPlayer(data.results[0]);
        }
      } else {
        const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase())
        );
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
          if (autoPlayFirst) {
            handleSelectAndScrollToPlayer(localMatches[0]);
          }
        } else {
          setSearchResults(CURATED_DOMINO_YOUTUBE_TRACKS);
          setSearchError(`No se encontraron resultados en internet para "${query}". Mostrando recomendaciones.`);
        }
      }
    } catch (err: unknown) {
      console.error('Búsqueda en internet falló, usando respaldo local:', err);
      const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      );
      const fallbackList = localMatches.length > 0 ? localMatches : CURATED_DOMINO_YOUTUBE_TRACKS;
      setSearchResults(fallbackList);
      if (autoPlayFirst && fallbackList.length > 0) {
        handleSelectAndScrollToPlayer(fallbackList[0]);
      }
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        if (playerContainerRef.current) {
          playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Al presionar un botón pequeño (Salsa Brava, Joe Arroyo, Héctor Lavoe, etc.)
  // ¡Se abre y reproduce la canción al instante y además se buscan más canciones en internet!
  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    if (searchInputRef.current) {
      searchInputRef.current.value = tag;
      searchInputRef.current.blur();
    }

    // 1. Abrir y reproducir la canción emblemática inmediatamente
    const quickPick = POPULAR_QUICK_PICKS[tag];
    if (quickPick) {
      handleSelectAndScrollToPlayer(quickPick);
    }

    // 2. Y en segundo plano traer más opciones en internet para listar abajo
    handleSearchYouTube(tag, !quickPick);
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

  const embedUrl = activeVideoId
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`
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
                Buscador de Música de Dominó
              </h3>
              <p className="text-[11px] text-stone-400">
                Toca cualquier artista o busca tu canción favorita
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
          {currentTrack && activeVideoId ? (
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
                    key={activeVideoId}
                    src={embedUrl}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {/* Player Controls */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] sm:text-xs text-stone-300 font-medium">
                    {isPlaying ? 'Reproduciendo' : 'En pausa'}
                  </span>
                </div>

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
          ) : (
            /* Banner cuando aún no se ha seleccionado ninguna canción */
            <div
              ref={playerContainerRef}
              className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Disc3 className="w-6 h-6 animate-spin duration-3000" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">
                  ¿Listo para la partida de dominó?
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mt-0.5">
                  Toca abajo en <strong>Salsa Brava</strong>, <strong>Joe Arroyo</strong>, <strong>Héctor Lavoe</strong> o escribe cualquier canción para escucharla aquí.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickTagClick('Salsa Brava')}
                className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Poner Salsa Brava ahora</span>
              </button>
            </div>
          )}

          {/* Search Bar Form */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const term = searchInputRef.current?.value || searchQuery;
                handleSearchYouTube(term, true);
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
                      if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = (e.currentTarget.value || searchQuery).trim();
                        handleSearchYouTube(val, true);
                      }
                    }}
                    placeholder="Escribe una canción o artista (ej: Frankie Ruiz, Joe Arroyo)..."
                    className="w-full bg-stone-950 border border-stone-750 focus:border-amber-500 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchQuery('');
                        if (searchInputRef.current) {
                          searchInputRef.current.value = '';
                        }
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors"
                      title="Borrar texto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[42px] touch-manipulation"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  ) : (
                    <Globe className="w-4 h-4 text-stone-950" />
                  )}
                  <span>Buscar en Internet</span>
                </button>
              </div>
            </form>

            {/* Popular quick-tap search chips with instant play icons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Toca para reproducir al instante:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {POPULAR_SEARCH_TAGS.map((tag) => {
                  const isCurrentTag =
                    (currentTrack?.artist?.toLowerCase().includes(tag.toLowerCase()) ||
                     currentTrack?.genre?.toLowerCase().includes(tag.toLowerCase()) ||
                     searchQuery.toLowerCase() === tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation min-h-[38px] ${
                        isCurrentTag
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/40'
                          : 'bg-stone-850 hover:bg-stone-800 active:bg-stone-750 text-stone-200 hover:text-amber-300 border-stone-750'
                      }`}
                    >
                      <Play className={`w-3 h-3 fill-current ${isCurrentTag ? 'text-stone-950' : 'text-amber-400'}`} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error notice if search failed */}
          <div ref={searchResultsAnchorRef} className="scroll-mt-4" />
          {searchError && (
            <div className="p-3 text-xs text-amber-200 bg-amber-950/40 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <p className="flex-1 text-left">{searchError}</p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleSearchYouTube()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap"
                >
                  Reintentar búsqueda
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isSearching && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs">Buscando canciones en internet...</p>
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
                    ? `Resultados en internet para "${searchQuery}" (${searchResults.length})`
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
                          <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                            {track.title}
                          </h5>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Right: Direct play button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectAndScrollToPlayer(track)}
                          title={isThisPlaying ? 'Pausar canción' : 'Reproducir en la aplicación'}
                          className={`px-3 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
                            isThisPlaying
                              ? 'bg-amber-500 text-stone-950 shadow-amber-950/30 ring-2 ring-amber-400'
                              : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-red-950/30'
                          }`}
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span className="hidden xs:inline">Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                              <span className="hidden xs:inline">Reproducir</span>
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
