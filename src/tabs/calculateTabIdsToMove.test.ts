import { describe, expect, it } from 'vitest'
import { calculateTabIdsToMove, type SplitDirection } from './calculateTabIdsToMove'

type TestTab = {
  id?: number
  index: number
}

const createTabs = (count: number): TestTab[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 10,
    index,
  }))

describe('calculateTabIdsToMove', () => {
  it('returns the current tab and tabs to the right from a middle tab', () => {
    expect(calculateTabIdsToMove(createTabs(4), 2, 'current-and-right')).toEqual([12, 13])
  })

  it('returns tabs to the left and the current tab from a middle tab', () => {
    expect(calculateTabIdsToMove(createTabs(4), 2, 'current-and-left')).toEqual([10, 11, 12])
  })

  it('returns an empty list when current-and-right from the first tab would select all tabs', () => {
    expect(calculateTabIdsToMove(createTabs(4), 0, 'current-and-right')).toEqual([])
  })

  it('returns an empty list when current-and-left from the last tab would select all tabs', () => {
    expect(calculateTabIdsToMove(createTabs(4), 3, 'current-and-left')).toEqual([])
  })

  it.each<SplitDirection>(['current-and-right', 'current-and-left'])(
    'returns an empty list for a single-tab window with %s',
    (direction) => {
      expect(calculateTabIdsToMove(createTabs(1), 0, direction)).toEqual([])
    },
  )

  it('returns an empty list when the active tab index is below range', () => {
    expect(calculateTabIdsToMove(createTabs(4), -1, 'current-and-right')).toEqual([])
  })

  it('returns an empty list when the active tab index is above range', () => {
    expect(calculateTabIdsToMove(createTabs(4), 4, 'current-and-left')).toEqual([])
  })

  it('ignores tabs without numeric IDs', () => {
    const tabs = [{ id: 10, index: 0 }, { index: 1 }, { id: 12, index: 2 }, { id: 13, index: 3 }]

    expect(calculateTabIdsToMove(tabs, 1, 'current-and-right')).toEqual([12, 13])
  })

  it('does not depend on input array order', () => {
    const tabs = [
      { id: 13, index: 3 },
      { id: 10, index: 0 },
      { id: 12, index: 2 },
      { id: 11, index: 1 },
    ]

    expect(calculateTabIdsToMove(tabs, 2, 'current-and-left')).toEqual([10, 11, 12])
  })
})
