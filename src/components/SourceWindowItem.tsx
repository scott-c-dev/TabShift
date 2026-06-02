import type { SourceWindow } from '../types'
import { FaviconMatrix } from './FaviconMatrix'

type SourceWindowItemProps = {
  sourceWindow: SourceWindow
  isSelected: boolean
  onToggle: () => void
}

const getActiveTab = (tabs: chrome.tabs.Tab[]) =>
  tabs.find((tab) => tab.active) ?? tabs.find((tab) => tab.index === 0)

export function SourceWindowItem({ sourceWindow, isSelected, onToggle }: SourceWindowItemProps) {
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
