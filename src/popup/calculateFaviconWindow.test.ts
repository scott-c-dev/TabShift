import { describe, expect, it } from 'vitest'
import { calculateFaviconWindow } from './calculateFaviconWindow'

type TestTab = {
  id: number
  index: number
  title: string
}

const createTabs = (count: number): TestTab[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 100,
    index,
    title: `Tab ${index}`,
  }))

const getIndexes = (tabs: TestTab[]) => tabs.map((tab) => tab.index)

describe('calculateFaviconWindow', () => {
  it('centers the active tab when it is in the middle', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(9), 4))).toEqual([2, 3, 4, 5, 6])
  })

  it('pads to the right when the active tab is first', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(9), 0))).toEqual([0, 1, 2, 3, 4])
  })

  it('pads to the left when the active tab is last', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(9), 8))).toEqual([4, 5, 6, 7, 8])
  })

  it('returns all tabs when the window has fewer than maxVisible tabs', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(3), 1))).toEqual([0, 1, 2])
  })

  it('returns all tabs when the window has exactly maxVisible tabs', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(5), 2))).toEqual([0, 1, 2, 3, 4])
  })

  it('pads to the right when the active tab is near the left edge', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(9), 1))).toEqual([0, 1, 2, 3, 4])
  })

  it('pads to the left when the active tab is near the right edge', () => {
    expect(getIndexes(calculateFaviconWindow(createTabs(9), 7))).toEqual([4, 5, 6, 7, 8])
  })

  it('returns an empty list when the active tab index is below range', () => {
    expect(calculateFaviconWindow(createTabs(9), -1)).toEqual([])
  })

  it('returns an empty list when the active tab index is above range', () => {
    expect(calculateFaviconWindow(createTabs(9), 9)).toEqual([])
  })

  it('does not depend on input array order', () => {
    const tabs = [
      { id: 108, index: 8, title: 'Tab 8' },
      { id: 104, index: 4, title: 'Tab 4' },
      { id: 102, index: 2, title: 'Tab 2' },
      { id: 106, index: 6, title: 'Tab 6' },
      { id: 103, index: 3, title: 'Tab 3' },
      { id: 105, index: 5, title: 'Tab 5' },
      { id: 100, index: 0, title: 'Tab 0' },
      { id: 107, index: 7, title: 'Tab 7' },
      { id: 101, index: 1, title: 'Tab 1' },
    ]

    expect(getIndexes(calculateFaviconWindow(tabs, 4))).toEqual([2, 3, 4, 5, 6])
  })
})
