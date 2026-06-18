import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CreditsMeter } from './CreditsMeter'
import { NotificationsBell } from './NotificationsBell'
import { TemplatesModal } from './TemplatesModal'
import { Share2 } from 'lucide-react'

const TITLES: Record<string, string> = {
  '/studio': 'Image → Video',
  '/build': 'Build a workflow',
  '/showroom': 'Your showroom',
  '/explore': 'Explore',
}

export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
          <span className="text-sm font-medium text-ink-dim">
            {TITLES[pathname] ?? 'Comfy Cloud'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <CreditsMeter />
            <NotificationsBell />
            <button className="flex h-8 items-center gap-1.5 rounded-lg border border-border-light px-2.5 text-sm text-ink-dim hover:text-ink">
              <Share2 size={14} />
              Share
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <TemplatesModal />
    </div>
  )
}
