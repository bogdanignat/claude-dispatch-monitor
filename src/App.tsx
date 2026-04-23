import { useState } from 'react'
import { Header } from './components/Header'
import { DispatchDrawer, DispatchList, useDispatches } from './modules/Dispatches'
import type { Dispatch } from './modules/Dispatches'

export function App() {
  const [selected, setSelected] = useState<Dispatch | null>(null)
  const {
    dispatches,
    liveCount,
    totalCount,
    isMock,
    isLoading,
    isFetching,
    error,
    lastUpdatedAt,
    refetch,
  } = useDispatches()

  return (
    <>
      <Header
        liveCount={liveCount}
        totalCount={totalCount}
        lastUpdatedAt={lastUpdatedAt}
        isFetching={isFetching}
        isMock={isMock}
        onRefresh={() => refetch()}
      />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <DispatchList
          dispatches={dispatches}
          isLoading={isLoading}
          error={error}
          onOpen={setSelected}
        />
      </main>
      <DispatchDrawer dispatch={selected} onClose={() => setSelected(null)} />
    </>
  )
}
