import { COMMAND_CURRENT_AND_LEFT, COMMAND_CURRENT_AND_RIGHT } from './constants'
import { calculateTabIdsToMove, type SplitDirection } from './tabs/calculateTabIdsToMove'
import { debounce } from './utils/debounce'

const MENU_ITEMS: Record<SplitDirection, chrome.contextMenus.CreateProperties> = {
  [COMMAND_CURRENT_AND_RIGHT]: {
    id: COMMAND_CURRENT_AND_RIGHT,
    title: '➡️ Move this && right tabs to new window',
    contexts: ['all'],
  },
  [COMMAND_CURRENT_AND_LEFT]: {
    id: COMMAND_CURRENT_AND_LEFT,
    title: '⬅️ Move this && left tabs to new window',
    contexts: ['all'],
  },
}

const isSplitDirection = (menuItemId: chrome.contextMenus.OnClickData['menuItemId']) =>
  menuItemId === COMMAND_CURRENT_AND_RIGHT || menuItemId === COMMAND_CURRENT_AND_LEFT

async function getActiveWindowTabs() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  if (activeTab?.windowId === undefined) {
    return undefined
  }

  const tabs = await chrome.tabs.query({ windowId: activeTab.windowId })

  return {
    activeTab,
    tabs,
  }
}

async function updateContextMenuState() {
  const activeWindowTabs = await getActiveWindowTabs()

  if (!activeWindowTabs) {
    await Promise.all(
      Object.keys(MENU_ITEMS).map((direction) =>
        chrome.contextMenus.update(direction, { enabled: false }),
      ),
    )
    return
  }

  const { activeTab, tabs } = activeWindowTabs

  // Use the same pure calculation for menu validity and click handling.
  await Promise.all(
    Object.keys(MENU_ITEMS).map((direction) =>
      chrome.contextMenus.update(direction, {
        enabled:
          calculateTabIdsToMove(tabs, activeTab.index, direction as SplitDirection).length > 0,
      }),
    ),
  )
}

const updateContextMenuStateDebounced = debounce(() => {
  void updateContextMenuState()
}, 200)

async function createContextMenus() {
  await chrome.contextMenus.removeAll()

  Object.values(MENU_ITEMS).forEach((menuItem) => {
    chrome.contextMenus.create(menuItem)
  })

  await updateContextMenuState()
}

async function splitTabs(direction: SplitDirection) {
  try {
    const activeWindowTabs = await getActiveWindowTabs()

    if (!activeWindowTabs) {
      return
    }

    const activeTabId = activeWindowTabs.activeTab.id
    const tabIdsToMove = calculateTabIdsToMove(
      activeWindowTabs.tabs,
      activeWindowTabs.activeTab.index,
      direction,
    )

    if (activeTabId === undefined || !tabIdsToMove.includes(activeTabId)) {
      return
    }

    // Creating the window with the active tab keeps focus where the user initiated the split.
    const newWindow = await chrome.windows.create({
      focused: true,
      tabId: activeTabId,
    })

    const remainingTabIds = tabIdsToMove.filter((tabId) => tabId !== activeTabId)

    if (newWindow?.id !== undefined && remainingTabIds.length > 0) {
      await chrome.tabs.move(remainingTabIds, {
        windowId: newWindow.id,
        // Left splits need prepending so tabs remain in their original left-to-right order.
        index: direction === COMMAND_CURRENT_AND_LEFT ? 0 : -1,
      })
    }

    await updateContextMenuState()
  } catch (error) {
    console.warn('Tab split was interrupted before completion.', {
      direction,
      error,
    })
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void createContextMenus()
})

void createContextMenus()

chrome.contextMenus.onClicked.addListener((info) => {
  if (isSplitDirection(info.menuItemId)) {
    void splitTabs(info.menuItemId)
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (isSplitDirection(command)) {
    void splitTabs(command)
  }
})

chrome.tabs.onActivated.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onUpdated.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onCreated.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onRemoved.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onMoved.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onAttached.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.tabs.onDetached.addListener(() => {
  updateContextMenuStateDebounced()
})

chrome.windows.onFocusChanged.addListener(() => {
  updateContextMenuStateDebounced()
})
