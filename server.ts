import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`YouTube response status: ${response.status}`);
      }

      const html = await response.text();
      let data: any = null;

      // Robust extraction of ytInitialData
      const marker = 'ytInitialData = ';
      let startIdx = html.indexOf(marker);
      if (startIdx !== -1) {
        startIdx += marker.length;
        const endIdx = html.indexOf(';</script>', startIdx);
        if (endIdx !== -1) {
          try {
            data = JSON.parse(html.substring(startIdx, endIdx));
          } catch (e) {
            console.warn('Direct slice parse failed, trying regex fallback:', e);
          }
        }
      }

      if (!data) {
        const altMatch = html.match(/ytInitialData\s*=\s*({.+?});\s*<\/script>/s);
        if (altMatch) {
          try {
            data = JSON.parse(altMatch[1]);
          } catch (e) {
            console.warn('Regex fallback parse failed:', e);
          }
        }
      }

      if (!data) {
        return res.json({ results: [] });
      }

      const sections =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

      const results: any[] = [];
      for (const section of sections) {
        const items = section?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          if (item.videoRenderer) {
            const v = item.videoRenderer;
            if (v.videoId) {
              const title =
                v.title?.runs?.[0]?.text || v.title?.simpleText || 'Video de YouTube';
              const artist =
                v.ownerText?.runs?.[0]?.text ||
                v.shortBylineText?.runs?.[0]?.text ||
                'YouTube';
              const durationText = v.lengthText?.simpleText || '';
              const thumbnail =
                v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
                `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

              results.push({
                id: `yt_${v.videoId}`,
                videoId: v.videoId,
                title,
                artist,
                sourceType: 'youtube',
                url: `https://www.youtube.com/embed/${v.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: thumbnail,
                durationText,
              });
            }
          }
        }
      }

      res.json({ results: results.slice(0, 30) });
    } catch (err: unknown) {
      console.error('Error during YouTube search:', err);
      res.status(500).json({ error: 'Failed to search YouTube' });
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
