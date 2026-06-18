import { Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

export function CreditsMeter() {
  const credits = useStore((s) => s.credits)
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border-light bg-panel-2 px-3 py-1 text-sm"
      title="Free-tier credits remaining"
    >
      <Sparkles size={14} className="text-comfy" />
      <span className="font-semibold tabular-nums">{credits}</span>
      <span className="text-ink-faint">free</span>
    </div>
  )
}
