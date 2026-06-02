export type SourceWindow = chrome.windows.Window & {
  id: number
  tabs: chrome.tabs.Tab[]
}

export type LoadState = 'loading' | 'ready' | 'error'
