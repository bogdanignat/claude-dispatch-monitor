import { useQuery } from '@tanstack/react-query'
import { fetchBrief, fetchHandoff } from '../lib/apiClient'

export function useHandoff(slug: string | null) {
  return useQuery({
    queryKey: ['handoff', slug],
    queryFn: () => fetchHandoff(slug as string),
    enabled: !!slug,
    staleTime: 10_000,
  })
}

export function useBrief(stem: string | null) {
  return useQuery({
    queryKey: ['brief', stem],
    queryFn: () => fetchBrief(stem as string),
    enabled: !!stem,
    staleTime: 10_000,
  })
}
