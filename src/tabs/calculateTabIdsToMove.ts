export type SplitDirection = 'current-and-right' | 'current-and-left'

export type TabLike = {
  id?: number
  index: number
}

export function calculateTabIdsToMove(
  tabs: TabLike[],
  activeTabIndex: number,
  direction: SplitDirection,
): number[] {
  if (tabs.length < 2 || !tabs.some((tab) => tab.index === activeTabIndex)) {
    return []
  }

  const selectedTabs = tabs
    .filter((tab) =>
      direction === 'current-and-right' ? tab.index >= activeTabIndex : tab.index <= activeTabIndex,
    )
    .sort((firstTab, secondTab) => firstTab.index - secondTab.index)

  if (selectedTabs.length === tabs.length) {
    return []
  }

  return selectedTabs
    .map((tab) => tab.id)
    .filter((tabId): tabId is number => typeof tabId === 'number')
}
