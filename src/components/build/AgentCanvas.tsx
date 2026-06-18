import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { BUILD_SCRIPT } from '../../data/seed'
import { NodeCanvas } from '../studio/NodeCanvas'
import { ResultStage } from '../studio/ResultStage'
import { AgentPanel, type AgentMsg } from './AgentPanel'
import { LessonPopover } from './LessonPopover'
import type { StartWorkflow, Lesson, AgentStep, NodeOverride } from '../../types'

type Overrides = Record<string, NodeOverride>

const CLOSING = "You're all set — Run it to preview, or Save to your workflows."

export function AgentCanvas({
  workflow,
  onExit,
}: {
  workflow: StartWorkflow
  onExit: () => void
}) {
  const template = useStore((s) => s.template())
  const runStatus = useStore((s) => s.runStatus)
  const startRun = useStore((s) => s.startRun)
  const finishRun = useStore((s) => s.finishRun)
  const clearRun = useStore((s) => s.clearRun)
  const lessons = useStore((s) => s.lessons)

  const script = BUILD_SCRIPT[template]
  const [stepIndex, setStepIndex] = useState(0)
  const [messages, setMessages] = useState<AgentMsg[]>(() => [
    { from: 'agent', text: `Loaded ${workflow.title}. Let's make it yours — ${script.length} quick steps.` },
  ])
  const [overrides, setOverrides] = useState<Overrides>({})
  const [changedNodeIds, setChangedNodeIds] = useState<string[]>([])
  const [flashNodeId, setFlashNodeId] = useState<string | undefined>(undefined)
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'tool'>('thinking')
  const [tool, setTool] = useState<string | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [saved, setSaved] = useState(false)

  const timers = useRef<number[]>([])
  const addTimer = (id: number) => timers.current.push(id)
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const step = stepIndex < script.length ? script[stepIndex] : null
  // blue "edit here" guides toward the active node; green "edited" marks changes
  const highlightNodeId = phase === 'idle' ? step?.targetNodeId : undefined

  // Play one agent turn: thinking → (optional) tool-call → apply edit + deliver message.
  const agentTurn = (opts: { toolLabel?: string; onAct?: () => void; message: string }) => {
    setPhase('thinking')
    setTool(null)
    addTimer(
      window.setTimeout(() => {
        if (opts.toolLabel) {
          setPhase('tool')
          setTool(opts.toolLabel)
          addTimer(
            window.setTimeout(() => {
              opts.onAct?.()
              setPhase('idle')
              setTool(null)
              setMessages((m) => [...m, { from: 'agent', text: opts.message }])
            }, 850),
          )
        } else {
          setPhase('idle')
          setMessages((m) => [...m, { from: 'agent', text: opts.message }])
        }
      }, 650),
    )
  }

  // deliver the first question once, on mount
  useEffect(() => {
    agentTurn({ message: script[0].text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markChanged = (id: string) => {
    setChangedNodeIds((s) => (s.includes(id) ? s : [...s, id]))
    setFlashNodeId(id)
    addTimer(window.setTimeout(() => setFlashNodeId((f) => (f === id ? undefined : f)), 1400))
  }

  const applyEdit = (s: AgentStep, userText: string) => {
    if (s.kind === 'guide') {
      setOverrides((o) => ({ ...o, [s.targetNodeId]: { ...o[s.targetNodeId], textValue: userText } }))
    } else if (s.kind === 'suggest') {
      setOverrides((o) => ({ ...o, [s.targetNodeId]: { ...o[s.targetNodeId], ...s.override } }))
    }
    markChanged(s.targetNodeId)
  }

  const nextMessage = (ni: number) => (ni < script.length ? script[ni].text : CLOSING)

  // user typed/chose -> agent applies the edit and asks the next question
  const act = (userText: string) => {
    if (phase !== 'idle' || !step) return
    const cur = step
    const tl = 'tool' in cur ? cur.tool : undefined
    setMessages((m) => [...m, { from: 'user', text: userText }])
    const ni = stepIndex + 1
    agentTurn({ toolLabel: tl, onAct: () => applyEdit(cur, userText), message: nextMessage(ni) })
    setStepIndex(ni)
  }

  const onApply = () => {
    if (phase !== 'idle' || step?.kind !== 'suggest') return
    const cur = step
    setMessages((m) => [...m, { from: 'user', text: cur.applyLabel }])
    const ni = stepIndex + 1
    agentTurn({ toolLabel: cur.tool, onAct: () => applyEdit(cur, ''), message: nextMessage(ni) })
    setStepIndex(ni)
  }

  // skip without applying an edit (e.g. "Keep")
  const skip = (userText: string) => {
    if (phase !== 'idle') return
    setMessages((m) => [...m, { from: 'user', text: userText }])
    const ni = stepIndex + 1
    agentTurn({ message: nextMessage(ni) })
    setStepIndex(ni)
  }

  const run = () => {
    startRun()
    window.setTimeout(() => finishRun(), 2500)
  }
  const onSave = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  const inResult = runStatus === 'running' || runStatus === 'done'
  const suggested = step?.kind === 'guide' ? step.suggested ?? '' : ''

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-sm text-ink-dim hover:text-ink"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <span className="text-sm text-ink">{workflow.title}</span>
        <span className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase text-ink-faint">
          {workflow.nodeCount} nodes · editing
        </span>
      </div>

      {inResult ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-thin">
          <ResultStage branch="nodes" onEdit={clearRun} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
            <div className="min-h-0 flex-1">
              <NodeCanvas
                highlightNodeId={highlightNodeId}
                nodeOverrides={overrides}
                changedNodeIds={changedNodeIds}
                flashNodeId={flashNodeId}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2">
              <GraduationCap size={14} className="text-primary" />
              <span className="text-[11px] text-ink-dim">New here? Learn &amp; earn:</span>
              {lessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLesson(l)}
                  className="rounded-full border border-border-light px-2.5 py-0.5 text-[11px] text-ink-dim transition hover:border-primary hover:text-primary"
                >
                  {l.concept} {l.done ? '✓' : 'ⓘ'}
                </button>
              ))}
            </div>
          </div>
          <div className="w-[320px] shrink-0 border-l border-border">
            <AgentPanel
              messages={messages}
              step={step}
              busy={phase === 'idle' ? null : phase}
              tool={tool}
              suggested={suggested}
              onText={act}
              onChip={act}
              onApply={onApply}
              onKeep={() => skip('Keep as is')}
              onRun={run}
              onSave={onSave}
            />
          </div>
        </div>
      )}

      {lesson && <LessonPopover lesson={lesson} onClose={() => setLesson(null)} />}
      {saved && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg">
          Saved to your workflows
        </div>
      )}
    </div>
  )
}
