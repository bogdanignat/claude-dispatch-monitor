import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2_000,
      gcTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
