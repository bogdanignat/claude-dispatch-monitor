export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m}m${r}s` : `${m}m`
}

export function formatCost(usd: number | null | undefined): string {
  if (usd == null) return '—'
  return `$${usd.toFixed(2)}`
}

export function formatRelative(mtimeMs: number | null | undefined): string {
  if (!mtimeMs) return ''
  const diff = Date.now() - mtimeMs
  const s = Math.round(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(mtimeMs).toLocaleString()
}
