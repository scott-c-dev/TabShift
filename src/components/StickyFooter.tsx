type StickyFooterProps = {
  selectedCount: number
  isMerging: boolean
  onMerge: () => void
}

export function StickyFooter({ selectedCount, isMerging, onMerge }: StickyFooterProps) {
  const isDisabled = selectedCount === 0 || isMerging
  const buttonLabel =
    selectedCount === 0
      ? 'Select windows to merge'
      : selectedCount === 1
        ? 'Merge 1 window'
        : `Merge ${selectedCount} windows`

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 p-3">
      <button
        type="button"
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        disabled={isDisabled}
        onClick={onMerge}
      >
        {isMerging ? 'Merging...' : buttonLabel}
      </button>
    </footer>
  )
}
