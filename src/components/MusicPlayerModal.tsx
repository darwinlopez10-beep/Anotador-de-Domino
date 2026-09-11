import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Play,
  Pause,
  Radio,
  Music,
  Trash2,
  Volume2,
  VolumeX,
  Disc3,
  Sparkles,
  Loader2,
  Check,
  Youtube,
  BookmarkPlus,
  ExternalLink,
  Clock,
  Search,
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
  customTracks: MusicTrack[];
  onAddCustomTrack: (track: MusicTrack) => void;
  onDeleteCustomTrack: (trackId: string) => void;
  initialTab?: 'search' | 'curated' | 'add' | 'stations';
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

// Curated live radio stations for continuous playback
const PRESET_STATIONS: MusicTrack[] = [
  {
    id: 'preset_salsa_1',
    title: 'Salsa Brava & Clásica Radio',
    artist: 'Radio Salsa Tropical',
    sourceType: 'radio',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    durationText: 'En Vivo 24/7',
  },
  {
    id: 'preset_son_cubano',
    title: 'Son Cubano & Boleros del Recuerdo',
    artist: 'Trío Tradicional Latino',
    sourceType: 'radio',
    url: 'https://stream.zeno.fm/1f4r3w03k7zuv',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
    durationText: 'En Vivo 24/7',
  },
  {
    id: 'preset_bachata_merengue',
    title: 'Bachata & Merengue de Fiesta',
    artist: 'Ritmo Quisqueya',
    sourceType: 'radio',
    url: 'https://stream.zeno.fm/0w9v9sfechzuv',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80',
    durationText: 'En Vivo 24/7',
  },
  {
    id: 'preset_lofi_relax',
    title: 'Café & Dominó Chill (Lofi)',
    artist: 'Instrumental Lounge',
    sourceType: 'radio',
    url: 'https://stream.zeno.fm/fvr980a3k7zuv',
    artworkUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&auto=format&fit=crop&q=80',
    durationText: 'En Vivo 24/7',
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
  customTracks,
  onAddCustomTrack,
  onDeleteCustomTrack,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'curated' | 'add' | 'stations'>(
    initialTab || 'search'
  );
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');

  // Search YouTube state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const POPULAR_SEARCH_TAGS = [
    'Salsa Brava',
    'Frankie Ruiz',
    'Héctor Lavoe',
    'Celia Cruz',
    'El Gran Combo',
    'Son Cubano',
    'Bachata Clásica',
    'Merengue Ripiao',
    'Mix Dominó',
  ];

  const handleSearchYouTube = async (termToSearch?: string) => {
    const query = (termToSearch !== undefined ? termToSearch : searchQuery).trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // AbortController with 12s timeout for mobile connections
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
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
          setSearchError(`No se encontraron canciones para "${query}". Prueba con otro nombre o artista.`);
        }
      }
    } catch (err: unknown) {
      console.warn('YouTube search notice:', err);
      const isAbort = (err as { name?: string })?.name === 'AbortError';
      const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localMatches.length > 0 ? localMatches : CURATED_DOMINO_YOUTUBE_TRACKS);
      if (isAbort) {
        setSearchError('La búsqueda tardó más de lo esperado en la conexión móvil. Mostrando canciones recomendadas.');
      } else {
        setSearchError('Hubo un inconveniente al conectar con YouTube. Mostrando canciones recomendadas disponibles.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearchYouTube(tag);
  };

  // Mantener guardado el último volumen activo no nulo
  const preMuteRef = React.useRef(volume > 0 ? volume : 0.7);
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

  // Form for adding custom YouTube track
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Curated genres for Domino games
  const DOMINO_GENRES = ['Todos', 'Salsa Brava', 'Son Cubano', 'Merengue', 'Bachata', 'Mixes Largos'];
  const displayedCuratedTracks =
    selectedGenre === 'Todos'
      ? CURATED_DOMINO_YOUTUBE_TRACKS
      : CURATED_DOMINO_YOUTUBE_TRACKS.filter((t) => t.genre === selectedGenre);

  // Check URL & Auto-fetch video info
  const handleCheckUrl = async () => {
    const raw = customUrl.trim();
    if (!raw) return;

    const ytId = extractYouTubeId(raw);
    if (!ytId) {
      alert('Por favor introduce un enlace o ID válido de YouTube (ej. https://youtube.com/watch?v=... o https://youtu.be/...)');
      return;
    }

    setIsCheckingUrl(true);
    try {
      const fullUrl = `https://www.youtube.com/watch?v=${ytId}`;
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(fullUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) setCustomTitle(data.title);
        if (data.author_name) setCustomArtist(data.author_name);
        if (data.thumbnail_url) setCustomThumbnail(data.thumbnail_url);
      } else {
        // Fallback basic info
        if (!customTitle) setCustomTitle(`Canción de YouTube (${ytId})`);
        if (!customArtist) setCustomArtist('YouTube');
        setCustomThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      }
    } catch (err) {
      console.warn('Auto-info notice:', err);
      if (!customTitle) setCustomTitle(`Canción de YouTube (${ytId})`);
      if (!customArtist) setCustomArtist('YouTube');
      setCustomThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    } finally {
      setIsCheckingUrl(false);
    }
  };

  // Add custom YouTube track
  const handleAddCustomTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = customUrl.trim();
    if (!raw) return;

    const ytId = extractYouTubeId(raw);
    const isYouTube = !!ytId;

    const videoId = ytId || undefined;
    const embedUrl = isYouTube
      ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&enablejsapi=1`
      : raw;

    const thumbnail = isYouTube
      ? customThumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : undefined;

    const newTrack: MusicTrack = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      videoId,
      title: customTitle.trim() || (isYouTube ? `Canción de YouTube` : 'Audio Personalizado'),
      artist: customArtist.trim() || (isYouTube ? 'YouTube' : 'Enlace Web'),
      sourceType: isYouTube ? 'youtube' : 'audio',
      url: embedUrl,
      artworkUrl: thumbnail,
      durationText: 'Canción completa',
      addedByUser: true,
    };

    onAddCustomTrack(newTrack);
    onSelectTrack(newTrack);

    setCustomUrl('');
    setCustomTitle('');
    setCustomArtist('');
    setCustomThumbnail(null);
    setAddedSuccess(true);
    setSavedSuccessMessage('¡Canción de YouTube guardada y en reproducción!');
    setTimeout(() => {
      setAddedSuccess(false);
      setSavedSuccessMessage(null);
    }, 4000);
  };

  // Save track directly from search results to custom tracks
  const handleSaveResultTrack = (track: MusicTrack) => {
    const alreadySaved = customTracks.some(
      (t) => (t.videoId && t.videoId === track.videoId) || t.url === track.url
    );
    if (alreadySaved) {
      setSavedSuccessMessage(`"${track.title}" ya está en tu lista.`);
      setTimeout(() => setSavedSuccessMessage(null), 3000);
      return;
    }

    const savedTrack: MusicTrack = {
      ...track,
      id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      addedByUser: true,
    };

    onAddCustomTrack(savedTrack);
    setSavedSuccessMessage(`¡"${track.title}" guardada en tu lista!`);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                Música para la Partida
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Playing Bar inside Modal */}
        {currentTrack && (
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate flex-1">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-850 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                {currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Music className="w-5 h-5 text-amber-400" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                )}
              </div>

              <div className="truncate flex-1">
                <div className="text-xs font-bold text-stone-100 truncate flex items-center gap-1.5">
                  <span className="truncate">{currentTrack.title}</span>
                  {currentTrack.sourceType === 'youtube' && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0 flex items-center gap-1">
                      <Youtube className="w-2.5 h-2.5" />
                      YouTube
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                  <span>{currentTrack.artist}</span>
                  {currentTrack.durationText && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span className="font-mono text-amber-400/90 text-[10px] font-medium">
                        {currentTrack.durationText}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Volume Controls */}
              <div className="flex items-center gap-1 bg-stone-900/80 px-2 py-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={handleMuteClick}
                  title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                  className="text-stone-400 hover:text-stone-200"
                >
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.max(0, Math.round((volume - 0.1) * 100) / 100))}
                  title="Bajar volumen"
                  className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  title={`Volumen: ${Math.round(volume * 100)}%`}
                  className="w-12 sm:w-16 accent-amber-500 h-1 bg-stone-800 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.min(1, Math.round((volume + 0.1) * 100) / 100))}
                  title="Subir volumen"
                  className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold"
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
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-950/30 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Global Success Notification Pill */}
        {savedSuccessMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{savedSuccessMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'search'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-red-400" />
            <span>Buscar en YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curated')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'curated'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Recomendadas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
              {CURATED_DOMINO_YOUTUBE_TRACKS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mi Lista</span>
            {customTracks.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300 font-semibold">
                {customTracks.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stations'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Estaciones de Radio</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB: Search in YouTube */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Tip Banner */}
              <div className="p-2.5 sm:p-3 bg-red-950/30 border border-red-500/40 rounded-2xl flex items-center justify-between text-xs text-red-200/90">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs leading-tight">
                    Busca salsa, merengue, bachata o cualquier artista en YouTube. <strong>Se reproduce completo.</strong>
                  </span>
                </div>
              </div>

              {/* Search Form */}
              <form
                action="javascript:void(0);"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchYouTube();
                }}
                className="flex gap-2 items-center"
              >
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
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
                        e.currentTarget.blur();
                        if (val) {
                          handleSearchYouTube(val);
                        }
                      }
                    }}
                    placeholder="Buscar salsa, artista o canción..."
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
                  onPointerDown={(e) => {
                    // Prevents keyboard blur event on mobile touchscreen from canceling the tap/click
                    e.preventDefault();
                  }}
                  onClick={() => {
                    handleSearchYouTube();
                  }}
                  className="px-3.5 sm:px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[42px] touch-manipulation"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="sm:hidden font-bold">Buscar</span>
                  <span className="hidden sm:inline">Buscar en YouTube</span>
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Populares:
                </span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-750 transition-colors cursor-pointer active:scale-95 touch-manipulation"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Results Display */}
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                  <span className="text-sm font-medium">Buscando canciones en YouTube...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchError && (
                    <div className="p-3 text-center text-xs text-amber-200 bg-amber-950/40 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2">
                      <p className="flex-1 text-left">{searchError}</p>
                      <button
                        type="button"
                        onClick={() => handleSearchYouTube()}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold whitespace-nowrap"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                        <span>Resultados de YouTube ({searchResults.length})</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Canción completa
                        </span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {searchResults.map((track) => {
                          const isThisPlaying =
                            (currentTrack?.id === track.id ||
                              (track.videoId && currentTrack?.videoId === track.videoId)) &&
                            isPlaying;

                          return (
                            <div
                              key={track.id}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isThisPlaying
                                  ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
                                  : 'bg-stone-850/80 hover:bg-stone-800 border-stone-800'
                              }`}
                            >
                              <div
                                onClick={() => onSelectTrack(track)}
                                className="flex items-center gap-3 truncate flex-1 cursor-pointer group touch-manipulation"
                              >
                                <div className="relative w-14 h-11 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 flex-shrink-0">
                                  {track.artworkUrl ? (
                                    <img
                                      src={track.artworkUrl}
                                      alt={track.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-stone-900">
                                      <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                  )}
                                  {track.durationText && (
                                    <div className="absolute bottom-0 right-0 bg-black/80 text-white font-mono text-[9px] px-1 rounded-tl">
                                      {track.durationText}
                                    </div>
                                  )}
                                </div>

                                <div className="truncate flex-1">
                                  <h4 className="text-xs font-bold text-stone-100 group-hover:text-red-400 truncate transition-colors">
                                    {track.title}
                                  </h4>
                                  <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                    {track.artist}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleSaveResultTrack(track)}
                                  title="Guardar en mi lista"
                                  className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-750 transition-colors touch-manipulation"
                                >
                                  <BookmarkPlus className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onSelectTrack(track)}
                                  title={isThisPlaying ? 'Pausar' : 'Reproducir'}
                                  className={`p-2.5 rounded-xl font-bold transition-all shadow-md touch-manipulation ${
                                    isThisPlaying
                                      ? 'bg-amber-500 text-stone-950'
                                      : 'bg-red-600 hover:bg-red-500 text-white'
                                  }`}
                                >
                                  {isThisPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : !searchError ? (
                /* Initial state before searching: popular picks ready to play */
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                    <span className="font-bold text-stone-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Canciones populares listas para sonar (toca para reproducir)
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {CURATED_DOMINO_YOUTUBE_TRACKS.slice(0, 6).map((track) => {
                      const isThisPlaying = currentTrack?.videoId === track.videoId && isPlaying;
                      return (
                        <div
                          key={track.id}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                            isThisPlaying
                              ? 'bg-red-950/30 border-red-500/50'
                              : 'bg-stone-850/60 hover:bg-stone-800 border-stone-800'
                          }`}
                        >
                          <div
                            onClick={() => onSelectTrack(track)}
                            className="flex items-center gap-2.5 truncate flex-1 cursor-pointer group"
                          >
                            <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-stone-900 border border-stone-700 flex-shrink-0">
                              {track.artworkUrl && (
                                <img
                                  src={track.artworkUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              {track.durationText && (
                                <div className="absolute bottom-0 right-0 bg-black/80 text-white font-mono text-[8px] px-1 rounded-tl">
                                  {track.durationText}
                                </div>
                              )}
                            </div>
                            <div className="truncate flex-1">
                              <h5 className="text-xs font-bold text-stone-200 group-hover:text-red-400 truncate">
                                {track.title}
                              </h5>
                              <p className="text-[10px] text-stone-400 truncate">{track.artist}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectTrack(track)}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-colors"
                            title="Reproducir"
                          >
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
                </div>
              )}
            </div>
          )}

          {/* TAB: Curated Domino Music */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              {/* Notice that playback is full song */}
              <div className="p-3 bg-amber-950/25 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-200/90">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Canciones y mixes completos listos para jugar sin cortes. <strong>Toca cualquier canción para reproducirla inmediatamente.</strong>
                  </span>
                </div>
              </div>

              {/* Genre Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {DOMINO_GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      selectedGenre === genre
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/30'
                        : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-750'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Curated Tracks List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                  <span>Repertorio Disponible ({displayedCuratedTracks.length})</span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {displayedCuratedTracks.map((track) => {
                    const isThisPlaying = currentTrack?.videoId === track.videoId && isPlaying;

                    return (
                      <div
                        key={track.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isThisPlaying
                            ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                            : 'bg-stone-850/80 hover:bg-stone-800 border-stone-800'
                        }`}
                      >
                        <div
                          onClick={() => onSelectTrack(track)}
                          className="flex items-center gap-3 truncate flex-1 cursor-pointer group"
                        >
                          <div className="relative w-14 h-11 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 flex-shrink-0">
                            {track.artworkUrl ? (
                              <img
                                src={track.artworkUrl}
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-stone-900">
                                <Youtube className="w-5 h-5 text-red-500" />
                              </div>
                            )}
                            {track.durationText && (
                              <div className="absolute bottom-0 right-0 bg-black/80 text-white font-mono text-[9px] px-1 rounded-tl">
                                {track.durationText}
                              </div>
                            )}
                          </div>

                          <div className="truncate flex-1">
                            <h4 className="text-xs font-bold text-stone-100 group-hover:text-amber-300 truncate transition-colors">
                              {track.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-stone-400 truncate">
                                {track.artist}
                              </span>
                              {track.genre && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-stone-750 text-stone-300 font-medium whitespace-nowrap">
                                  {track.genre}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Save to custom playlist button */}
                          <button
                            type="button"
                            onClick={() => handleSaveResultTrack(track)}
                            title="Guardar en mi lista"
                            className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-750 transition-colors"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>

                          {/* Play button */}
                          <button
                            type="button"
                            onClick={() => onSelectTrack(track)}
                            title={isThisPlaying ? 'Pausar' : 'Reproducir'}
                            className={`p-2.5 rounded-xl font-bold transition-all shadow-md ${
                              isThisPlaying
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Add YouTube Music / Link & Saved Tracks */}
          {activeTab === 'add' && (
            <div className="space-y-5">
              {/* Add form */}
              <form
                onSubmit={handleAddCustomTrackSubmit}
                className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-200">
                      Añadir canción
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Pega cualquier enlace o ID de video para reproducirlo.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-300 font-medium">
                    Enlace o ID de video:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCheckUrl();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                      required
                      className="flex-1 min-w-0 bg-stone-900 border border-stone-750 focus:border-red-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={handleCheckUrl}
                      disabled={isCheckingUrl || !customUrl.trim()}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer touch-manipulation"
                    >
                      {isCheckingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Consultar datos</span>
                    </button>
                  </div>
                </div>

                {/* Optional Title & Artist / Auto-filled */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400">Título de la canción:</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Ej. Celia Cruz - La Vida Es Un Carnaval"
                      className="w-full bg-stone-900 border border-stone-750 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400">Artista o Canal:</label>
                    <input
                      type="text"
                      value={customArtist}
                      onChange={(e) => setCustomArtist(e.target.value)}
                      placeholder="Ej. Celia Cruz"
                      className="w-full bg-stone-900 border border-stone-750 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preview Thumbnail if available */}
                {customThumbnail && (
                  <div className="flex items-center gap-2 p-2 bg-stone-900 rounded-xl border border-stone-800">
                    <img
                      src={customThumbnail}
                      alt="Thumbnail preview"
                      className="w-12 h-8 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate text-xs text-stone-300">
                      <span className="font-semibold text-stone-100">{customTitle || 'Video detectado'}</span>
                      <p className="text-[10px] text-stone-500 truncate">{customArtist}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Reproducción completa garantizada
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar y Reproducir</span>
                  </button>
                </div>
              </form>

              {/* Saved custom tracks list */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                  <span className="font-bold text-stone-300">
                    Mis Canciones Guardadas ({customTracks.length})
                  </span>
                </div>

                {customTracks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-stone-950/30 rounded-xl border border-stone-800/80">
                    No tienes canciones guardadas aún. Pega un enlace arriba o presiona el icono de guardar en la pestaña de Recomendadas.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {customTracks.map((track) => {
                      const isThisPlaying =
                        currentTrack?.id === track.id ||
                        (track.videoId && currentTrack?.videoId === track.videoId);

                      return (
                        <div
                          key={track.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                            isThisPlaying
                              ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/20'
                              : 'bg-stone-850/80 hover:bg-stone-800 border-stone-800'
                          }`}
                        >
                          <div
                            onClick={() => onSelectTrack(track)}
                            className="flex items-center gap-2.5 truncate flex-1 cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                              {track.artworkUrl ? (
                                <img
                                  src={track.artworkUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Youtube className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="truncate flex-1">
                              <h5 className="text-xs font-bold text-stone-200 group-hover:text-amber-300 truncate">
                                {track.title}
                              </h5>
                              <p className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                                <span>{track.artist}</span>
                                {track.durationText && (
                                  <>
                                    <span className="text-stone-600">•</span>
                                    <span className="font-mono text-[10px] text-amber-400">
                                      {track.durationText}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectTrack(track)}
                              className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold shadow-md transition-transform active:scale-95"
                              title={isThisPlaying && isPlaying ? 'Pausar' : 'Reproducir'}
                            >
                              {isThisPlaying && isPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCustomTrack(track.id)}
                              className="p-2 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
                              title="Eliminar pista guardada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Live Radio Stations */}
          {activeTab === 'stations' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-400 px-1">
                Estaciones de radio en vivo continuas 24/7 para ambientar tu mesa de dominó.
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {PRESET_STATIONS.map((station) => {
                  const isThisPlaying = currentTrack?.id === station.id;

                  return (
                    <div
                      key={station.id}
                      onClick={() => onSelectTrack(station)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                        isThisPlaying
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                          : 'bg-stone-850 hover:bg-stone-800 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate flex-1">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0">
                          <img
                            src={station.artworkUrl}
                            alt={station.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          {isThisPlaying && isPlaying && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                            </div>
                          )}
                        </div>

                        <div className="truncate flex-1">
                          <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 truncate transition-colors">
                            {station.title}
                          </h4>
                          <p className="text-xs text-stone-400 truncate">{station.artist}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            En vivo 24/7
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrack(station);
                        }}
                        className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex-shrink-0 ${
                          isThisPlaying && isPlaying
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200'
                        }`}
                      >
                        {isThisPlaying && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
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
