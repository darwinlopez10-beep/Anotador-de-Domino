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

    let finalResults: any[] = [];
    const seenVideoIds = new Set<string>();

    try {
      // 1. PRIMARY: YouTube Innertube Web Client API (Direct JSON, highly reliable for any artist/song)
      try {
        const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
          method: 'POST',
          signal: AbortSignal.timeout(9000),
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB',
                clientVersion: '2.20240313.01.00',
                hl: 'es',
                gl: 'US',
              },
            },
            query,
          }),
        });

        if (innertubeRes.ok) {
          const innertubeData = await innertubeRes.json();
          const walkInnertube = (o: any) => {
            if (!o || typeof o !== 'object') return;
            if (o.videoId && typeof o.videoId === 'string' && o.videoId.length === 11) {
              if (o.title && !seenVideoIds.has(o.videoId)) {
                seenVideoIds.add(o.videoId);
                const title =
                  (Array.isArray(o.title?.runs) ? o.title.runs.map((r: any) => r.text).join('') : '') ||
                  o.title?.simpleText ||
                  o.headline?.simpleText ||
                  '';
                const artist =
                  (Array.isArray(o.ownerText?.runs) ? o.ownerText.runs.map((r: any) => r.text).join('') : '') ||
                  (Array.isArray(o.shortBylineText?.runs) ? o.shortBylineText.runs.map((r: any) => r.text).join('') : '') ||
                  (Array.isArray(o.longBylineText?.runs) ? o.longBylineText.runs.map((r: any) => r.text).join('') : '') ||
                  'YouTube';

                let durationText = o.lengthText?.simpleText || '';
                if (!durationText && Array.isArray(o.thumbnailOverlays)) {
                  for (const ov of o.thumbnailOverlays) {
                    const time = ov?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText;
                    if (time) {
                      durationText = time;
                      break;
                    }
                  }
                }

                const thumb =
                  o.thumbnail?.thumbnails?.[o.thumbnail.thumbnails.length - 1]?.url ||
                  `https://img.youtube.com/vi/${o.videoId}/hqdefault.jpg`;

                if (title) {
                  finalResults.push({
                    id: `yt_${o.videoId}`,
                    videoId: o.videoId,
                    title: title.trim(),
                    artist: artist.trim(),
                    sourceType: 'youtube',
                    url: `https://www.youtube.com/embed/${o.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
                    artworkUrl: thumb,
                    durationText: durationText.trim(),
                  });
                }
              }
              return;
            }
            for (const k of Object.keys(o)) {
              if (k !== 'trackingParams' && k !== 'innertubeCommand') {
                walkInnertube(o[k]);
              }
            }
          };

          walkInnertube(innertubeData);
        }
      } catch (innertubeErr) {
        console.warn('Innertube search failed, falling back to HTML scraping:', innertubeErr);
      }

      // 2. SECONDARY: Standard YouTube HTML scraping fallback
      if (finalResults.length === 0) {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await fetch(searchUrl, {
          signal: AbortSignal.timeout(9000),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          },
        });

        if (response.ok) {
          const html = await response.text();
          let data: any = null;

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
                    // Ignore
                  }
                }
              }
            }
          }

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
                  // Ignore
                }
              }
            }
          }

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
                  '';
                const artist =
                  obj.ownerText?.runs?.[0]?.text ||
                  obj.shortBylineText?.runs?.[0]?.text ||
                  obj.longBylineText?.runs?.[0]?.text ||
                  'YouTube';
                const durationText = obj.lengthText?.simpleText || '';
                const thumbnail =
                  obj.thumbnail?.thumbnails?.[obj.thumbnail.thumbnails.length - 1]?.url ||
                  `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

                if (title) {
                  finalResults.push({
                    id: `yt_${vid}`,
                    videoId: vid,
                    title: title.trim(),
                    artist: artist.trim(),
                    sourceType: 'youtube',
                    url: `https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&enablejsapi=1`,
                    artworkUrl: thumbnail,
                    durationText,
                  });
                }
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

          if (finalResults.length === 0) {
            const vidRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
            let match;
            while ((match = vidRegex.exec(html)) !== null && finalResults.length < 25) {
              const vid = match[1];
              if (!seenVideoIds.has(vid)) {
                seenVideoIds.add(vid);
                finalResults.push({
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
      }

      // Filter and limit to top 35 clean results
      const validResults = finalResults.filter(
        (r) => r.videoId && typeof r.videoId === 'string' && r.videoId.length === 11
      ).slice(0, 35);

      if (validResults.length > 0) {
        searchCache.set(cacheKey, { time: Date.now(), results: validResults });
      }

      res.json({ results: validResults, query });
    } catch (err: unknown) {
      console.error('Error during search:', err);
      res.json({ results: [], query, error: 'Failed to complete search' });
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
