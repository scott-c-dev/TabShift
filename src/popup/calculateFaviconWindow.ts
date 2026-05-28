export type FaviconTabLike = {
  index: number
}

export function calculateFaviconWindow<Tab extends FaviconTabLike>(
  tabs: Tab[],
  activeTabIndex: number,
  maxVisible = 5,
): Tab[] {
  if (maxVisible < 1 || !tabs.some((tab) => tab.index === activeTabIndex)) {
    return []
  }

  const sortedTabs = [...tabs].sort((firstTab, secondTab) => firstTab.index - secondTab.index)

  if (sortedTabs.length <= maxVisible) {
    return sortedTabs
  }

  const halfWindow = Math.floor(maxVisible / 2)
  const activePosition = sortedTabs.findIndex((tab) => tab.index === activeTabIndex)
  const maxStart = sortedTabs.length - maxVisible
  const start = Math.min(Math.max(activePosition - halfWindow, 0), maxStart)

  return sortedTabs.slice(start, start + maxVisible)
}
