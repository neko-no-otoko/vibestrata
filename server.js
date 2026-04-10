import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';

const port = process.env.PORT || 3000;
const base = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = req.url === '/' ? '/public/index.html' : req.url;
    if (urlPath === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, service: 'vibestrata', timestamp: new Date().toISOString() }));
      return;
    }

    const safePath = normalize(urlPath).replace(/^\/+/, '');
    const filePath = join(base, safePath);
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`VibeStrata running at http://localhost:${port}`);
});
