import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Heart, GitFork, ArrowUpRight, Send, Workflow } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../store/useStore'
import { mediaUrl } from '../lib/media'
import { NodeCanvas } from './studio/NodeCanvas'
import { LineagePanel } from './LineagePanel'
import { Avatar } from './Avatar'
import type { ShowroomItem } from '../types'

export function ItemDetailModal({
  item,
  onClose,
}: {
  item: ShowroomItem
  onClose: () => void
}) {
  const toggleLike = useStore((s) => s.toggleLike)
  const addComment = useStore((s) => s.addComment)
  const remixItem = useStore((s) => s.remixItem)
  const nav = useNavigate()
  const [tab, setTab] = useState<'output' | 'graph'>('output')
  const [showLineage, setShowLineage] = useState(false)
  const [draft, setDraft] = useState('')

  const isVideo = item.kind === 'video'
  const comments = item.commentList ?? []

  const post = () => {
    const t = draft.trim()
    if (!t) return
    addComment(item.id, t)
    setDraft('')
  }
  const remix = () => {
    remixItem(item)
    nav('/studio')
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-40 flex h-[80vh] w-[min(960px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border-light bg-panel shadow-2xl">
        {/* left: output / graph */}
        <div className="flex min-w-0 flex-[1.5] flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <button
              onClick={() => setTab('output')}
              className={clsx(
                'rounded-lg px-3 py-1 text-xs font-medium',
                tab === 'output' ? 'bg-panel-2 text-primary' : 'text-ink-dim hover:text-ink',
              )}
            >
              Output
            </button>
            <button
              onClick={() => setTab('graph')}
              className={clsx(
                'flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium',
                tab === 'graph' ? 'bg-panel-2 text-primary' : 'text-ink-dim hover:text-ink',
              )}
            >
              <Workflow size={13} /> Workflow graph
            </button>
          </div>
          <div className="min-h-0 flex-1 bg-black">
            {tab === 'output' ? (
              isVideo ? (
                <video
                  className="h-full w-full object-contain"
                  src={mediaUrl(item.thumb)}
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  className="h-full w-full object-contain"
                  src={mediaUrl(item.thumb)}
                  alt={item.title}
                  onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                />
              )
            ) : (
              <div className="h-full w-full p-2">
                <NodeCanvas graph={isVideo ? 'video' : 'image'} />
              </div>
            )}
          </div>
        </div>

        {/* right: social rail */}
        <div className="flex w-[340px] shrink-0 flex-col">
          <div className="flex items-start justify-between border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-dim">
                <Avatar avatar={item.avatar} /> {item.author}
                {item.model ? ` · ${item.model}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-ink-faint hover:text-ink">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs text-ink-dim">
            <button
              onClick={() => toggleLike(item.id)}
              className={clsx('flex items-center gap-1 hover:text-ink', item.liked && 'text-comfy')}
            >
              <Heart size={14} fill={item.liked ? 'currentColor' : 'none'} /> {item.likes}
            </button>
            <span className="flex items-center gap-1">
              <GitFork size={13} /> {item.remixes}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
            <p className="mb-2 text-[10px] uppercase tracking-wide text-ink-faint">
              {item.comments} comments
            </p>
            {comments.length === 0 && (
              <p className="text-xs text-ink-faint">Be the first to comment.</p>
            )}
            {comments.map((c, i) => (
              <div key={i} className="mb-3 flex gap-2">
                <Avatar avatar={c.avatar} />
                <div className="min-w-0 text-xs">
                  <span className="font-semibold text-ink">{c.author}</span>{' '}
                  <span className="text-ink-faint">{c.time}</span>
                  <p className="text-ink-dim">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border px-3 py-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') post()
              }}
              placeholder="Add a comment…"
              className="flex-1 rounded-lg border border-border-light bg-panel-2 px-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={post}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white"
            >
              <Send size={13} />
            </button>
          </div>

          <div className="flex gap-2 border-t border-border p-3">
            <button
              onClick={() => setShowLineage(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-xs text-ink-dim hover:text-ink"
            >
              <GitFork size={13} /> Lineage
            </button>
            <button
              onClick={remix}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:brightness-95"
            >
              <ArrowUpRight size={14} /> Remix in Cloud
            </button>
          </div>
        </div>
      </div>

      {showLineage && <LineagePanel item={item} onClose={() => setShowLineage(false)} />}
    </>
  )
}
