import { useQuery } from '@tanstack/react-query'
import { fetchDispatches } from '../lib/apiClient'

const REFETCH_INTERVAL = 5_000

export function useDispatches() {
  const query = useQuery({
    queryKey: ['dispatches'],
    queryFn: fetchDispatches,
    refetchInterval: REFETCH_INTERVAL,
  })

  const dispatches = query.data?.dispatches ?? []
  const liveCount = dispatches.filter((d) => d.status === 'running').length

  return {
    dispatches,
    liveCount,
    totalCount: dispatches.length,
    isMock: query.data?.mock ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    lastUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  }
}
