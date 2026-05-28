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
  // Moving every tab into a new window is a no-op from the user's perspective.
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

  // Chrome can omit tab IDs in some contexts, so only return tabs that can be moved.
  return selectedTabs
    .map((tab) => tab.id)
    .filter((tabId): tabId is number => typeof tabId === 'number')
}
