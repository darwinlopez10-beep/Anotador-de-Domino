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
  ExternalLink,
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

// Lista inicial recomendada para dominó con artistas y géneros variados
export const CURATED_DOMINO_YOUTUBE_TRACKS: MusicTrack[] = [
  {
    id: 'yt_ugNQ5uIN09Q',
    videoId: 'ugNQ5uIN09Q',
    title: 'Volver Volver',
    artist: 'Vicente Fernández',
    genre: 'Ranchera / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/ugNQ5uIN09Q?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/ugNQ5uIN09Q/hqdefault.jpg',
    durationText: '3:00',
  },
  {
    id: 'yt_gfm2zSgQ8cQ',
    videoId: 'gfm2zSgQ8cQ',
    title: 'Por Tu Maldito Amor',
    artist: 'Vicente Fernández',
    genre: 'Ranchera / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/gfm2zSgQ8cQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/gfm2zSgQ8cQ/hqdefault.jpg',
    durationText: '3:55',
  },
  {
    id: 'yt_-Z-r96yP_f0',
    videoId: '-Z-r96yP_f0',
    title: 'El Rey',
    artist: 'Vicente Fernández',
    genre: 'Ranchera / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/-Z-r96yP_f0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/-Z-r96yP_f0/hqdefault.jpg',
    durationText: '2:28',
  },
  {
    id: 'yt_0A7t27nyAo8',
    videoId: '0A7t27nyAo8',
    title: 'Así Fue (En Vivo Bellas Artes)',
    artist: 'Juan Gabriel',
    genre: 'Balada / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0A7t27nyAo8?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0A7t27nyAo8/hqdefault.jpg',
    durationText: '7:20',
  },
  {
    id: 'yt_gXlK1yC7Noc',
    videoId: 'gXlK1yC7Noc',
    title: 'Hasta Que Te Conocí',
    artist: 'Juan Gabriel',
    genre: 'Balada / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/gXlK1yC7Noc?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/gXlK1yC7Noc/hqdefault.jpg',
    durationText: '7:15',
  },
  {
    id: 'yt_m7DqK_0mS5E',
    videoId: 'm7DqK_0mS5E',
    title: 'Si No Te Hubieras Ido',
    artist: 'Marco Antonio Solís',
    genre: 'Balada Romántica',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/m7DqK_0mS5E?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/m7DqK_0mS5E/hqdefault.jpg',
    durationText: '4:49',
  },
  {
    id: 'yt_L_f448K_3-8',
    videoId: 'L_f448K_3-8',
    title: 'Más Que Tu Amigo',
    artist: 'Marco Antonio Solís',
    genre: 'Cumbia / Fiesta',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/L_f448K_3-8?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/L_f448K_3-8/hqdefault.jpg',
    durationText: '3:32',
  },
  {
    id: 'yt_Kk9WvO9Zg5M',
    videoId: 'Kk9WvO9Zg5M',
    title: 'Me Olvidé de Vivir',
    artist: 'Julio Iglesias',
    genre: 'Balada / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/Kk9WvO9Zg5M?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/Kk9WvO9Zg5M/hqdefault.jpg',
    durationText: '4:52',
  },
  {
    id: 'yt_d3_Fm8X6O-E',
    videoId: 'd3_Fm8X6O-E',
    title: 'Hey!',
    artist: 'Julio Iglesias',
    genre: 'Balada / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/d3_Fm8X6O-E?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/d3_Fm8X6O-E/hqdefault.jpg',
    durationText: '5:00',
  },
  {
    id: 'yt_W0vK9G_Qz7I',
    videoId: 'W0vK9G_Qz7I',
    title: 'La Puerta Negra',
    artist: 'Los Tigres del Norte',
    genre: 'Norteño / Corrido',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/W0vK9G_Qz7I?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/W0vK9G_Qz7I/hqdefault.jpg',
    durationText: '3:25',
  },
  {
    id: 'yt_8O_MwlZ2dEg',
    videoId: '8O_MwlZ2dEg',
    title: 'Brujería',
    artist: 'El Gran Combo de Puerto Rico',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/8O_MwlZ2dEg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/8O_MwlZ2dEg/hqdefault.jpg',
    durationText: '4:18',
  },
  {
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
  {
    id: 'yt_BNo0vkEYWRc',
    videoId: 'BNo0vkEYWRc',
    title: 'El Cantante',
    artist: 'Héctor Lavoe',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BNo0vkEYWRc?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BNo0vkEYWRc/hqdefault.jpg',
    durationText: '10:20',
  },
  {
    id: 'yt_2jR9f5hH9vI',
    videoId: '2jR9f5hH9vI',
    title: 'La Rebelión (No Le Pegue a la Negra)',
    artist: 'Joe Arroyo',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/2jR9f5hH9vI?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/2jR9f5hH9vI/hqdefault.jpg',
    durationText: '4:45',
  },
  {
    id: 'yt_0nBFWzpWXuM',
    videoId: '0nBFWzpWXuM',
    title: 'La Vida Es Un Carnaval',
    artist: 'Celia Cruz',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0nBFWzpWXuM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0nBFWzpWXuM/hqdefault.jpg',
    durationText: '4:38',
  },
  {
    id: 'yt_YXnjy5YlDwk',
    videoId: 'YXnjy5YlDwk',
    title: 'Vivir Mi Vida',
    artist: 'Marc Anthony',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/YXnjy5YlDwk?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/YXnjy5YlDwk/hqdefault.jpg',
    durationText: '4:18',
  },
  {
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
  {
    id: 'yt_t6nW_X_fQ7c',
    videoId: 't6nW_X_fQ7c',
    title: 'Chan Chan',
    artist: 'Buena Vista Social Club',
    genre: 'Son Cubano',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/t6nW_X_fQ7c?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/t6nW_X_fQ7c/hqdefault.jpg',
    durationText: '4:16',
  },
  {
    id: 'yt_ePZ9d_mO6z4',
    videoId: 'ePZ9d_mO6z4',
    title: 'La Bikina',
    artist: 'Luis Miguel',
    genre: 'Mariachi / Bolero',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/ePZ9d_mO6z4?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/ePZ9d_mO6z4/hqdefault.jpg',
    durationText: '3:05',
  },
  {
    id: 'yt_E20G25SCAVU',
    videoId: 'E20G25SCAVU',
    title: 'El Triste',
    artist: 'José José',
    genre: 'Balada / Clásicos',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/E20G25SCAVU?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/E20G25SCAVU/hqdefault.jpg',
    durationText: '4:15',
  },
  {
    id: 'yt_QFs3PIZb3js',
    videoId: 'QFs3PIZb3js',
    title: 'Propuesta Indecente',
    artist: 'Romeo Santos',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/QFs3PIZb3js?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/QFs3PIZb3js/hqdefault.jpg',
    durationText: '4:15',
  },
  {
    id: 'yt_DUT5rEU6pqM',
    videoId: 'DUT5rEU6pqM',
    title: "Hips Don't Lie",
    artist: 'Shakira',
    genre: 'Latino / Pop',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/DUT5rEU6pqM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/DUT5rEU6pqM/hqdefault.jpg',
    durationText: '3:38',
  },
  {
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
  {
    id: 'yt_BVYLOe4Xkg0',
    videoId: 'BVYLOe4Xkg0',
    title: 'Mix Salsa Clásica Brava para Bailar y Jugar',
    artist: 'Salsa de Oro',
    genre: 'Mixes',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BVYLOe4Xkg0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BVYLOe4Xkg0/hqdefault.jpg',
    durationText: '45:00',
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

// Botones rápidos para buscar directamente artistas o géneros populares en YouTube
const POPULAR_SEARCH_TAGS = [
  'Vicente Fernández',
  'Juan Gabriel',
  'Julio Iglesias',
  'Marco Antonio Solís',
  'Los Tigres del Norte',
  'Marc Anthony',
  'Celia Cruz',
  'Héctor Lavoe',
  'Joe Arroyo',
  'El Gran Combo',
  'Los Hermanos Rosario',
  'Juan Luis Guerra',
  'Luis Miguel',
  'José José',
  'Romeo Santos',
  'Shakira',
  'Frank Sinatra',
  'Salsa Clásica',
  'Merengues',
  'Bachatas',
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
  const songsListSectionRef = useRef<HTMLDivElement>(null);
  const modalScrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Active YouTube video ID
  const activeVideoId = currentTrack?.videoId || (currentTrack?.url ? extractYouTubeId(currentTrack.url) : null);

  // Sincronizar estado play/pause con el iframe integrado de YouTube
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Sincronizar volumen con el iframe integrado
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const vol100 = Math.round(volume * 100);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [vol100] }),
        '*'
      );
      if (vol100 === 0) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: '' }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
          '*'
        );
      }
    } catch {
      // ignore
    }
  }, [volume]);

  // Selección manual de una canción (NUNCA automática)
  const handleSelectSong = async (track: MusicTrack) => {
    onSelectTrack(track);
    setIsVideoExpanded(true);

    // Si la canción no tiene videoId específico, resolverlo rápidamente en segundo plano para máxima compatibilidad
    if (!track.videoId && track.sourceType === 'youtube') {
      try {
        const q = `${track.artist} ${track.title}`;
        let resolvedId: string | null = null;

        // 1. Catálogo local
        const local = CURATED_DOMINO_YOUTUBE_TRACKS.find(
          (c) =>
            c.title.toLowerCase() === track.title.toLowerCase() ||
            track.title.toLowerCase().includes(c.title.toLowerCase())
        );
        if (local?.videoId) resolvedId = local.videoId;

        // 2. Servidor si está activo
        if (!resolvedId) {
          try {
            const sRes = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`, {
              signal: AbortSignal.timeout(2000),
            });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (sData.results?.[0]?.videoId) resolvedId = sData.results[0].videoId;
            }
          } catch {}
        }

        // 3. Invidious CORS
        if (!resolvedId) {
          try {
            const invRes = await fetch(
              `https://invidious.flokinet.to/api/v1/search?q=${encodeURIComponent(q)}&type=video`,
              { signal: AbortSignal.timeout(2500) }
            );
            if (invRes.ok) {
              const invData = await invRes.json();
              if (invData?.[0]?.videoId) resolvedId = invData[0].videoId;
            }
          } catch {}
        }

        if (resolvedId) {
          const updated: MusicTrack = {
            ...track,
            videoId: resolvedId,
            url: `https://www.youtube.com/embed/${resolvedId}?autoplay=1&playsinline=1&enablejsapi=1`,
            artworkUrl: track.artworkUrl || `https://img.youtube.com/vi/${resolvedId}/hqdefault.jpg`,
          };
          onSelectTrack(updated);
        }
      } catch {
        // Mantiene la reproducción con listType=search
      }
    }
  };

  // Protocolo Universal de Búsqueda Karaoke Pro (100% compatible con celulares Android y PC sin depender de backend)
  const handleSearchYouTube = async (termToSearch?: string) => {
    const rawVal = termToSearch !== undefined ? termToSearch : (searchInputRef.current?.value || searchQuery);
    const query = (rawVal || '').trim();

    // Ocultar teclado virtual en Android y enfocar resultados
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!query) {
      setSearchError('Escribe el nombre de un cantante, grupo o canción, o toca uno de los botones abajo.');
      return;
    }

    // Comprobar si el usuario pegó un enlace directo de YouTube
    const directVideoId = extractYouTubeId(query);
    if (directVideoId) {
      const directTrack: MusicTrack = {
        id: `yt_${directVideoId}`,
        videoId: directVideoId,
        title: 'Canción de YouTube',
        artist: 'YouTube',
        sourceType: 'youtube',
        url: `https://www.youtube.com/embed/${directVideoId}?autoplay=1&playsinline=1&enablejsapi=1`,
        artworkUrl: `https://img.youtube.com/vi/${directVideoId}/hqdefault.jpg`,
      };
      setSearchResults([directTrack]);
      setSearchQuery(query);
      setHasSearched(true);
      setSearchError(null);
      handleSelectSong(directTrack);
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    // 1. Coincidencias instantáneas del catálogo local de dominó (0ms, offline y verificado)
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(Boolean);
    const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter((t) => {
      const tStr = `${t.title} ${t.artist} ${t.genre || ''}`.toLowerCase();
      return queryTokens.every((token) => tStr.includes(token)) || tStr.includes(queryLower);
    });

    // 2. Protocolo Karaoke Pro: Búsqueda universal directa en cliente mediante catálogo de Apple Music / iTunes
    // Permite buscar CUALQUIER artista, canción o género en el mundo desde cualquier celular sin pasar por el servidor
    const fetchClientCatalog = async (): Promise<MusicTrack[]> => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=35`,
          { signal: AbortSignal.timeout(4500) }
        );
        if (!res.ok) return [];
        const data = await res.json();
        if (!data || !Array.isArray(data.results)) return [];

        return data.results.map((item: any) => {
          const durSec = Math.round((item.trackTimeMillis || 0) / 1000);
          const m = Math.floor(durSec / 60);
          const s = durSec % 60;
          const art = item.artistName || 'Artista';
          const tit = item.trackName || 'Sin título';

          const matchedLocal = CURATED_DOMINO_YOUTUBE_TRACKS.find(
            (c) => c.title.toLowerCase() === tit.toLowerCase() && c.artist.toLowerCase() === art.toLowerCase()
          );

          return {
            id: `itunes_${item.trackId}`,
            videoId: matchedLocal?.videoId,
            title: tit,
            artist: art,
            sourceType: 'youtube' as const,
            url: matchedLocal?.videoId
              ? `https://www.youtube.com/embed/${matchedLocal.videoId}?autoplay=1&playsinline=1&enablejsapi=1`
              : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(art + ' ' + tit)}&autoplay=1&playsinline=1&enablejsapi=1`,
            artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : undefined,
            durationSeconds: durSec,
            durationText: durSec > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : undefined,
            genre: item.primaryGenreName,
            previewUrl: item.previewUrl,
          };
        });
      } catch {
        return [];
      }
    };

    // 3. Consulta en paralelo a APIs de video directas (servidor local e Invidious CORS)
    const fetchYouTubeDirect = async (): Promise<MusicTrack[]> => {
      // 3.1 Probar servidor local si está activo
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.results) && data.results.length > 0) {
            return data.results;
          }
        }
      } catch {}

      // 3.2 Probar Invidious CORS público
      try {
        const invRes = await fetch(
          `https://invidious.flokinet.to/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) {
            return invData.slice(0, 15).map((v: any) => {
              const dur = v.lengthSeconds || 0;
              const m = Math.floor(dur / 60);
              const s = dur % 60;
              return {
                id: `yt_${v.videoId}`,
                videoId: v.videoId,
                title: v.title,
                artist: v.author || 'YouTube',
                sourceType: 'youtube' as const,
                url: `https://www.youtube.com/embed/${v.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
                durationSeconds: dur,
                durationText: dur > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : undefined,
              };
            });
          }
        }
      } catch {}

      return [];
    };

    try {
      const [clientTracks, ytTracks] = await Promise.all([
        fetchClientCatalog(),
        fetchYouTubeDirect(),
      ]);

      // Fusionar y desduplicar resultados respetando prioridad de calidad
      const combined: MusicTrack[] = [];
      const seenKeys = new Set<string>();

      // 1. Primero las coincidencias locales verificadas
      for (const track of localMatches) {
        const key = `${track.title.toLowerCase()}_${track.artist.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(track);
        }
      }

      // 2. Si obtuvimos videos directos de YouTube, agregarlos
      for (const track of ytTracks) {
        const key = `${track.title.toLowerCase()}_${track.artist.toLowerCase()}`;
        if (!seenKeys.has(key) && track.videoId) {
          seenKeys.add(key);
          combined.push(track);
        }
      }

      // 3. Agregar el catálogo universal completo de canciones
      for (const track of clientTracks) {
        const key = `${track.title.toLowerCase()}_${track.artist.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(track);
        }
      }

      if (combined.length > 0) {
        setSearchResults(combined);
        setSearchError(null);
        setTimeout(() => {
          songsListSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setSearchResults([]);
        setSearchError(`No se encontraron canciones para "${query}". Intenta buscar con otro nombre.`);
      }
    } catch {
      if (localMatches.length > 0) {
        setSearchResults(localMatches);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(`No se encontraron resultados para "${query}". Toca uno de los botones de artistas abajo.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Al presionar un botón de artista/género rápido: solo busca, NUNCA reproduce automáticamente
  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    if (searchInputRef.current) {
      searchInputRef.current.value = tag;
      searchInputRef.current.blur();
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
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&rel=0`
    : currentTrack
    ? (currentTrack.url && currentTrack.url.includes('embed')
        ? currentTrack.url
        : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&rel=0`)
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
                Buscador General de Música en YouTube
              </h3>
              <p className="text-[11px] text-stone-400">
                Busca y reproduce cualquier cantante, canción o género del mundo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div ref={modalScrollContainerRef} className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-3.5">
          {/* 1. BARRA DE BÚSQUEDA GENERAL ARRIBA (Misma estructura exacta en celular y computadora) */}
          <div ref={searchBarContainerRef} className="space-y-2.5">
            <form
              action="javascript:void(0)"
              onSubmit={(e) => {
                e.preventDefault();
                const term = searchInputRef.current?.value ?? searchQuery;
                handleSearchYouTube(term);
              }}
              className="flex flex-row items-center gap-2 w-full"
            >
              {/* Etiqueta "YouTube" integrada */}
              <div className="relative flex-1 min-w-0 flex items-center bg-stone-950 border border-stone-750 focus-within:border-amber-500 rounded-xl overflow-hidden shadow-inner transition-colors">
                <div className="px-2.5 sm:px-3 py-2.5 bg-stone-900 border-r border-stone-800 flex items-center gap-1.5 text-red-400 flex-shrink-0 select-none">
                  <Youtube className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-200 hidden xs:inline">YouTube</span>
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  inputMode="search"
                  name="search"
                  id="youtube-search-input"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                      e.preventDefault();
                      const term = searchInputRef.current?.value ?? searchQuery;
                      handleSearchYouTube(term);
                    }
                  }}
                  placeholder="Escribe cualquier cantante (ej: Vicente Fernández, Gabriel, Shakira)..."
                  className="w-full bg-transparent px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchQuery('');
                      if (searchInputRef.current) {
                        searchInputRef.current.value = '';
                        searchInputRef.current.focus();
                      }
                    }}
                    className="p-2 text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0 mr-1 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Borrar texto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón con la palabra Buscar al lado (type submit + onClick para máxima compatibilidad móvil y PC) */}
              <button
                type="submit"
                id="btn-search-music"
                disabled={isSearching}
                onClick={(e) => {
                  e.preventDefault();
                  const term = searchInputRef.current?.value ?? searchQuery;
                  handleSearchYouTube(term);
                }}
                className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[44px] min-w-[84px] touch-manipulation active:scale-95 select-none"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Search className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                )}
                <span>Buscar</span>
              </button>
            </form>

            {/* 2. CUADROS PEQUEÑOS DE ARTISTAS Y GÉNEROS POPULARES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cantantes populares (toca uno para buscar todas sus canciones en YouTube):
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-h-32 overflow-y-auto pr-1">
                {POPULAR_SEARCH_TAGS.map((tag) => {
                  const isCurrentTag = searchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation min-h-[38px] select-none ${
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

          {/* 3. REPRODUCTOR COMPACTO INTEGRADO (Solo visible cuando hay una canción seleccionada) */}
          {currentTrack && activeVideoId && (
            <div
              ref={playerContainerRef}
              className="bg-stone-950 border border-stone-800 rounded-xl p-3 shadow-md flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate flex-1">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0 flex items-center justify-center">
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
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'} flex-shrink-0`} />
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
                    className="min-h-[44px] px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer touch-manipulation"
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
                    className="min-h-[44px] p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-850 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title={isVideoExpanded ? 'Ocultar video' : 'Ver video'}
                  >
                    <Tv className="w-4 h-4 text-stone-400" />
                    <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isVideoExpanded ? '' : 'rotate-180'}`} />
                  </button>

                  {/* Abrir en la app de YouTube en Android */}
                  <a
                    href={
                      activeVideoId
                        ? `https://www.youtube.com/watch?v=${activeVideoId}`
                        : `https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir esta canción en la app de YouTube"
                    className="min-h-[44px] min-w-[40px] px-2.5 rounded-lg text-stone-400 hover:text-red-400 active:text-red-300 hover:bg-stone-850 border border-stone-750 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-stone-300" />
                  </a>
                </div>
              </div>

              {/* Video embebido en el mismo modal */}
              {isVideoExpanded && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800 mt-1 shadow-md">
                  <iframe
                    ref={iframeRef}
                    key={activeVideoId || currentTrack.id}
                    src={embedUrl}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. LISTA DE CANCIONES (JUSTO DEBAJO DE LA BÚSQUEDA) */}
          <div ref={songsListSectionRef} className="space-y-2.5">
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
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSearchYouTube()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap cursor-pointer min-h-[38px]"
                  >
                    Reintentar
                  </button>
                  {searchQuery && (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 text-xs font-bold whitespace-nowrap cursor-pointer min-h-[38px] flex items-center gap-1.5 border border-red-500/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en YouTube</span>
                    </a>
                  )}
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
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer py-1"
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
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer min-h-[44px]"
                >
                  Ver lista recomendada de dominó
                </button>
              </div>
            )}

            {/* Songs List - Tarjetas táctiles y adaptables */}
            <div className="space-y-2">
              {(hasSearched ? searchResults : CURATED_DOMINO_YOUTUBE_TRACKS).map((track) => {
                const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                const isThisTrackSelected = currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (isThisTrackSelected) {
                        onTogglePlay();
                      } else {
                        handleSelectSong(track);
                      }
                    }}
                    className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation min-h-[62px] ${
                      isThisPlaying
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                        : isThisTrackSelected
                        ? 'bg-stone-800 border-amber-500/40'
                        : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                    }`}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-3 truncate flex-1 group">
                      <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
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

                      <div className="truncate flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                          {track.title}
                        </h5>
                        <p className="text-[11px] sm:text-xs text-stone-400 truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {/* Abrir directamente en la app oficial de YouTube / navegador (ideal para Android) */}
                      <a
                        href={
                          track.videoId
                            ? `https://www.youtube.com/watch?v=${track.videoId}`
                            : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + ' ' + track.title)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir en la aplicación de YouTube de tu teléfono o navegador"
                        className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-stone-300 hover:text-red-400" />
                      </a>

                      {/* Direct play button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisTrackSelected) {
                            onTogglePlay();
                          } else {
                            handleSelectSong(track);
                          }
                        }}
                        title={isThisPlaying ? 'Pausar canción' : 'Reproducir canción'}
                        className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
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
