import { Briefcase, X } from 'lucide-react'
import { COMMISSION_BRIEF } from '../data/seed'

export function CommissionBriefModal({ onClose }: { onClose: () => void }) {
  const b = COMMISSION_BRIEF
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[440px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-panel p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Briefcase size={16} className="text-good" /> Commission request
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          From {b.avatar} {b.from} · Budget {b.budget}
        </p>
        <h3 className="mt-2 text-base font-semibold text-ink">{b.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">{b.body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border-light px-3 py-1.5 text-sm text-ink-dim hover:text-ink">
            Decline
          </button>
          <button onClick={onClose} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:brightness-95">
            Accept & discuss
          </button>
        </div>
      </div>
    </>
  )
}
