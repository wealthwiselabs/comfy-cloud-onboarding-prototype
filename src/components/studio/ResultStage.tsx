import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, WandSparkles, Images, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { TEMPLATE_MEDIA } from '../../data/seed'
import { mediaUrl } from '../../lib/media'
import { NodeCanvas } from './NodeCanvas'
import type { Branch } from '../../types'

export function ResultStage({
  branch,
  onEdit,
}: {
  branch: Branch
  onEdit: () => void
}) {
  const runStatus = useStore((s) => s.runStatus)
  const activated = useStore((s) => s.activated)
  const template = useStore((s) => s.template())
  const publish = useStore((s) => s.publishToShowroom)
  const nav = useNavigate()
  const [revealed, setRevealed] = useState(branch === 'nodes')

  // compute locally (NOT a store selector — returning a new object from a
  // Zustand v5 selector breaks useSyncExternalStore with an infinite loop)
  const remixSource = useStore((s) => s.remixSource)
  const tmpl = TEMPLATE_MEDIA[template]
  const media = remixSource
    ? {
        src: remixSource.thumb,
        type: remixSource.kind === 'video' ? ('video' as const) : ('image' as const),
      }
    : { src: tmpl.result, type: tmpl.resultType }

  if (runStatus === 'running') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-24">
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-panel-2">
          <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
        <p className="mt-4 text-sm text-ink-dim">Generating…</p>
        <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-border bg-panel">
        {media.type === 'video' ? (
          <video
            className="max-h-[60vh] w-full bg-black object-contain"
            src={mediaUrl(media.src)}
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            className="max-h-[60vh] w-full bg-black object-contain"
            src={mediaUrl(media.src)}
            alt="result"
          />
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink"
        >
          <ArrowLeft size={16} /> Edit
        </button>
        {activated && (
          <span className="flex items-center gap-1 text-xs text-good">
            <Check size={14} /> Activated · first render
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              publish('My first render')
              nav('/showroom')
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-sm text-ink-dim hover:text-ink"
          >
            <Images size={14} /> Save to Showroom
          </button>
          <button
            onClick={() => nav('/build')}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:brightness-95"
          >
            <WandSparkles size={14} /> Build your own
          </button>
        </div>
      </div>

      {branch !== 'nodes' && (
        <button
          onClick={() => setRevealed((v) => !v)}
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          {revealed ? 'Hide the workflow ▾' : '✨ Here’s the workflow that made this ▸'}
        </button>
      )}

      {revealed && (
        <div className="mt-3 h-[460px]">
          <NodeCanvas />
        </div>
      )}
    </div>
  )
}
