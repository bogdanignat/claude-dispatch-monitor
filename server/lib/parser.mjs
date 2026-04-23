import { readFile, readdir, stat, readlink, access } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { homedir } from 'node:os'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCb)

export const LOGS_DIR = process.env.LOGS_DIR ?? join(homedir(), '.claude', 'work', 'logs')
export const BRIEFS_DIR = process.env.BRIEFS_DIR ?? join(homedir(), '.claude', 'work', 'briefs')
export const DEV_ROOT = process.env.DEV_ROOT ?? join(homedir(), 'development')

// Matches safe filename stems — no traversal, no absolute paths.
const SAFE_STEM = /^[A-Za-z0-9._-]+$/

/**
 * Parse a log filename of the form:
 *   <project>-<YYYYMMDD>-[<HHmm>-]<slug>.log
 *
 * Project names may contain hyphens (e.g. `claude-dispatch-monitor`), so we
 * anchor on the 8-digit date rather than splitting on "-".
 */
export function parseSlugFromLogName(name) {
  const stem = name.replace(/\.log$/, '')
  const match = stem.match(/^(.+?)-(\d{8})-(?:(\d{4})-)?(.+)$/)
  if (!match) return { project: 'unknown', slug: stem, date: null, stem }
  const [, project, date, , slug] = match
  return { project, slug, date, stem }
}

async function pidCwd(pid) {
  try {
    return await readlink(`/proc/${pid}/cwd`)
  } catch {
    return null
  }
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Lazy-populated map: slug → absolute handoff path.
 * Scanned once per request via clearHandoffCache() in the HTTP handler.
 */
const handoffCache = new Map()

async function populateHandoffCache() {
  if (handoffCache.size) return
  let entries
  try {
    entries = await readdir(DEV_ROOT, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const handoffDir = join(DEV_ROOT, entry.name, '.claude-handoffs')
    let files
    try {
      files = await readdir(handoffDir)
    } catch {
      continue
    }
    for (const f of files) {
      if (!f.endsWith('.md')) continue
      const slug = f.slice(0, -3)
      handoffCache.set(slug, join(handoffDir, f))
    }
  }
}

export function clearHandoffCache() {
  handoffCache.clear()
}

async function findHandoff(slug) {
  if (!SAFE_STEM.test(slug)) return null
  await populateHandoffCache()
  return handoffCache.get(slug) ?? null
}

async function readLines(path) {
  const buf = await readFile(path, 'utf8')
  return buf.split('\n').filter(Boolean)
}

export async function parseLog(path) {
  let lines
  try {
    lines = await readLines(path)
  } catch (err) {
    return { error: `Failed to read log: ${err.message}` }
  }

  let result = null
  let firstAssistantTs = null
  let lastAssistantTs = null
  let toolCallCount = 0
  let lastToolCall = null
  let lastAssistantText = null
  let denials = 0
  let initEvent = null
  let eventsCount = 0

  for (const line of lines) {
    let ev
    try {
      ev = JSON.parse(line)
    } catch {
      continue
    }
    eventsCount++

    if (ev.type === 'system' && ev.subtype === 'init') initEvent = ev

    if (ev.type === 'assistant') {
      const ts = Date.parse(ev.timestamp ?? '') || Date.now()
      if (!firstAssistantTs) firstAssistantTs = ts
      lastAssistantTs = ts

      const content = ev.message?.content ?? []
      for (const block of content) {
        if (block.type === 'tool_use') {
          toolCallCount++
          lastToolCall = { name: block.name, id: block.id }
        } else if (block.type === 'text' && block.text?.trim()) {
          lastAssistantText = block.text.trim().slice(0, 400)
        }
      }
    }

    if (ev.type === 'result') {
      result = ev
      denials = (ev.permission_denials ?? []).length
    }
  }

  const stats = await stat(path)

  return {
    events_count: eventsCount,
    init: initEvent,
    result,
    is_complete: !!result,
    is_error: result?.is_error ?? false,
    duration_ms:
      result?.duration_ms ??
      (firstAssistantTs && lastAssistantTs ? lastAssistantTs - firstAssistantTs : null),
    num_turns: result?.num_turns ?? null,
    cost_usd: result?.total_cost_usd ?? null,
    tool_calls: toolCallCount,
    last_tool_call: lastToolCall,
    last_assistant_text: lastAssistantText,
    permission_denials: denials,
    log_size_bytes: stats.size,
    log_mtime: stats.mtimeMs,
  }
}

export async function listLiveProcesses() {
  try {
    const { stdout } = await execFile('pgrep', ['-af', 'claude -p'])
    const procs = []
    for (const line of stdout.split('\n').filter(Boolean)) {
      const m = line.match(/^(\d+)\s+(.*)$/)
      if (!m) continue
      const [, pidStr, cmd] = m
      const pid = Number(pidStr)
      const briefMatch = cmd.match(/work\/briefs\/([^"\s]+)\.md/)
      const stem = briefMatch ? briefMatch[1] : null
      const cwd = await pidCwd(pid)
      const devPrefix = DEV_ROOT + '/'
      const project =
        cwd && cwd.startsWith(devPrefix) ? cwd.slice(devPrefix.length).split('/')[0] : null
      procs.push({ pid, cmd, stem, cwd, project })
    }
    return procs
  } catch {
    return []
  }
}

export async function listDispatches() {
  if (!(await pathExists(LOGS_DIR))) return []

  let names
  try {
    names = await readdir(LOGS_DIR)
  } catch {
    return []
  }
  const logs = names.filter((n) => n.endsWith('.log'))

  const live = await listLiveProcesses()
  const liveStems = new Set(live.map((p) => p.stem).filter(Boolean))
  const hasAnyLive = live.length > 0

  const dispatches = []
  for (const name of logs) {
    const path = join(LOGS_DIR, name)
    const meta = parseSlugFromLogName(name)
    const summary = await parseLog(path)
    const handoffPath = await findHandoff(meta.slug)

    // Liveness: either the brief stem matches a live claude -p process,
    // or any claude -p is running and this log was written in the last 30s.
    // The mtime fallback covers shared briefs that dispatch to multiple projects.
    const stemMatch = liveStems.has(meta.stem)
    const recentMs = Date.now() - (summary.log_mtime ?? 0)
    const recentlyWriting = hasAnyLive && recentMs < 30_000
    const isAlive = stemMatch || (recentlyWriting && !summary.is_complete)

    let status
    if (isAlive) status = 'running'
    else if (!summary.is_complete) status = 'orphaned'
    else if (summary.is_error) status = 'failed'
    else status = 'done'

    dispatches.push({
      ...meta,
      log_name: name,
      log_path: path,
      handoff_path: handoffPath,
      status,
      ...summary,
    })
  }

  dispatches.sort((a, b) => (b.log_mtime ?? 0) - (a.log_mtime ?? 0))
  return dispatches
}

export async function readHandoff(slug) {
  if (!SAFE_STEM.test(slug)) return null
  const path = await findHandoff(slug)
  if (!path) return null
  try {
    const content = await readFile(path, 'utf8')
    return { path, content }
  } catch {
    return null
  }
}

export async function readBrief(stem) {
  if (!SAFE_STEM.test(stem)) return null
  const path = join(BRIEFS_DIR, `${stem}.md`)
  // Belt-and-braces: make sure resolved path is still inside BRIEFS_DIR.
  if (basename(path) !== `${stem}.md`) return null
  try {
    const content = await readFile(path, 'utf8')
    return { path, content }
  } catch {
    return null
  }
}
