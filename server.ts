import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory search cache for fast repeated queries
const searchCache = new Map<string, { time: number; results: any[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // YouTube Search API endpoint
  app.get('/api/youtube/search', async (req, res) => {
    const query = (req.query.q as string)?.trim();
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const cacheKey = query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return res.json({ results: cached.results });
    }

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      });

      let results: any[] = [];
      const seenVideoIds = new Set<string>();

      if (response.ok) {
        const html = await response.text();
        let data: any = null;

        // 1. Robust balanced-braces extraction of ytInitialData
        const marker = 'ytInitialData';
        const markerIdx = html.indexOf(marker);
        if (markerIdx !== -1) {
          const eqIdx = html.indexOf('=', markerIdx);
          if (eqIdx !== -1) {
            const startBrace = html.indexOf('{', eqIdx);
            if (startBrace !== -1) {
              let depth = 0;
              let inString = false;
              let escape = false;
              let endBrace = -1;
              for (let i = startBrace; i < html.length; i++) {
                const char = html[i];
                if (escape) {
                  escape = false;
                  continue;
                }
                if (char === '\\') {
                  escape = true;
                  continue;
                }
                if (char === '"' && !escape) {
                  inString = !inString;
                  continue;
                }
                if (!inString) {
                  if (char === '{') depth++;
                  else if (char === '}') {
                    depth--;
                    if (depth === 0) {
                      endBrace = i;
                      break;
                    }
                  }
                }
              }
              if (endBrace !== -1) {
                try {
                  data = JSON.parse(html.substring(startBrace, endBrace + 1));
                } catch (e) {
                  console.warn('Balanced braces JSON parse failed:', e);
                }
              }
            }
          }
        }

        // 2. Fallback slice extraction if braces parse didn't succeed
        if (!data) {
          const sliceMarker = 'ytInitialData = ';
          const startIdx = html.indexOf(sliceMarker);
          if (startIdx !== -1) {
            const contentStart = startIdx + sliceMarker.length;
            const endIdx = html.indexOf(';</script>', contentStart);
            if (endIdx !== -1) {
              try {
                data = JSON.parse(html.substring(contentStart, endIdx));
              } catch (e) {
                console.warn('Slice JSON parse fallback failed:', e);
              }
            }
          }
        }

        // Recursive finder that extracts videos from any YouTube response layout
        const extractVideosRecursively = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;

          if (obj.videoId && typeof obj.videoId === 'string') {
            const vid = obj.videoId;
            if (!seenVideoIds.has(vid)) {
              seenVideoIds.add(vid);
              const title =
                obj.title?.runs?.[0]?.text ||
                obj.title?.simpleText ||
                obj.headline?.simpleText ||
                obj.accessibility?.accessibilityData?.label ||
                'Video de YouTube';
              const artist =
                obj.ownerText?.runs?.[0]?.text ||
                obj.shortBylineText?.runs?.[0]?.text ||
                obj.longBylineText?.runs?.[0]?.text ||
                'YouTube';
              const durationText = obj.lengthText?.simpleText || '';
              const thumbnail =
                obj.thumbnail?.thumbnails?.[obj.thumbnail.thumbnails.length - 1]?.url ||
                `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

              results.push({
                id: `yt_${vid}`,
                videoId: vid,
                title,
                artist,
                sourceType: 'youtube',
                url: `https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: thumbnail,
                durationText,
              });
            }
            return;
          }

          for (const key of Object.keys(obj)) {
            if (key !== 'trackingParams' && key !== 'innertubeCommand' && key !== 'onVisible') {
              extractVideosRecursively(obj[key]);
            }
          }
        };

        if (data) {
          extractVideosRecursively(data);
        }

        // 3. Fallback regex search for videoId matches
        if (results.length === 0) {
          const vidRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
          let match;
          while ((match = vidRegex.exec(html)) !== null && results.length < 25) {
            const vid = match[1];
            if (!seenVideoIds.has(vid)) {
              seenVideoIds.add(vid);
              results.push({
                id: `yt_${vid}`,
                videoId: vid,
                title: `${query} - Éxito`,
                artist: query,
                sourceType: 'youtube',
                url: `https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                durationText: '',
              });
            }
          }
        }
      }

      // 4. If YouTube returned fewer than 3 results, supplement with iTunes Search API
      if (results.length < 3) {
        try {
          const itunesRes = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (itunesRes.ok) {
            const itunesData = await itunesRes.json();
            if (itunesData && Array.isArray(itunesData.results)) {
              for (const item of itunesData.results) {
                const songTitle = item.trackName || '';
                const songArtist = item.artistName || query;
                const minutes = Math.floor((item.trackTimeMillis || 0) / 60000);
                const seconds = Math.floor(((item.trackTimeMillis || 0) % 60000) / 1000);
                const durStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                const itunesArt = item.artworkUrl100?.replace('100x100bb', '300x300bb') || item.artworkUrl100;

                results.push({
                  id: `itunes_${item.trackId || Math.random().toString(36).substring(7)}`,
                  title: songTitle,
                  artist: songArtist,
                  sourceType: 'youtube',
                  url: item.previewUrl || '',
                  artworkUrl: itunesArt,
                  durationText: durStr,
                });
              }
            }
          }
        } catch (itunesErr) {
          console.warn('iTunes fallback search failed:', itunesErr);
        }
      }

      const finalResults = results.slice(0, 30);
      if (finalResults.length > 0) {
        searchCache.set(cacheKey, { time: Date.now(), results: finalResults });
      }

      res.json({ results: finalResults });
    } catch (err: unknown) {
      console.error('Error during search:', err);
      res.status(500).json({ error: 'Failed to search music' });
    }
  });

  // YouTube Info (via oEmbed) endpoint
  app.get('/api/youtube/info', async (req, res) => {
    const rawUrl = (req.query.url as string)?.trim();
    if (!rawUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return res.status(404).json({ error: 'Video not found or invalid URL' });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      console.error('Error fetching YouTube info:', err);
      res.status(500).json({ error: 'Failed to fetch video info' });
    }
  });

  // Vite middleware for development, or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Domino Scoreboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
