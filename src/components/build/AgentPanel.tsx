import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Play, Save, Loader2, Wrench } from 'lucide-react'
import clsx from 'clsx'
import type { AgentStep } from '../../types'

export type AgentMsg = { from: 'agent' | 'user'; text: string }

export function AgentPanel({
  messages,
  step,
  busy,
  tool,
  suggested,
  onText,
  onChip,
  onApply,
  onKeep,
  onRun,
  onSave,
}: {
  messages: AgentMsg[]
  step: AgentStep | null
  busy: 'thinking' | 'tool' | null
  tool: string | null
  suggested: string
  onText: (t: string) => void
  onChip: (c: string) => void
  onApply: () => void
  onKeep: () => void
  onRun: () => void
  onSave: () => void
}) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // pre-fill the input with the agent's suggested prompt whenever a step offers one
  useEffect(() => {
    setDraft(suggested)
  }, [suggested])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, step, busy])

  const submit = () => {
    const t = draft.trim()
    if (!t || busy) return
    onText(t)
    setDraft('')
  }

  const showControls = !busy && step

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
        ✦ Build agent
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              'max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed',
              m.from === 'agent'
                ? 'bg-panel-2 text-ink'
                : 'ml-auto bg-primary text-white',
            )}
          >
            {m.text}
          </div>
        ))}

        {/* agent working: thinking dots → tool-call chip */}
        {busy === 'thinking' && (
          <div className="flex w-fit items-center gap-1 rounded-xl bg-panel-2 px-3 py-2.5">
            <Dot delay="0ms" />
            <Dot delay="150ms" />
            <Dot delay="300ms" />
          </div>
        )}
        {busy === 'tool' && (
          <div className="flex w-fit items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
            <Loader2 size={13} className="animate-spin" />
            <Wrench size={12} />
            <span className="font-mono">{tool}</span>
          </div>
        )}

        {showControls && step?.kind === 'choice' && (
          <div className="flex flex-wrap gap-2">
            {step.chips.map((c) => (
              <button
                key={c}
                onClick={() => onChip(c)}
                className="rounded-lg border border-border-light px-3 py-1 text-xs text-ink-dim transition hover:border-primary hover:text-primary"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {showControls && step?.kind === 'suggest' && (
          <div className="flex gap-2">
            <button
              onClick={onApply}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              {step.applyLabel}
            </button>
            <button
              onClick={onKeep}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
            >
              Keep
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div
          className={clsx(
            'flex items-center gap-2 rounded-lg border px-2 py-1.5',
            busy ? 'border-border opacity-50' : 'border-border-light',
          )}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            disabled={!!busy}
            placeholder={step?.kind === 'guide' ? 'Edit the prompt, or hit send…' : 'Ask the agent…'}
            className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={submit}
            disabled={!!busy}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white disabled:opacity-50"
          >
            <ArrowUp size={13} />
          </button>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
          >
            <Save size={13} /> Save
          </button>
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Play size={13} /> Run
          </button>
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
      style={{ animationDelay: delay }}
    />
  )
}
