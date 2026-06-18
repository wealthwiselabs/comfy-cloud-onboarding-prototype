import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutTemplate, Search, X, ChevronDown, Sparkles, List, Flame, Star,
  GraduationCap, Grid2x2, Image as ImageIcon, Film, Volume2, Box,
  MessageSquare, Plug, Workflow as WorkflowIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../store/useStore'
import { WORKFLOWS, searchTemplates, recommendByIntake } from '../data/seed'
import { mediaUrl } from '../lib/media'
import type { StartWorkflow } from '../types'

type Kind = 'rec' | 'all' | 'image' | 'video' | 'rep'
type Cat = { id: string; label: string; icon: typeof List; kind: Kind }

const PRIMARY: Cat[] = [
  { id: 'recommended', label: 'Recommended', icon: Sparkles, kind: 'rec' },
  { id: 'all', label: 'All Templates', icon: List, kind: 'all' },
  { id: 'popular', label: 'Popular', icon: Flame, kind: 'rep' },
  { id: 'usecases', label: 'Use Cases', icon: Star, kind: 'rep' },
  { id: 'getting', label: 'Getting Started', icon: GraduationCap, kind: 'rep' },
  { id: 'basics', label: 'Node Basics', icon: Grid2x2, kind: 'rep' },
]
const GEN_TYPE: Cat[] = [
  { id: 'image', label: 'Image', icon: ImageIcon, kind: 'image' },
  { id: 'video', label: 'Video', icon: Film, kind: 'video' },
  { id: 'audio', label: 'Audio', icon: Volume2, kind: 'rep' },
  { id: '3d', label: '3D Model', icon: Box, kind: 'rep' },
  { id: 'llm', label: 'LLM', icon: MessageSquare, kind: 'rep' },
  { id: 'partner', label: 'Partner Nodes', icon: Plug, kind: 'rep' },
]
const ALL_CATS = [...PRIMARY, ...GEN_TYPE]
const FILTERS = ['Model Filter', 'Tasks', 'Runs on']

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)
const tagFor = (w: StartWorkflow) => (w.template === 'video' ? 'Image to Video' : 'Text to Image')

export function TemplatesModal() {
  const open = useStore((s) => s.templatesOpen)
  const close = useStore((s) => s.closeTemplates)
  const pick = useStore((s) => s.pickWorkflow)
  const role = useStore((s) => s.intake.role)
  const output = useStore((s) => s.intake.output)
  const nav = useNavigate()

  const [activeId, setActiveId] = useState('recommended')
  const [query, setQuery] = useState('')

  if (!open) return null

  const active = ALL_CATS.find((c) => c.id === activeId) ?? PRIMARY[0]
  const q = query.trim()

  let cards: StartWorkflow[] = []
  let heading = active.label
  if (q) {
    cards = searchTemplates(q)
    heading = `${cards.length} result${cards.length === 1 ? '' : 's'} for “${q}”`
  } else if (active.kind === 'rec') {
    cards = recommendByIntake(role, output)
    heading = 'Recommended for you'
  } else if (active.kind === 'all') {
    cards = WORKFLOWS
  } else if (active.kind === 'image') {
    cards = WORKFLOWS.filter((w) => w.template === 'image')
  } else if (active.kind === 'video') {
    cards = WORKFLOWS.filter((w) => w.template === 'video')
  } // 'rep' -> cards stays []

  const onPick = (w: StartWorkflow) => {
    pick(w)
    nav('/build')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70" onClick={close} />
      <div className="relative flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-panel shadow-2xl">
        {/* left rail */}
        <aside className="flex w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-bg/40 p-3 scrollbar-thin">
          <div className="mb-2 flex items-center gap-2 px-2 py-1.5 text-base font-semibold text-ink">
            <LayoutTemplate size={18} /> Templates
          </div>
          {PRIMARY.map((c) => (
            <RailItem key={c.id} c={c} active={!q && c.id === activeId} onClick={() => { setActiveId(c.id); setQuery('') }} />
          ))}
          <div className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            Generation Type
          </div>
          {GEN_TYPE.map((c) => (
            <RailItem key={c.id} c={c} active={!q && c.id === activeId} onClick={() => { setActiveId(c.id); setQuery('') }} />
          ))}
        </aside>

        {/* main */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-light bg-bg/50 px-3 py-2">
              <Search size={15} className="text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search …"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button onClick={close} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light text-ink-dim hover:text-ink">
              <X size={16} />
            </button>
          </div>

          {/* representational filter row */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-2.5">
            {FILTERS.map((f) => (
              <div key={f} className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs text-ink-dim">
                {f} <ChevronDown size={12} className="text-ink-faint" />
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs text-ink-dim">
              ↕ Default <ChevronDown size={12} className="text-ink-faint" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
            <h2 className="mb-3 text-xl font-semibold text-ink">{heading}</h2>
            {cards.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {cards.map((w) => (
                  <Card key={w.id} w={w} onPick={onPick} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Sparkles size={22} className="mb-2 text-ink-faint" />
                <p className="text-sm text-ink-dim">
                  Curated <span className="text-ink">{active.label}</span> templates are coming soon.
                </p>
                <button
                  onClick={() => { setActiveId('all'); setQuery('') }}
                  className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                >
                  Browse all templates
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function RailItem({ c, active, onClick }: { c: Cat; active: boolean; onClick: () => void }) {
  const Icon = c.icon
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
        active ? 'bg-panel-2 font-medium text-ink' : 'text-ink-dim hover:bg-panel-2 hover:text-ink',
      )}
    >
      <Icon size={15} className={active ? 'text-primary' : 'text-ink-faint'} />
      {c.label}
    </button>
  )
}

function Card({ w, onPick }: { w: StartWorkflow; onPick: (w: StartWorkflow) => void }) {
  return (
    <button
      onClick={() => onPick(w)}
      className="overflow-hidden rounded-xl border border-border bg-panel-2 text-left transition hover:border-border-light"
    >
      <div className="relative h-32 bg-gradient-to-br from-panel-2 to-border">
        {w.mediaType === 'video' ? (
          <video
            className={`absolute inset-0 h-full w-full object-cover ${w.focus === 'top' ? 'object-top' : ''}`}
            src={mediaUrl(w.thumb)} muted loop autoPlay playsInline
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <img
            className={`absolute inset-0 h-full w-full object-cover ${w.focus === 'top' ? 'object-top' : ''}`}
            src={mediaUrl(w.thumb)} alt=""
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <span className="rounded bg-bg/80 px-1.5 py-0.5 text-[10px] text-ink-dim">{tagFor(w)}</span>
          <span className="rounded bg-bg/80 px-1.5 py-0.5 text-[10px] text-ink-dim">
            {w.mediaType === 'video' ? 'Video' : 'Image'}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-ink">{w.title}</div>
        {w.desc && <p className="mt-1 line-clamp-2 text-xs text-ink-dim">{w.desc}</p>}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-faint">
          <WorkflowIcon size={12} /> Node graph
          <span className="ml-auto flex items-center gap-0.5">
            <Star size={11} className="text-primary" /> {fmt(w.rating)}
          </span>
        </div>
      </div>
    </button>
  )
}
