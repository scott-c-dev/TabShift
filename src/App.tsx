import { useCallback, useEffect, useMemo, useState } from 'react'
import { PopupHeader } from './components/PopupHeader'
import { StickyFooter } from './components/StickyFooter'
import { WindowList } from './components/WindowList'
import type { LoadState, SourceWindow } from './types'

const hasMovableTabs = (window: chrome.windows.Window): window is SourceWindow =>
  typeof window.id === 'number' && (window.tabs ?? []).some((tab) => typeof tab.id === 'number')

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

export default App
