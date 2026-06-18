import { useState } from 'react'
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, GitFork, Briefcase } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CommissionBriefModal } from './CommissionBriefModal'
import type { NotificationItem } from '../types'

const ICON = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  post: Sparkles,
  remix: GitFork,
  commission: Briefcase,
} as const

function Row({ n, onCommission }: { n: NotificationItem; onCommission: () => void }) {
  const Icon = ICON[n.kind]
  const isCommission = n.kind === 'commission'
  return (
    <button
      onClick={isCommission ? onCommission : undefined}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-panel-2 ${
        isCommission ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${isCommission ? 'text-good' : 'text-comfy'}`} />
      <div className="text-sm leading-snug">
        <p className="text-ink">{n.text}</p>
        <p className="text-xs text-ink-faint">{n.time} ago{isCommission ? ' · tap to view' : ''}</p>
      </div>
    </button>
  )
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [brief, setBrief] = useState(false)
  const notifications = useStore((s) => s.notifications)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-dim hover:bg-panel-2 hover:text-ink"
      >
        <Bell size={16} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-comfy" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-80 overflow-hidden rounded-xl border border-border bg-panel shadow-2xl">
            <div className="border-b border-border px-4 py-2.5 text-sm font-semibold">Notifications</div>
            <div className="max-h-96 divide-y divide-border overflow-y-auto scrollbar-thin">
              {notifications.map((n) => (
                <Row key={n.id} n={n} onCommission={() => { setBrief(true); setOpen(false) }} />
              ))}
            </div>
          </div>
        </>
      )}
      {brief && <CommissionBriefModal onClose={() => setBrief(false)} />}
    </div>
  )
}
