import { useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CREATORS, SKILL_FILTERS, STYLE_FILTERS } from '../data/seed'
import { mediaUrl } from '../lib/media'
import type { Creator } from '../types'

export function DiscoverTalent() {
  const profile = useStore((s) => s.profile)
  const [skill, setSkill] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)
  const [availOnly, setAvailOnly] = useState(true)

  // your live profile replaces the seed 'you' card so toggling Open-to-work shows up here
  const all: Creator[] = CREATORS.map((c) => (c.isYou ? profile : c))
  const results = all.filter((c) => {
    if (availOnly && !c.openToWork) return false
    if (skill && !c.skills.includes(skill)) return false
    if (style && !c.styles.includes(style)) return false
    return true
  })

  return (
    <div className="p-6">
      <div className="mb-1 flex items-center gap-2 text-sm text-ink-dim">
        <Search size={15} /> Discover talent
      </div>
      <p className="mb-4 text-xs text-ink-faint">
        What a studio sees when sourcing Comfy creators. Filter by skill, style, availability.
      </p>

      <FilterRow label="Skill" options={SKILL_FILTERS} active={skill} onPick={setSkill} />
      <FilterRow label="Style" options={STYLE_FILTERS} active={style} onPick={setStyle} />
      <button
        onClick={() => setAvailOnly((v) => !v)}
        className={`mb-5 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
          availOnly ? 'border-good/40 bg-good/10 text-good' : 'border-border-light text-ink-dim'
        }`}
      >
        <Briefcase size={12} /> Open to work only
      </button>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {results.map((c) => (
          <CreatorCard key={c.handle} c={c} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-ink-faint">No creators match these filters.</p>
      )}
    </div>
  )
}

function FilterRow({
  label,
  options,
  active,
  onPick,
}: {
  label: string
  options: string[]
  active: string | null
  onPick: (v: string | null) => void
}) {
  return (
    <div className="mb-2">
      <p className="mb-1.5 text-xs text-ink-faint">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = active === o
          return (
            <button
              key={o}
              onClick={() => onPick(on ? null : o)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                on ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border-light text-ink-dim hover:text-ink'
              }`}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CreatorCard({ c }: { c: Creator }) {
  const isVideo = c.thumb.endsWith('.mp4')
  return (
    <div className={`overflow-hidden rounded-xl border bg-panel ${c.isYou ? 'border-primary/50' : 'border-border'}`}>
      {isVideo ? (
        <video className="h-28 w-full bg-black object-cover" src={mediaUrl(c.thumb)} muted loop autoPlay playsInline />
      ) : (
        <img className="h-28 w-full bg-black object-cover" src={mediaUrl(c.thumb)} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
      )}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-ink">{c.avatar} {c.name}</p>
          {c.isYou && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">You</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-ink-faint">{c.bio}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {c.skills.slice(0, 2).map((s) => (
            <span key={s} className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] text-ink-dim">{s}</span>
          ))}
        </div>
        {c.openToWork && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-good">
            <Briefcase size={11} /> Open · {c.workTypes.join(', ') || 'work'}
          </p>
        )}
      </div>
    </div>
  )
}
