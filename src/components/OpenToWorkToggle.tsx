import { Briefcase } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { WorkType } from '../types'

const WORK_TYPES: WorkType[] = ['commissions', 'freelance', 'full-time']

export function OpenToWorkToggle() {
  const profile = useStore((s) => s.profile)
  const setOpenToWork = useStore((s) => s.setOpenToWork)
  const toggleWorkType = useStore((s) => s.toggleWorkType)

  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className={profile.openToWork ? 'text-good' : 'text-ink-faint'} />
          <span className="text-sm font-medium text-ink">Open to work</span>
        </div>
        <button
          onClick={() => setOpenToWork(!profile.openToWork)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            profile.openToWork ? 'bg-good' : 'bg-panel-2'
          }`}
          aria-pressed={profile.openToWork}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              profile.openToWork ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {profile.openToWork && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-ink-faint">Available for</p>
          <div className="flex flex-wrap gap-1.5">
            {WORK_TYPES.map((t) => {
              const on = profile.workTypes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleWorkType(t)}
                  className={`rounded-full border px-2.5 py-1 text-xs capitalize ${
                    on
                      ? 'border-good/40 bg-good/10 text-good'
                      : 'border-border-light text-ink-dim hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
