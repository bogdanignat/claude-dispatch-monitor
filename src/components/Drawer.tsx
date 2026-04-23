import { useEffect, type ReactNode } from 'react'
import { cn } from '../lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
}

/**
 * Simple right-side drawer. Handles its own keyboard + backdrop close.
 * Does NOT focus-trap — intentional. Scope is local tool, not public form.
 */
export function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-20 transition-opacity',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-3xl bg-slate-900 border-l border-slate-800 overflow-hidden flex flex-col transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold truncate">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 font-mono truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none px-2"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">{children}</div>
      </aside>
    </div>
  )
}
