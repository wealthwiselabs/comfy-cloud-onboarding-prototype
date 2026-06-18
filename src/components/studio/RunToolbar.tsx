import { Play } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { RUN_COST, IMG_RUN_COST } from '../../data/seed'

export function RunToolbar({ onRun }: { onRun: () => void }) {
  const credits = useStore((s) => s.credits)
  const running = useStore((s) => s.runStatus === 'running')
  const template = useStore((s) => s.template())
  const cost = template === 'video' ? RUN_COST : IMG_RUN_COST

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-border-light bg-panel-2 px-3 py-1 text-xs text-ink-dim">
        ~{cost} credits · {credits} free
      </span>
      <button
        onClick={onRun}
        disabled={running}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        <Play size={14} />
        {running ? 'Running…' : 'Run'}
      </button>
    </div>
  )
}
