import { calculateFaviconWindow } from '../popup/calculateFaviconWindow'

type FaviconMatrixProps = {
  tabs: chrome.tabs.Tab[]
  activeTabIndex: number
}

export function FaviconMatrix({ tabs, activeTabIndex }: FaviconMatrixProps) {
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
