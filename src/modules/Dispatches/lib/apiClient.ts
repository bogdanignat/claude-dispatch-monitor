import type { DispatchesResponse, MarkdownContent } from '../types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`)
  return (await res.json()) as T
}

export async function fetchDispatches(): Promise<DispatchesResponse> {
  return getJson<DispatchesResponse>('/api/dispatches')
}

export async function fetchHandoff(slug: string): Promise<MarkdownContent | null> {
  const res = await fetch(`/api/handoff/${encodeURIComponent(slug)}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as MarkdownContent
}

export async function fetchBrief(stem: string): Promise<MarkdownContent | null> {
  const res = await fetch(`/api/brief/${encodeURIComponent(stem)}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as MarkdownContent
}
