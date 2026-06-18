import clsx from 'clsx'
import {
  Palette,
  Film,
  Gamepad,
  Megaphone,
  Package,
  Code,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../../types'
import { ROLES } from '../../data/seed'

const ICONS: Record<Role, LucideIcon> = {
  visual_artist: Palette,
  film_vfx: Film,
  game_artist: Gamepad,
  marketing: Megaphone,
  product_ecom: Package,
  developer: Code,
  student: GraduationCap,
  hobbyist: Sparkles,
  other: MoreHorizontal,
}

// A vivid gradient per role so the grid reads colorful and scannable.
const COLORS: Record<Role, string> = {
  visual_artist: 'from-pink-500 to-rose-500',
  film_vfx: 'from-indigo-500 to-violet-500',
  game_artist: 'from-emerald-500 to-green-500',
  marketing: 'from-orange-500 to-amber-500',
  product_ecom: 'from-amber-500 to-yellow-500',
  developer: 'from-cyan-500 to-sky-500',
  student: 'from-blue-500 to-indigo-500',
  hobbyist: 'from-fuchsia-500 to-purple-500',
  other: 'from-slate-500 to-slate-600',
}

export function RoleStep({
  value,
  onSelect,
  roleOther,
  onRoleOther,
}: {
  value: Role | null
  onSelect: (r: Role) => void
  roleOther: string
  onRoleOther: (t: string) => void
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">What best describes your role?</h1>
      <p className="mt-1 text-ink-dim">We&apos;ll tailor your starting point.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ROLES.map((r) => {
          const Icon = ICONS[r.id]
          const selected = value === r.id
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={clsx(
                'flex items-center gap-3 rounded-xl border bg-panel px-4 py-3 text-left transition',
                selected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-border-light',
              )}
            >
              <div
                className={clsx(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                  COLORS[r.id],
                )}
              >
                <Icon size={18} />
              </div>
              <span className="text-sm font-medium text-ink">{r.label}</span>
            </button>
          )
        })}
      </div>

      {value === 'other' && (
        <input
          autoFocus
          value={roleOther}
          onChange={(e) => onRoleOther(e.target.value)}
          placeholder="Tell us what you do (optional)"
          className="mt-3 w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
      )}
    </div>
  )
}
