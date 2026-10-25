import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMystery, generateProceduralMystery, generateClueHint } from './services/aiService.js';
import { sanitizeMysteryForClient } from './utils/responseFilter.js';
import { connectDB, isDBConnected } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safely load environment variables from server/.env if present locally
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  } catch (e) {
    console.warn('[Env] Notice: .env file read skipped:', e.message);
  }
}

// Attempt MongoDB connection if MONGO_URI is set
connectDB().catch(() => {});

// Global In-Memory Data Store
const db = {
  users: new Map([
    ['user_detective_1', {
      id: 'user_detective_1',
      username: 'Detective Vance',
      email: 'detective.vance@agency.noir',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      solvedCases: [],
      hintTokens: 3
    }]
  ]),
  mysteries: new Map(),
  sessions: new Map(),
  generationTasks: new Map()
};

// Seed initial case using instant procedural generation (0ms cold start, no external API delay)
const seedMystery = generateProceduralMystery(
  "Professor Alistair Finch was discovered poisoned at his mahogany desk during the St. Jude's Annual Faculty Gala.",
  "Noir",
  "medium"
);
seedMystery.id = "case_initial_finch";
db.mysteries.set("case_initial_finch", seedMystery);
db.sessions.set("case_initial_finch", {
  id: "sess_initial_finch",
  mysteryId: "case_initial_finch",
  pinnedEvidence: [],
  notes: "",
  hintsUsed: 0,
  createdAt: new Date().toISOString()
});

// Helper to parse JSON request body
function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
  });
}

// Helper to send JSON responses
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.end(JSON.stringify(data));
}

/**
 * Main API request dispatcher (Used by both local server and Vercel serverless functions)
 */
