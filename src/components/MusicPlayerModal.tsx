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
  Music,
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
  'Frank Sinatra',
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
  'Frank Sinatra': {
    id: 'yt_qQzdAsjWGPg',
    videoId: 'qQzdAsjWGPg',
    title: 'My Way',
    artist: 'Frank Sinatra',
    genre: 'Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/qQzdAsjWGPg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/qQzdAsjWGPg/hqdefault.jpg',
    durationText: '4:35',
  },
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
  const songsListSectionRef = useRef<HTMLDivElement>(null);
  const modalScrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSearchYouTube = async (termToSearch?: string) => {
    const rawVal = termToSearch !== undefined ? termToSearch : (searchInputRef.current?.value || searchQuery);
    const query = (rawVal || '').trim();
    if (!query) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      return;
    }

    // Sincronizar input y ocultar teclado táctil móvil
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.value = query;
      searchInputRef.current.blur();
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    // En celular, minimizamos el video superior para que las canciones encontradas queden visibles de inmediato
    setIsVideoExpanded(false);

    // Scroll inmediato a la sección de canciones para que el celular no se quede en blanco
    setTimeout(() => {
      if (songsListSectionRef.current) {
        songsListSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error de servidor (${response.status})`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
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
          setSearchError(`No se encontraron resultados en internet para "${query}".`);
        }
      }
    } catch (err: unknown) {
      console.error('Búsqueda falló, usando respaldo:', err);
      const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localMatches.length > 0 ? localMatches : CURATED_DOMINO_YOUTUBE_TRACKS);
      setSearchError(`Mostrando canciones recomendadas para "${query}".`);
    } finally {
      setIsSearching(false);
      // Garantizar que en celular el usuario esté viendo las canciones encontradas
      setTimeout(() => {
        if (songsListSectionRef.current) {
          songsListSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Al presionar un cuadro (Salsa Brava, Joe Arroyo, Héctor Lavoe, Frank Sinatra, etc.)
  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    if (searchInputRef.current) {
      searchInputRef.current.value = tag;
      searchInputRef.current.blur();
    }
    const quickPick = POPULAR_QUICK_PICKS[tag];
    if (quickPick && (!currentTrack || currentTrack.id !== quickPick.id)) {
      onSelectTrack(quickPick);
    }
    handleSearchYouTube(tag);
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
                Música en YouTube
              </h3>
              <p className="text-[11px] text-stone-400">
                Escribe un artista o canción y aparecerán todas abajo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div ref={modalScrollContainerRef} className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-3.5">
          {/* 1. BARRA DE BÚSQUEDA ARRIBA (Misma estructura exacta en celular y computadora) */}
          <div ref={searchBarContainerRef} className="space-y-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const term = searchInputRef.current?.value || searchQuery;
                handleSearchYouTube(term);
              }}
              className="flex flex-row items-center gap-2 w-full"
            >
              {/* Etiqueta "Música" integrada */}
              <div className="relative flex-1 min-w-0 flex items-center bg-stone-950 border border-stone-750 focus-within:border-amber-500 rounded-xl overflow-hidden shadow-inner transition-colors">
                <div className="px-2.5 sm:px-3 py-2.5 bg-stone-900 border-r border-stone-800 flex items-center gap-1.5 text-amber-400 flex-shrink-0 select-none">
                  <Music className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Música</span>
                </div>
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
                      e.stopPropagation();
                      const val = (e.currentTarget.value || searchQuery).trim();
                      handleSearchYouTube(val);
                    }
                  }}
                  placeholder="Canción o artista (ej: Frank Sinatra)..."
                  className="w-full bg-transparent px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none"
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
                    className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0 mr-1 cursor-pointer"
                    title="Borrar texto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botón con la palabra Buscar al lado */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const val = searchInputRef.current?.value || searchQuery;
                  handleSearchYouTube(val);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const val = searchInputRef.current?.value || searchQuery;
                  handleSearchYouTube(val);
                }}
                disabled={isSearching}
                className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[42px] touch-manipulation active:scale-95 select-none"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Search className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                )}
                <span>Buscar</span>
              </button>
            </form>

            {/* 2. CUADROS PEQUEÑOS DE ARTISTAS POPULARES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Toca para buscar canciones de:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {POPULAR_SEARCH_TAGS.map((tag) => {
                  const isCurrentTag = searchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleQuickTagClick(tag);
                      }}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation min-h-[36px] select-none ${
                        isCurrentTag
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/40'
                          : 'bg-stone-850 hover:bg-stone-800 active:bg-stone-750 text-stone-200 hover:text-amber-300 border-stone-750'
                      }`}
                    >
                      <Search className={`w-3 h-3 ${isCurrentTag ? 'text-stone-950' : 'text-amber-400'}`} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. REPRODUCTOR COMPACTO SI HAY CANCIÓN SELECCIONADA */}
          {currentTrack && activeVideoId && (
            <div
              ref={playerContainerRef}
              className="bg-stone-950 border border-stone-800 rounded-xl p-3 shadow-md flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate flex-1">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0 flex items-center justify-center">
                    {currentTrack.artworkUrl ? (
                      <img
                        src={currentTrack.artworkUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Youtube className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                        {currentTrack.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">
                      {currentTrack.artist} {currentTrack.durationText ? `• ${currentTrack.durationText}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs shadow transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Sonar</span>
                      </>
                    )}
                  </button>

                  {/* Toggle video display */}
                  <button
                    type="button"
                    onClick={() => setIsVideoExpanded((prev) => !prev)}
                    className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-850 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title={isVideoExpanded ? 'Ocultar video' : 'Ver video'}
                  >
                    <Tv className="w-4 h-4 text-stone-400" />
                    <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isVideoExpanded ? '' : 'rotate-180'}`} />
                  </button>
                </div>
              </div>

              {/* Video embebido si se expande */}
              {isVideoExpanded && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800 mt-1 shadow-md">
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
            </div>
          )}

          {/* 4. LISTA DE CANCIONES (JUSTO DEBAJO DE LA BÚSQUEDA) */}
          <div ref={songsListSectionRef} className="space-y-2.5 scroll-mt-2">
            {/* Status indicator while searching */}
            {isSearching && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2.5 text-amber-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span className="text-xs font-bold">
                  Buscando canciones en YouTube para &quot;{searchQuery || 'música'}&quot;...
                </span>
              </div>
            )}

            {/* Error notice if search failed */}
            {searchError && !isSearching && (
              <div className="p-3 text-xs text-amber-200 bg-amber-950/40 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <p className="flex-1 text-left">{searchError}</p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleSearchYouTube()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    Reintentar búsqueda
                  </button>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="flex items-center justify-between pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                {hasSearched
                  ? searchResults.length > 0
                    ? `Canciones de "${searchQuery}" (${searchResults.length})`
                    : `Sin resultados para "${searchQuery}"`
                  : `Canciones Recomendadas (${CURATED_DOMINO_YOUTUBE_TRACKS.length})`}
              </h4>

              {hasSearched && (
                <button
                  type="button"
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError(null);
                    if (searchInputRef.current) searchInputRef.current.value = '';
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  Ver recomendadas
                </button>
              )}
            </div>

            {/* Empty state if searched and no results */}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <div className="p-6 text-center bg-stone-850/60 rounded-xl border border-stone-750/60 space-y-2">
                <p className="text-xs text-stone-300">
                  No se encontraron canciones para &quot;{searchQuery}&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    if (searchInputRef.current) searchInputRef.current.value = '';
                  }}
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
                >
                  Ver lista recomendada de dominó
                </button>
              </div>
            )}

            {/* Songs List */}
            <div className="space-y-2">
              {(hasSearched ? searchResults : CURATED_DOMINO_YOUTUBE_TRACKS).map((track) => {
                const isThisPlaying = isPlaying && currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectAndScrollToPlayer(track)}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation ${
                      isThisPlaying
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                        : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                    }`}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-3 truncate flex-1 group">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndScrollToPlayer(track);
                        }}
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
        </div>
      </div>
    </div>
  );
};
