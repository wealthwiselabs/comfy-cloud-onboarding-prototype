import { useState } from 'react'
import { Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ShowroomCard } from '../components/ShowroomCard'
import { ItemDetailModal } from '../components/ItemDetailModal'
import type { ShowroomItem } from '../types'

type Tab = 'trending' | 'new'

export function Explore() {
  const showroom = useStore((s) => s.showroom)
  const toggleLike = useStore((s) => s.toggleLike)
  const [tab, setTab] = useState<Tab>('trending')
  const [open, setOpen] = useState<ShowroomItem | null>(null)

  const featured = showroom.filter((it) => it.featured)
  const feed =
    tab === 'trending'
      ? [...showroom].sort((a, b) => b.likes - a.likes)
      : [...showroom].sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0)) // 'mine' (newest) first

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-thin">
      {/* featured shelf */}
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Star size={15} className="text-comfy" /> Featured
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {featured.map((it) => (
          <ShowroomCard key={it.id} item={it} onOpen={setOpen} onLike={toggleLike} />
        ))}
      </div>

      {/* feed tabs */}
      <div className="mb-3 flex items-center gap-2">
        {(['trending', 'new'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              tab === t ? 'bg-panel-2 text-ink' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {feed.map((it) => (
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
