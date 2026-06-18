import { NavLink } from 'react-router-dom'
import { Plus, Image, Boxes, LayoutGrid, Workflow, LayoutTemplate, User } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../store/useStore'
import { Logo } from './Logo'

// Real Comfy Cloud icon rail. "New" (+) and Templates open the Templates browser
// modal; Workflows → /studio (editor). Assets/Node Library/Apps are present for
// fidelity (representative, non-routing in this prototype).
const REP = [
  { label: 'Assets', icon: Image },
  { label: 'Node Library', icon: Boxes },
  { label: 'Apps', icon: LayoutGrid },
]

export function Sidebar() {
  const openTemplates = useStore((s) => s.openTemplates)
  return (
    <nav className="flex w-14 flex-col items-center gap-1.5 border-r border-border bg-panel py-3">
      <div className="mb-2">
        <Logo className="text-base" />
      </div>

      <button
        onClick={openTemplates}
        title="New — Build with AI"
        className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition hover:brightness-95"
      >
        <Plus size={18} />
      </button>

      {REP.map(({ label, icon: Icon }) => (
        <button
          key={label}
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink-dim"
        >
          <Icon size={18} strokeWidth={1.75} />
        </button>
      ))}

      <NavLink
        to="/studio"
        title="Workflows (w)"
        className={({ isActive }) =>
          clsx(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            isActive
              ? 'bg-panel-2 text-primary'
              : 'text-ink-faint hover:bg-panel-2 hover:text-ink-dim',
          )
        }
      >
        <Workflow size={18} strokeWidth={1.75} />
      </NavLink>

      <button
        onClick={openTemplates}
        title="Templates"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink-dim"
      >
        <LayoutTemplate size={18} strokeWidth={1.75} />
      </button>

      <div className="mt-auto">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-ink-dim hover:text-ink">
          <User size={16} />
        </button>
      </div>
    </nav>
  )
}
