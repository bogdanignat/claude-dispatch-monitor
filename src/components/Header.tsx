interface HeaderProps {
  liveCount: number
  totalCount: number
  lastUpdatedAt: number
  isFetching: boolean
  isMock: boolean
  onRefresh: () => void
}

function formatLastUpdated(ts: number): string {
  if (!ts) return 'never refreshed'
  return `last refresh ${new Date(ts).toLocaleTimeString()}`
}

export function Header({
  liveCount,
  totalCount,
  lastUpdatedAt,
  isFetching,
  isMock,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shrink-0">
            C
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight flex items-center gap-2">
              Claude Dispatch Monitor
              {isMock && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-700/40 bg-amber-500/15 text-amber-300 tracking-wider">
                  MOCK
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 leading-tight font-mono">
              {formatLastUpdated(lastUpdatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span className="text-emerald-400 font-semibold">{liveCount}</span> running ·{' '}
            <span className="font-semibold">{totalCount}</span> total
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
          >
            {isFetching ? 'refreshing…' : 'refresh'}
          </button>
        </div>
      </div>
    </header>
  )
}
