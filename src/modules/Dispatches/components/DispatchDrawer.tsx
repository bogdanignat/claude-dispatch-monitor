import { useState } from 'react'
import { Drawer } from '../../../components/Drawer'
import { cn } from '../../../lib/cn'
import { useBrief, useHandoff } from '../hooks'
import type { Dispatch } from '../types'

type TabName = 'handoff' | 'brief' | 'meta'

const TABS: { name: TabName; label: string }[] = [
  { name: 'handoff', label: 'Handoff' },
  { name: 'brief', label: 'Brief' },
  { name: 'meta', label: 'Meta' },
]

interface DispatchDrawerProps {
  dispatch: Dispatch | null
  onClose: () => void
}

export function DispatchDrawer({ dispatch, onClose }: DispatchDrawerProps) {
  const [tab, setTab] = useState<TabName>('handoff')

  const handoffQuery = useHandoff(tab === 'handoff' && dispatch ? dispatch.slug : null)
  const briefQuery = useBrief(tab === 'brief' && dispatch ? dispatch.stem : null)

  const open = !!dispatch

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={dispatch?.slug ?? ''}
      subtitle={dispatch?.stem ?? ''}
    >
      <div className="border-b border-slate-800 px-6 py-2 flex gap-4 text-xs">
        {TABS.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setTab(t.name)}
            className={cn(
              'pb-1 border-b-2 transition-colors',
              tab === t.name
                ? 'border-indigo-500 font-medium'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 font-mono text-xs whitespace-pre-wrap">
        {tab === 'handoff' && (
          <DrawerBody
            isLoading={handoffQuery.isLoading}
            error={handoffQuery.error}
            data={handoffQuery.data}
            emptyMessage="No handoff yet — child still running or never wrote one."
          />
        )}
        {tab === 'brief' && (
          <DrawerBody
            isLoading={briefQuery.isLoading}
            error={briefQuery.error}
            data={briefQuery.data}
            emptyMessage="No brief found."
          />
        )}
        {tab === 'meta' && dispatch && (
          <pre className="font-mono text-xs whitespace-pre-wrap text-slate-300">
            {JSON.stringify(dispatch, null, 2)}
          </pre>
        )}
      </div>
    </Drawer>
  )
}

interface DrawerBodyProps {
  isLoading: boolean
  error: unknown
  data: { path: string; content: string } | null | undefined
  emptyMessage: string
}

function DrawerBody({ isLoading, error, data, emptyMessage }: DrawerBodyProps) {
  if (isLoading) return <div className="text-slate-500">Loading…</div>
  if (error) {
    return (
      <div className="text-rose-400">
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }
  if (!data) return <div className="text-slate-500">{emptyMessage}</div>
  return (
    <>
      <div className="text-slate-500 mb-4 truncate">{data.path}</div>
      <div className="text-slate-200">{data.content}</div>
    </>
  )
}
