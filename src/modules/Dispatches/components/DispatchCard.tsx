import { StatusChip } from '../../../components/StatusChip'
import { cn } from '../../../lib/cn'
import { formatCost, formatDuration, formatRelative } from '../../../lib/format'
import type { Dispatch } from '../types'

interface DispatchCardProps {
  dispatch: Dispatch
  onOpen: (dispatch: Dispatch) => void
}

interface StatProps {
  label: string
  value: string | number
}

function Stat({ label, value }: StatProps) {
  return (
    <div>
      <div className="text-slate-500 text-[10px] uppercase">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

export function DispatchCard({ dispatch, onOpen }: DispatchCardProps) {
  const d = dispatch
  const turns = d.num_turns ?? d.tool_calls ?? '—'
  const lastToolName = d.last_tool_call?.name ?? '—'
  const lastMsg = d.last_assistant_text
    ? d.last_assistant_text.length > 200
      ? `${d.last_assistant_text.slice(0, 200)}…`
      : d.last_assistant_text
    : null

  return (
    <button
      type="button"
      onClick={() => onOpen(d)}
      className={cn(
        'text-left rounded-lg border border-slate-800 bg-slate-900/50',
        'hover:border-slate-700 transition cursor-pointer overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      )}
    >
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase truncate">
              {d.project}
            </span>
            {d.handoff_path && (
              <span className="text-[10px] text-emerald-400 shrink-0">· handoff</span>
            )}
          </div>
          <h3 className="font-medium text-sm truncate" title={d.slug}>
            {d.slug}
          </h3>
        </div>
        <StatusChip status={d.status} />
      </header>

      <div className="px-4 py-3 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Turns" value={turns} />
        <Stat label="Duration" value={formatDuration(d.duration_ms)} />
        <Stat label="Cost" value={formatCost(d.cost_usd)} />
      </div>

      <div className="px-4 py-3 border-t border-slate-800 text-xs space-y-2">
        <div>
          <div className="text-slate-500 text-[10px] uppercase mb-0.5">Last tool</div>
          <div className="font-mono truncate text-slate-300">{lastToolName}</div>
        </div>
        {lastMsg && (
          <div>
            <div className="text-slate-500 text-[10px] uppercase mb-0.5">Last message</div>
            <div className="text-slate-400 line-clamp-3">{lastMsg}</div>
          </div>
        )}
      </div>

      <footer className="px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span>{formatRelative(d.log_mtime)}</span>
        {d.permission_denials > 0 && (
          <span className="text-rose-400">
            {d.permission_denials} denial{d.permission_denials === 1 ? '' : 's'}
          </span>
        )}
      </footer>
    </button>
  )
}
