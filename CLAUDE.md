# CLAUDE.md — agent notes for this repo

This repo works with **stock Claude Code**. No custom skills, plugins, MCP
servers, additions to the global `~/.claude/CLAUDE.md`, or wiki pages are
required. Everything you need is in this file and the README.

## Read first

- [`README.md`](./README.md) — what the app is, how a user runs it, the file
  formats it expects. Start here for any task that touches the UI or the
  public surface.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind + TanStack Query
- **Backend:** Node 20 stdlib HTTP server, zero runtime deps
- **Tests:** Vitest (parser only)

## Conventions

- **Zero runtime deps on the server.** `server/**/*.mjs` must not `import`
  anything outside `node:*` and local files. Keep the backend installable
  with only devDependencies doing the heavy lifting — no `express`, `fastify`,
  `chokidar`, etc. If a server feature seems to need a package, try stdlib
  first and ask before adding a runtime dep.
- **Read-only backend.** The server never writes to disk or mutates state.
  No `POST`, no config endpoints. Reads only.
- **React module layout** under `src/modules/<ModuleName>/{components,hooks,lib,types}`.
  One module today (`Dispatches`). Grow by adding modules, not by fattening
  this one.
- **API client is a singleton module** (`src/modules/Dispatches/lib/apiClient.ts`).
  Never build a fetch wrapper inside a hook — a new instance per render
  breaks TanStack Query caching.
- **Data fetching is TanStack Query.** No `useEffect` + `fetch` + `useState`
  for server state.
- **Mock fallback is first-class.** When `LOGS_DIR` is missing or
  `USE_MOCK=1`, `server/lib/mock.mjs` powers the UI. Anything new added to
  the real code path must have a plausible mock equivalent so a fresh clone
  still renders every code path.
- **Shell helpers stay shell.** `scripts/*.sh` are intentionally bash — don't
  rewrite in Node. Keep them POSIX-ish and idempotent.

## Security notes

- Filename stems used in filesystem paths are validated against
  `^[A-Za-z0-9._-]+$` (see `SAFE_STEM` in `server/lib/parser.mjs`). Keep that
  invariant — any new endpoint that interpolates a user-provided string into
  a path must go through the same check.
- `serveStatic` strips `..` from pathnames before joining — don't remove.
- No CORS, no auth. This is a localhost tool. If you find yourself wanting to
  expose it over the network, that's a scope change worth discussing first.

## Common tasks

### Add a new field to the dispatch card

The data flows `parser → API → type → hook → component`. Touch all five:

1. `src/modules/Dispatches/types/dispatch.ts` — extend the `Dispatch` interface.
2. `server/lib/parser.mjs` — populate the new field in `parseLog()`.
3. `server/lib/mock.mjs` — add a realistic value to each mock dispatch.
4. `src/modules/Dispatches/components/DispatchCard.tsx` — render it.
5. `server/lib/parser.test.mjs` — add a test if the parsing is non-trivial.

### Add a new API endpoint

1. `server/server.mjs` — add a `pathname === '/api/...'` branch.
2. `src/modules/Dispatches/lib/apiClient.ts` — typed fetcher.
3. `src/modules/Dispatches/hooks/` — wrap with `useQuery` (or `useMutation`
   if you're breaking the read-only rule, which you shouldn't be).

### Change the dispatch filename format

Update both parser and script:

1. `server/lib/parser.mjs` — `parseSlugFromLogName` regex.
2. `server/lib/parser.test.mjs` — update cases, add the new format.
3. `scripts/dispatch.sh` — match the new stem.
4. `README.md` — update the **File format** section.

## Dev loop

```bash
npm run dev         # concurrently runs vite (5173) + node --watch (3939)
npm run typecheck   # tsc -b --noEmit
npm test            # vitest run
npm run build       # tsc -b && vite build → dist/
npm start           # NODE_ENV=production node server/server.mjs (serves dist/)
```

## Pre-PR checklist

1. `npm run typecheck` — no errors
2. `npm test` — all tests pass
3. `npm run build` — clean build
4. If parser behaviour changed, add or update a case in
   `server/lib/parser.test.mjs`
5. If a new field / endpoint was added, confirm the mock data covers it so
   `USE_MOCK=1 npm run dev` still shows every feature

## Non-goals

- **Controlling dispatches** (starting / stopping `claude -p`). This is a
  viewer, not a controller.
- **Multi-user / auth.** Single local process.
- **Hosted deployment.** All data lives on the machine running the server.
