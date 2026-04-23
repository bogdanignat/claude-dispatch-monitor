import { DispatchCard } from './DispatchCard'
import type { Dispatch } from '../types'

interface DispatchListProps {
  dispatches: Dispatch[]
  isLoading: boolean
  error: unknown
  onOpen: (dispatch: Dispatch) => void
}

export function DispatchList({ dispatches, isLoading, error, onOpen }: DispatchListProps) {
  if (error) {
    return (
      <div className="text-center py-20 text-rose-400">
        <div className="font-semibold mb-1">Failed to load dispatches</div>
        <div className="text-xs text-slate-500 font-mono">
          {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    )
  }

  if (isLoading && !dispatches.length) {
    return <div className="text-center py-20 text-slate-500">Loading…</div>
  }

  if (!dispatches.length) {
    return (
      <div className="text-center py-20 text-slate-500">
        No dispatches found in <span className="font-mono">~/.claude/work/logs/</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dispatches.map((d) => (
        <DispatchCard key={d.log_name} dispatch={d} onOpen={onOpen} />
      ))}
    </div>
  )
}