export async function handleApiRequest(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = urlObj.pathname;
    const method = req.method;

    // Normalize path to always begin with /api/
    if (!pathname.startsWith('/api/')) {
      pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
    }

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        'Access-Control-Max-Age': '86400'
      });
      return res.end();
    }

    // GET /api/auth/me
    if (pathname === '/api/auth/me' && method === 'GET') {
      const defaultUser = db.users.get('user_detective_1');
      return sendJSON(res, 200, {
        user: defaultUser,
        isAuthenticated: true
      });
    }

    // POST /api/auth/login or /api/auth/google
    if ((pathname === '/api/auth/google' || pathname === '/api/auth/login') && (method === 'GET' || method === 'POST')) {
      const user = db.users.get('user_detective_1');
      return sendJSON(res, 200, {
        message: 'Authenticated successfully',
        user
      });
    }

    // POST /api/auth/logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      return sendJSON(res, 200, { message: 'Logged out successfully' });
    }

    // POST /api/mystery/generate — Trigger AI mystery generation
    if (pathname === '/api/mystery/generate' && method === 'POST') {
      const body = await parseBody(req);
      const prompt = body.prompt || 'A wealthy investor is found dead in his study during a high-stakes auction.';
      const genre = body.genre || 'Noir';
      const difficulty = body.difficulty || 'medium';

      const tempId = 'case_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

      // Register generation task
      db.generationTasks.set(tempId, {
        status: 'generating',
        startedAt: Date.now()
      });

      // Run generation in background
      (async () => {
        try {
          const mystery = await createMystery(prompt, genre, difficulty);
          mystery.id = tempId;
          db.mysteries.set(tempId, mystery);
          
          // Initialize default session
          db.sessions.set(tempId, {
            id: 'sess_' + tempId,
            mysteryId: tempId,
            pinnedEvidence: [],
            notes: '',
            hintsUsed: 0,
            verdict: null,
            isCorrect: null,
            score: null,
            createdAt: new Date().toISOString()
          });

          db.generationTasks.set(tempId, {
            status: 'ready',
            mysteryId: tempId
          });
        } catch (err) {
          console.error('[Generation Error]', err);
          db.generationTasks.set(tempId, {
            status: 'failed',
            error: err.message
          });
        }
      })();

      return sendJSON(res, 202, {
        mysteryId: tempId,
        status: 'generating',
        pollUrl: `/api/mystery/${tempId}/status`
      });
    }

    // GET /api/mystery/:id/status — Poll generation status
    const statusMatch = pathname.match(/^\/api\/mystery\/([^/]+)\/status$/);
    if (statusMatch && method === 'GET') {
      const mysteryId = statusMatch[1];
      const task = db.generationTasks.get(mysteryId);
      if (!task) {
        if (db.mysteries.has(mysteryId)) {
          return sendJSON(res, 200, { status: 'ready', mysteryId });
        }
        return sendJSON(res, 404, { error: 'Mystery generation task not found' });
      }
      return sendJSON(res, 200, task);
    }

    // GET /api/mystery/history — Get user case history
    if (pathname === '/api/mystery/history' && method === 'GET') {
      const historyList = Array.from(db.mysteries.values()).map(m => {
        const sess = db.sessions.get(m.id) || {};
        return {
          id: m.id,
          title: m.title,
          genre: m.genre,
          difficulty: m.difficulty,
          caseBrief: m.caseBrief ? m.caseBrief.slice(0, 140) + '...' : '',
          createdAt: m.createdAt,
          isSolved: sess.isCorrect === true,
          score: sess.score || 0
        };
      });
      return sendJSON(res, 200, { cases: historyList });
    }

    // GET /api/mystery/:id — Get sanitized mystery
    const mysteryMatch = pathname.match(/^\/api\/mystery\/([^/]+)$/);
    if (mysteryMatch && method === 'GET' && mysteryMatch[1] !== 'history') {
      const mysteryId = mysteryMatch[1];
      let mystery = db.mysteries.get(mysteryId);

      // If not found in cache, generate one procedurally
      if (!mystery) {
        mystery = generateProceduralMystery('Default Investigation Dossier', 'Noir', 'medium');
        mystery.id = mysteryId;
        db.mysteries.set(mysteryId, mystery);
        db.sessions.set(mysteryId, {
          id: 'sess_' + mysteryId,
          mysteryId,
          pinnedEvidence: [],
          notes: '',
          hintsUsed: 0,
          createdAt: new Date().toISOString()
        });
      }

      const safeMystery = sanitizeMysteryForClient(mystery);
      return sendJSON(res, 200, safeMystery);
    }

    // POST /api/mystery/:id/verdict — Submit accusation & get verdict
    const verdictMatch = pathname.match(/^\/api\/mystery\/([^/]+)\/verdict$/);
    if (verdictMatch && method === 'POST') {
      const mysteryId = verdictMatch[1];
      const mystery = db.mysteries.get(mysteryId);
      if (!mystery) {
        return sendJSON(res, 404, { error: 'Mystery not found' });
      }

      const body = await parseBody(req);
      const accusedId = body.suspectId;
      const isCorrect = (accusedId === mystery.culpritId);

      const session = db.sessions.get(mysteryId) || { hintsUsed: 0 };
      const hintsUsed = session.hintsUsed || 0;
      const score = isCorrect ? Math.max(100 - (hintsUsed * 10), 10) : 0;

      session.verdict = accusedId;
      session.isCorrect = isCorrect;
      session.score = score;
      session.completedAt = new Date().toISOString();
      db.sessions.set(mysteryId, session);

      // Update user record if correct
      const user = db.users.get('user_detective_1');
      if (user && isCorrect && !user.solvedCases.includes(mysteryId)) {
        user.solvedCases.push(mysteryId);
      }

      const culprit = mystery.suspects.find(s => s.id === mystery.culpritId);

      return sendJSON(res, 200, {
        isCorrect,
        culpritId: mystery.culpritId,
        culpritName: culprit ? culprit.name : 'Unknown Culprit',
        culpritRole: culprit ? culprit.role : '',
        culpritPhoto: culprit ? culprit.photoUrl : '',
        motive: mystery.motive,
        explanation: mystery.explanation,
        score,
        hintsUsed
      });
    }

    // GET /api/session/:mysteryId
    const sessionGetMatch = pathname.match(/^\/api\/session\/([^/]+)$/);
    if (sessionGetMatch && method === 'GET') {
      const mysteryId = sessionGetMatch[1];
      let session = db.sessions.get(mysteryId);
      if (!session) {
        session = {
          id: 'sess_' + mysteryId,
          mysteryId,
          pinnedEvidence: [],
          notes: '',
          hintsUsed: 0,
          createdAt: new Date().toISOString()
        };
        db.sessions.set(mysteryId, session);
      }
      return sendJSON(res, 200, session);
    }

    // PATCH /api/session/:mysteryId
    if (sessionGetMatch && method === 'PATCH') {
      const mysteryId = sessionGetMatch[1];
      const session = db.sessions.get(mysteryId) || {
        id: 'sess_' + mysteryId,
        mysteryId,
        pinnedEvidence: [],
        notes: '',
        hintsUsed: 0,
        createdAt: new Date().toISOString()
      };

      const body = await parseBody(req);
      if (Array.isArray(body.pinnedEvidence)) {
        session.pinnedEvidence = body.pinnedEvidence;
      }
      if (typeof body.notes === 'string') {
        session.notes = body.notes;
      }
      db.sessions.set(mysteryId, session);
      return sendJSON(res, 200, session);
    }

    // POST /api/session/:mysteryId/hint
    const hintMatch = pathname.match(/^\/api\/session\/([^/]+)\/hint$/);
    if (hintMatch && method === 'POST') {
      const mysteryId = hintMatch[1];
      const mystery = db.mysteries.get(mysteryId);
      if (!mystery) {
        return sendJSON(res, 404, { error: 'Mystery not found' });
      }

      const session = db.sessions.get(mysteryId) || {
        id: 'sess_' + mysteryId,
        mysteryId,
        pinnedEvidence: [],
        notes: '',
        hintsUsed: 0
      };

      if (session.hintsUsed >= 3) {
        return sendJSON(res, 400, { error: 'No hint tokens remaining for this investigation.' });
      }

      const hintText = await generateClueHint(mystery, session.hintsUsed);
      session.hintsUsed = (session.hintsUsed || 0) + 1;
      db.sessions.set(mysteryId, session);

      return sendJSON(res, 200, {
        hint: hintText,
        hintsUsed: session.hintsUsed,
        remainingTokens: 3 - session.hintsUsed
      });
    }

    // If no API route matched
    return sendJSON(res, 404, { error: `Endpoint ${method} ${pathname} not found` });
  } catch (error) {
    console.error('[API Server Error]', error);
    return sendJSON(res, 500, {
      error: error.message || 'Internal Server Error'
    });
  }
}
