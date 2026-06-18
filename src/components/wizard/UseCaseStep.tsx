import { useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { Image as ImageIcon, Video } from 'lucide-react'
import type { Role, UseCase, OutputType } from '../../types'
import { USE_CASES, COMING_SOON, ROLE_USECASE_ORDER } from '../../data/seed'
import { mediaUrl } from '../../lib/media'

// Gradient stand-ins for the looping video/gif card media. Real mp4/gif assets
// drop in later by swapping this map for a <video> source per use-case.
const THUMB: Record<string, string> = {
  'grad-1': 'from-indigo-500 to-fuchsia-600',
  'grad-2': 'from-amber-500 to-rose-600',
  'grad-3': 'from-emerald-500 to-cyan-600',
  'grad-4': 'from-violet-500 to-indigo-700',
  'grad-5': 'from-orange-500 to-red-600',
  'grad-6': 'from-sky-500 to-blue-700',
}

function orderedUseCases(role: Role | null) {
  const order = role ? ROLE_USECASE_ORDER[role] : []
  if (!order || !order.length) return USE_CASES
  const head = order
    .map((id) => USE_CASES.find((u) => u.id === id))
    .filter((u): u is (typeof USE_CASES)[number] => Boolean(u))
  const tail = USE_CASES.filter((u) => !order.includes(u.id))
  return [...head, ...tail]
}

export function UseCaseStep({
  role,
  value,
  output,
  onSelect,
  onPickModality,
}: {
  role: Role | null
  value: UseCase | null
  output: OutputType | null
  onSelect: (u: UseCase) => void
  onPickModality: (o: OutputType) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const ordered = useMemo(() => orderedUseCases(role), [role])
  const visible = showAll ? ordered : ordered.slice(0, 6)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        What do you want to make first?
      </h1>
      <p className="mt-1 text-ink-dim">
        Pick a starting template — you can change everything later.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map((u) => {
          const selected = value === u.id
          return (
            <div
              key={u.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(u.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(u.id)
              }}
              className={clsx(
                'cursor-pointer overflow-hidden rounded-xl border bg-panel text-left transition',
                selected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-border-light',
              )}
            >
              <div
                className={clsx(
                  'relative h-28 bg-gradient-to-br',
                  THUMB[u.thumb] ?? 'from-panel-2 to-border',
                )}
              >
                {u.mediaType === 'video' ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={mediaUrl(u.media)}
                    muted
                    loop
                    autoPlay
                    playsInline
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <img
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    src={mediaUrl(u.media)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {u.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-ink">{u.label}</div>
                <div className="mt-0.5 text-xs text-ink-dim">{u.blurb}</div>
                {selected && u.ambiguous && (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-1.5 text-[11px] font-semibold text-primary">
                      Pick a format to continue
                    </div>
                    <div className="flex gap-2">
                      <ModalityChip
                        active={output === 'image'}
                        onClick={() => onPickModality('image')}
                        icon={<ImageIcon size={14} />}
                        label="Image"
                      />
                      <ModalityChip
                        active={output === 'video'}
                        onClick={() => onPickModality('video')}
                        icon={<Video size={14} />}
                        label="Video"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {COMING_SOON.map((c) => (
          <div
            key={c.label}
            className="overflow-hidden rounded-xl border border-border bg-panel opacity-50"
          >
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-panel-2 to-border text-xs text-ink-faint">
              Coming soon
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-ink">{c.label}</div>
              <div className="mt-0.5 text-xs text-ink-dim">{c.blurb}</div>
            </div>
          </div>
        ))}
      </div>

      {!showAll && ordered.length > 6 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          See all use-cases
        </button>
      )}
    </div>
  )
}

function ModalityChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border-light text-ink-dim hover:text-ink',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
