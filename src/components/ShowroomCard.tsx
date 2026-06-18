import { Heart, MessageCircle, GitFork, Star } from 'lucide-react'
import { Avatar } from './Avatar'
import { mediaUrl } from '../lib/media'
import type { ShowroomItem } from '../types'

export function ShowroomCard({
  item,
  onOpen,
  onLike,
}: {
  item: ShowroomItem
  onOpen?: (item: ShowroomItem) => void
  onLike?: (id: string) => void
}) {
  const isVideo = item.kind === 'video'
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-panel">
      <button onClick={() => onOpen?.(item)} className="relative block w-full">
        {isVideo ? (
          <video
            className="h-40 w-full bg-black object-cover"
            src={mediaUrl(item.thumb)}
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            className="h-40 w-full bg-black object-cover"
            src={mediaUrl(item.thumb)}
            alt={item.title}
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
          />
        )}
        {item.featured && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-comfy/90 px-2 py-0.5 text-[10px] font-semibold text-bg">
            <Star size={10} /> Featured
          </span>
        )}
        {item.forkedFrom && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-0.5 text-[10px] text-ink-dim">
            <GitFork size={10} /> remix
          </span>
        )}
      </button>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-ink">{item.title}</p>
          {item.model && (
            <span className="ml-2 shrink-0 rounded bg-panel-2 px-1.5 py-0.5 text-[10px] text-ink-faint">
              {item.model}
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-faint">
          <Avatar avatar={item.avatar} /> {item.author}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-dim">
          <button
            onClick={() => onLike?.(item.id)}
            className={`flex items-center gap-1 hover:text-ink ${item.liked ? 'text-comfy' : ''}`}
          >
            <Heart size={13} fill={item.liked ? 'currentColor' : 'none'} />
            {item.likes}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} /> {item.comments}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={13} /> {item.remixes}
          </span>
        </div>
      </div>
    </div>
  )
}
