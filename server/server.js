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

/**
 * Adapter for Web Standard fetch (used if Vercel or modern edge runtime invokes entrypoint as fetch handler)
 */
export async function handleWebStandardRequest(request) {
  let body = {};
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      body = {};
    }
  }

  const responseHeaders = new Headers();
  let responseStatusCode = 200;
  let responseBody = '';

  const mockReq = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body
  };

  const mockRes = {
    statusCode: 200,
    setHeader(key, value) {
      responseHeaders.set(key, value);
    },
    writeHead(code, headers) {
      responseStatusCode = code;
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          responseHeaders.set(k, v);
        }
      }
    },
    status(code) {
      responseStatusCode = code;
      return mockRes;
    },
    json(data) {
      responseHeaders.set('Content-Type', 'application/json');
      responseBody = JSON.stringify(data);
      return mockRes;
    },
    send(data) {
      if (typeof data === 'object') {
        responseHeaders.set('Content-Type', 'application/json');
        responseBody = JSON.stringify(data);
      } else {
        responseBody = String(data);
      }
      return mockRes;
    },
    end(data) {
      if (data) {
        responseBody = data;
      }
      return mockRes;
    }
  };

  await handleApiRequest(mockReq, mockRes);

  return new Response(responseBody, {
    status: mockRes.statusCode || responseStatusCode,
    headers: responseHeaders
  });
}

/**
 * Universal Request Handler (Vercel Serverless Function / Service Entrypoint)
 * Vercel invokes this default function with (req, res).
 */
export default async function handler(req, res) {
  // If invoked in Web Standard fetch environment (single argument Request, no res)
  if (req && typeof req.text === 'function' && !res) {
    return handleWebStandardRequest(req);
  }
  return handleApiRequest(req, res);
}

// Attach .fetch property for Web Standard fetch compatibility
handler.fetch = handleWebStandardRequest;

// HTTP verb exports for environments expecting method-based handlers
export async function GET(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}
export async function POST(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}
export async function PATCH(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}
export async function PUT(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}
export async function DELETE(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}
export async function OPTIONS(req, res) {
  return typeof req.text === 'function' && !res ? handleWebStandardRequest(req) : handleApiRequest(req, res);
}

// Start standalone HTTP server only when running in a standalone process (e.g. local dev, container)
// In Vercel serverless functions, VERCEL is defined and we don't start a separate port listener.
const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!isVercelServerless) {
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
}
