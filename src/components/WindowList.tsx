import type { LoadState, SourceWindow } from '../types'
import { SourceWindowItem } from './SourceWindowItem'
import { StatusPanel } from './StatusPanel'

type WindowListProps = {
  loadState: LoadState
  sourceWindows: SourceWindow[]
  selectedWindowIds: Set<number>
  errorMessage?: string
  onReload: () => void
  onToggleWindow: (windowId: number) => void
}

export function WindowList({
  loadState,
  sourceWindows,
  selectedWindowIds,
  errorMessage,
  onReload,
  onToggleWindow,
}: WindowListProps) {
  if (loadState === 'loading') {
    return <StatusPanel message="Loading windows..." />
  }

  if (loadState === 'error') {
    return (
      <StatusPanel
        message={errorMessage ?? 'Unable to load windows.'}
        actionLabel="Retry"
        onAction={onReload}
      />
    )
  }

  if (sourceWindows.length === 0) {
    return <StatusPanel message="No background windows available to merge." />
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="space-y-2">
        {sourceWindows.map((sourceWindow) => (
          <SourceWindowItem
            key={sourceWindow.id}
            sourceWindow={sourceWindow}
            isSelected={selectedWindowIds.has(sourceWindow.id)}
            onToggle={() => onToggleWindow(sourceWindow.id)}
          />
        ))}
      </div>
    </section>
  )
}
