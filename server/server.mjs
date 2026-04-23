import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  listDispatches,
  listLiveProcesses,
  readHandoff,
  readBrief,
  clearHandoffCache,
  LOGS_DIR,
} from './lib/parser.mjs'
import { MOCK_DISPATCHES, MOCK_HANDOFF, MOCK_BRIEF } from './lib/mock.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(__dirname)
const DIST_DIR = join(ROOT, 'dist')
const PORT = Number(process.env.PORT ?? 3939)
const IS_PROD = process.env.NODE_ENV === 'production'
const FORCE_MOCK = process.env.USE_MOCK === '1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

async function isMockMode() {
  if (FORCE_MOCK) return true
  try {
    await stat(LOGS_DIR)
    return false
  } catch {
    return true
  }
}

async function serveStatic(req, res, pathname) {
  if (!IS_PROD) {
    // In dev Vite serves the frontend. This branch only runs when someone
    // hits the bare server on :3939.
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('In dev mode the frontend is served by Vite on :5173.')
    return
  }

  const safe = pathname.replace(/^\/+/, '').replace(/\.\./g, '') || 'index.html'
  const filePath = join(DIST_DIR, safe)
  try {
    const data = await readFile(filePath)
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(data)
  } catch {
    // SPA fallback — unknown path → serve index.html so the client router wins.
    try {
      const fallback = await readFile(join(DIST_DIR, 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' })
      res.end(fallback)
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const { pathname } = url
    const mockMode = await isMockMode()

    if (pathname === '/api/dispatches') {
      clearHandoffCache()
      const dispatches = mockMode ? MOCK_DISPATCHES : await listDispatches()
      return sendJson(res, 200, { dispatches, mock: mockMode })
    }

    if (pathname === '/api/processes') {
      const processes = mockMode ? [] : await listLiveProcesses()
      return sendJson(res, 200, { processes, mock: mockMode })
    }

    if (pathname.startsWith('/api/handoff/')) {
      const slug = decodeURIComponent(pathname.slice('/api/handoff/'.length))
      const data = mockMode ? MOCK_HANDOFF : await readHandoff(slug)
      if (!data) return sendJson(res, 404, { error: 'Handoff not found' })
      return sendJson(res, 200, data)
    }

    if (pathname.startsWith('/api/brief/')) {
      const stem = decodeURIComponent(pathname.slice('/api/brief/'.length))
      const data = mockMode ? MOCK_BRIEF : await readBrief(stem)
      if (!data) return sendJson(res, 404, { error: 'Brief not found' })
      return sendJson(res, 200, data)
    }

    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: 'Unknown API endpoint' })
    }

    return serveStatic(req, res, pathname)
  } catch (err) {
    console.error('Server error:', err)
    sendJson(res, 500, { error: err.message })
  }
})

server.listen(PORT, () => {
  const mode = IS_PROD ? 'production' : 'dev (API-only)'
  console.log(`claude-dispatch-monitor [${mode}] → http://localhost:${PORT}`)
  if (FORCE_MOCK) console.log('  └─ USE_MOCK=1 — serving fixture data')
})
