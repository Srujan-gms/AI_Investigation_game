import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 5001;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    // Delegate API routes to handleApiRequest
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/mystery/') ||
      pathname.startsWith('/session/') ||
      pathname.startsWith('/auth/')
    ) {
      return handleApiRequest(req, res);
    }

    // Handle static files in local environment
    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        filePath = path.join(ROOT_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          // Fallback to API handler if static file read fails
          return handleApiRequest(req, res);
        }

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      });
    });
  } catch (err) {
    console.error('[Server Caught Error]', err);
    return handleApiRequest(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🕵️  AI Mystery Room Server running on http://localhost:${PORT}`);
  console.log(`📁  Serving Web Client from: ${ROOT_DIR}`);
  console.log(`======================================================\n`);
});

export default server;
