import { useState } from 'react'
import { Eye, Search, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { OPPORTUNITIES } from '../data/seed'
import { OpenToWorkToggle } from '../components/OpenToWorkToggle'
import { DiscoverTalent } from '../components/DiscoverTalent'
import { CreditRewardToast } from '../components/CreditRewardToast'
import { ShowroomCard } from '../components/ShowroomCard'
import { Avatar } from '../components/Avatar'
import { ItemDetailModal } from '../components/ItemDetailModal'
import type { ShowroomItem } from '../types'

export function Showroom() {
  const profile = useStore((s) => s.profile)
  const showroom = useStore((s) => s.showroom)
  const toggleLike = useStore((s) => s.toggleLike)
  const searchAppearances = useStore((s) => s.searchAppearances)
  const profileViews = useStore((s) => s.profileViews)
  const [recruiterView, setRecruiterView] = useState(false)
  const [open, setOpen] = useState<ShowroomItem | null>(null)

  const mine = showroom.filter((it) => it.mine || it.author === 'Eric')
  const grid = mine.length > 0 ? mine : showroom.slice(0, 3)

  if (recruiterView) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-sm text-ink-dim">Recruiter view (preview)</span>
          <button
            onClick={() => setRecruiterView(false)}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to my Showroom
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <DiscoverTalent />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-thin">
      <CreditRewardToast />

      {/* profile header */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar avatar={profile.avatar} size="lg" />
            <div>
              <h1 className="text-lg font-semibold text-ink">{profile.name}</h1>
              <p className="text-sm text-ink-faint">{profile.followers.toLocaleString()} followers</p>
            </div>
            <button
              onClick={() => setRecruiterView(true)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-sm text-ink-dim hover:text-ink"
            >
              <Eye size={14} /> View as recruiter ▸
            </button>
          </div>
          <p className="mt-3 max-w-xl text-sm text-ink-dim">{profile.bio}</p>

          {/* discoverability signals (only meaningful once open-to-work) */}
          {profile.openToWork && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-dim">
              <span className="flex items-center gap-1 rounded-full bg-panel-2 px-2.5 py-1">
                <Search size={12} /> Appeared in {searchAppearances} talent searches
              </span>
              <span className="flex items-center gap-1 rounded-full bg-panel-2 px-2.5 py-1">
                <Eye size={12} /> {profileViews} studios viewed your Showroom
              </span>
            </div>
          )}
        </div>

        <div className="w-full md:w-72">
          <OpenToWorkToggle />
        </div>
      </div>

      {/* opportunities (canned, only when open-to-work) */}
      {profile.openToWork && (
        <div className="mt-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <TrendingUp size={15} className="text-comfy" /> Opportunities for you
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {OPPORTUNITIES.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-panel p-3">
                <p className="text-sm font-medium text-ink">{o.title}</p>
                <p className="text-xs text-ink-faint">{o.org} · {o.pay}</p>
                <span className="mt-2 inline-block rounded bg-panel-2 px-1.5 py-0.5 text-[10px] text-ink-dim">{o.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* your grid */}
      <h2 className="mb-3 mt-6 text-sm font-semibold text-ink">My Showroom</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {grid.map((it) => (
          <ShowroomCard key={it.id} item={it} onOpen={setOpen} onLike={toggleLike} />
        ))}
      </div>

      {open && (
        <ItemDetailModal
          item={showroom.find((it) => it.id === open.id) ?? open}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}
