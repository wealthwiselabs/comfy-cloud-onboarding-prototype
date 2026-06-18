import clsx from 'clsx'
import { Sparkles, SlidersHorizontal, Zap, type LucideIcon } from 'lucide-react'
import type { Skill } from '../../types'

const SKILLS: {
  id: Skill
  label: string
  blurb: string
  icon: LucideIcon
  color: string
}[] = [
  { id: 'beginner', label: 'New to ComfyUI', blurb: 'First time with node tools — give me a simple form, no nodes.', icon: Sparkles, color: 'from-emerald-500 to-green-500' },
  {
    id: 'intermediate',
    label: 'Intermediate',
    blurb: 'Built a workflow or two — show the key fields, with the graph one tap away.',
    icon: SlidersHorizontal,
    color: 'from-sky-500 to-blue-500',
  },
  { id: 'pro', label: 'Advanced', blurb: 'Comfortable building & editing detailed workflows — drop me into the full node graph.', icon: Zap, color: 'from-fuchsia-500 to-purple-500' },
]

export function SkillStep({
  value,
  onSelect,
}: {
  value: Skill | null
  onSelect: (s: Skill) => void
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        How familiar are you with ComfyUI?
      </h1>
      <p className="mt-1 text-ink-dim">
        This sets how much of the workflow we show you.
      </p>

      <div className="mt-6 space-y-3">
        {SKILLS.map((s) => {
          const Icon = s.icon
          const selected = value === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl border bg-panel px-4 py-3 text-left transition',
                selected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-border-light',
              )}
            >
              <div
                className={clsx(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                  s.color,
                )}
              >
                <Icon size={18} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-ink">{s.label}</span>
                <span className="text-xs text-ink-dim">{s.blurb}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
