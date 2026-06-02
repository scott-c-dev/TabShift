type StatusPanelProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function StatusPanel({ message, actionLabel, onAction }: StatusPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-slate-400">{message}</p>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-900"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}
