import { cn } from '../lib/cn'
import type { DispatchStatus } from '../modules/Dispatches/types'

interface StatusChipProps {
  status: DispatchStatus
  className?: string
}

const STATUS_STYLES: Record<DispatchStatus, { label: string; classes: string; dot: boolean }> = {
  running: {
    label: 'RUNNING',
    classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/40',
    dot: true,
  },
  done: {
    label: 'DONE',
    classes: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    dot: false,
  },
  failed: {
    label: 'FAILED',
    classes: 'bg-rose-500/15 text-rose-300 border-rose-700/40',
    dot: false,
  },
  orphaned: {
    label: 'ORPHANED',
    classes: 'bg-amber-500/15 text-amber-300 border-amber-700/40',
    dot: false,
  },
}

export function StatusChip({ status, className }: StatusChipProps) {
  const style = STATUS_STYLES[status]
  return (
    <div className={cn('flex items-center gap-2 shrink-0', className)}>
      {style.dot && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-ring"
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          'text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border',
          style.classes,
        )}
      >
        {style.label}
      </span>
    </div>
  )
}
