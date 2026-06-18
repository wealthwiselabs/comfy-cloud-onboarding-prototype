import { useNavigate } from 'react-router-dom'
import { Avatar } from './Avatar'
import { GitFork, ArrowUpRight, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { childrenOf, parentOf } from '../data/seed'
import { mediaUrl } from '../lib/media'
import type { ShowroomItem } from '../types'

export function LineagePanel({
  item,
  onClose,
}: {
  item: ShowroomItem
  onClose: () => void
}) {
  const showroom = useStore((s) => s.showroom)
  const remixItem = useStore((s) => s.remixItem)
  const nav = useNavigate()
  const parent = parentOf(item, showroom)
  const children = childrenOf(item.id, showroom)

  const remix = () => {
    remixItem(item)
    nav('/studio')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l border-border bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-ink">Remix lineage</span>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
          {parent && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-faint">Forked from</p>
              <Row item={parent} />
            </div>
          )}

          <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-faint">This workflow</p>
          <Row item={item} highlight />

          <div className="mt-4">
            <p className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-wide text-ink-faint">
              <GitFork size={11} /> Remixed by {item.remixes}
            </p>
            {children.length > 0 ? (
              children.map((c) => <Row key={c.id} item={c} />)
            ) : (
              <p className="text-xs text-ink-faint">Be the first to remix this.</p>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <button
            onClick={remix}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <ArrowUpRight size={15} /> Remix in Cloud
          </button>
        </div>
      </div>
    </>
  )
}

function Row({ item, highlight }: { item: ShowroomItem; highlight?: boolean }) {
  const isVideo = item.kind === 'video'
  return (
    <div
      className={`mb-2 flex items-center gap-3 rounded-lg border p-2 ${
        highlight ? 'border-primary/40 bg-primary/5' : 'border-border'
      }`}
    >
      {isVideo ? (
        <video className="h-10 w-10 shrink-0 rounded bg-black object-cover" src={mediaUrl(item.thumb)} muted loop autoPlay playsInline />
      ) : (
        <img className="h-10 w-10 shrink-0 rounded bg-black object-cover" src={mediaUrl(item.thumb)} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-ink">{item.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Avatar avatar={item.avatar} /> {item.author}
        </p>
      </div>
    </div>
  )
}
