import { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateFaviconWindow } from './popup/calculateFaviconWindow'

type SourceWindow = chrome.windows.Window & {
  id: number
  tabs: chrome.tabs.Tab[]
}

type LoadState = 'loading' | 'ready' | 'error'

const hasMovableTabs = (window: chrome.windows.Window): window is SourceWindow =>
  typeof window.id === 'number' && (window.tabs ?? []).some((tab) => typeof tab.id === 'number')

const getActiveTab = (tabs: chrome.tabs.Tab[]) =>
  tabs.find((tab) => tab.active) ?? tabs.find((tab) => tab.index === 0)

function App() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [currentWindowId, setCurrentWindowId] = useState<number>()
  const [sourceWindows, setSourceWindows] = useState<SourceWindow[]>([])
  const [selectedWindowIds, setSelectedWindowIds] = useState<Set<number>>(() => new Set())
  const [isMerging, setIsMerging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const loadWindows = useCallback(async () => {
    try {
      setLoadState('loading')
      setErrorMessage(undefined)

      const currentWindow = await chrome.windows.getLastFocused({ populate: true })
      const allWindows = await chrome.windows.getAll({ populate: true })

      if (typeof currentWindow.id !== 'number') {
        throw new Error('Unable to identify the current window.')
      }

      const nextSourceWindows = allWindows
        .filter((window) => window.id !== currentWindow.id)
        .filter(hasMovableTabs)

      setCurrentWindowId(currentWindow.id)
      setSourceWindows(nextSourceWindows)
      setSelectedWindowIds(
        (previousSelectedWindowIds) =>
          new Set(
            [...previousSelectedWindowIds].filter((windowId) =>
              nextSourceWindows.some((window) => window.id === windowId),
            ),
          ),
      )
      setLoadState('ready')
    } catch (error) {
      setLoadState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load browser windows.')
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWindows()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadWindows])

  const selectedCount = selectedWindowIds.size
  const selectedWindows = useMemo(
    () => sourceWindows.filter((window) => selectedWindowIds.has(window.id)),
    [selectedWindowIds, sourceWindows],
  )

  const toggleWindowSelection = (windowId: number) => {
    setSelectedWindowIds((previousSelectedWindowIds) => {
      const nextSelectedWindowIds = new Set(previousSelectedWindowIds)

      if (nextSelectedWindowIds.has(windowId)) {
        nextSelectedWindowIds.delete(windowId)
      } else {
        nextSelectedWindowIds.add(windowId)
      }

      return nextSelectedWindowIds
    })
  }

  const mergeSelectedWindows = async () => {
    if (currentWindowId === undefined || selectedWindows.length === 0) {
      return
    }

    const tabIdsToMove = selectedWindows.flatMap((window) =>
      window.tabs.flatMap((tab) => (typeof tab.id === 'number' ? [tab.id] : [])),
    )

    if (tabIdsToMove.length === 0) {
      return
    }

    try {
      setIsMerging(true)
      setErrorMessage(undefined)
      await chrome.tabs.move(tabIdsToMove, {
        windowId: currentWindowId,
        index: -1,
      })
      window.close()
    } catch (error) {
      setIsMerging(false)
      setErrorMessage(error instanceof Error ? error.message : 'Unable to merge selected windows.')
      await loadWindows()
    }
  }

  return (
    <main className="flex h-[440px] w-[360px] flex-col bg-slate-950 text-slate-100">
      <PopupHeader />
      <WindowList
        loadState={loadState}
        sourceWindows={sourceWindows}
        selectedWindowIds={selectedWindowIds}
        errorMessage={errorMessage}
        onReload={loadWindows}
        onToggleWindow={toggleWindowSelection}
      />
      <StickyFooter
        isMerging={isMerging}
        selectedCount={selectedCount}
        onMerge={mergeSelectedWindows}
      />
    </main>
  )
}

function PopupHeader() {
  return (
    <header className="border-b border-slate-800 px-4 py-4">
      <h1 className="text-base font-semibold tracking-tight text-white">
        Gather tabs to current window
      </h1>
    </header>
  )
}

type WindowListProps = {
  loadState: LoadState
  sourceWindows: SourceWindow[]
  selectedWindowIds: Set<number>
  errorMessage?: string
  onReload: () => void
  onToggleWindow: (windowId: number) => void
}

function WindowList({
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

type StatusPanelProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

function StatusPanel({ message, actionLabel, onAction }: StatusPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-slate-400">{message}</p>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-900"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}

type SourceWindowItemProps = {
  sourceWindow: SourceWindow
  isSelected: boolean
  onToggle: () => void
}

function SourceWindowItem({ sourceWindow, isSelected, onToggle }: SourceWindowItemProps) {
  const activeTab = getActiveTab(sourceWindow.tabs)
  const title = activeTab?.title || 'Untitled window'

  return (
    <label
      className={[
        'flex cursor-pointer gap-3 rounded-lg border p-3 transition',
        isSelected
          ? 'border-blue-400 bg-blue-500/15 shadow-[0_0_0_1px_rgba(96,165,250,0.35)]'
          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700',
      ].join(' ')}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 accent-blue-500"
        checked={isSelected}
        onChange={onToggle}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-baseline gap-2">
          <span
            className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100"
            title={title}
          >
            {title}
          </span>
          <span className="shrink-0 text-xs text-slate-500">
            ({sourceWindow.tabs.length} {sourceWindow.tabs.length === 1 ? 'tab' : 'tabs'})
          </span>
        </div>
        <FaviconMatrix tabs={sourceWindow.tabs} activeTabIndex={activeTab?.index ?? -1} />
      </div>
    </label>
  )
}

type FaviconMatrixProps = {
  tabs: chrome.tabs.Tab[]
  activeTabIndex: number
}

function FaviconMatrix({ tabs, activeTabIndex }: FaviconMatrixProps) {
  const visibleTabs = calculateFaviconWindow(tabs, activeTabIndex)

  return (
    <div className="flex h-8 items-center gap-1.5">
      {visibleTabs.map((tab) => {
        const isActiveTab = tab.index === activeTabIndex

        return (
          <div
            key={`${tab.id ?? tab.index}-${tab.index}`}
            className={[
              'flex h-6 w-6 items-center justify-center rounded-md border bg-slate-950 text-[10px] font-semibold text-slate-500 transition',
              isActiveTab
                ? 'z-10 scale-125 border-blue-300 shadow-md shadow-blue-500/30'
                : 'border-slate-800',
            ].join(' ')}
            title={tab.title}
          >
            {tab.favIconUrl ? (
              <img src={tab.favIconUrl} alt="" className="h-4 w-4 rounded-sm" />
            ) : (
              <span>{getFallbackFaviconLabel(tab)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getFallbackFaviconLabel(tab: chrome.tabs.Tab) {
  return (tab.title?.trim().charAt(0) || '?').toUpperCase()
}

type StickyFooterProps = {
  selectedCount: number
  isMerging: boolean
  onMerge: () => void
}

function StickyFooter({ selectedCount, isMerging, onMerge }: StickyFooterProps) {
  const isDisabled = selectedCount === 0 || isMerging
  const buttonLabel =
    selectedCount === 0
      ? 'Select windows to merge'
      : selectedCount === 1
        ? 'Merge 1 window'
        : `Merge ${selectedCount} windows`

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 p-3">
      <button
        type="button"
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        disabled={isDisabled}
        onClick={onMerge}
      >
        {isMerging ? 'Merging...' : buttonLabel}
      </button>
    </footer>
  )
}

export default App
