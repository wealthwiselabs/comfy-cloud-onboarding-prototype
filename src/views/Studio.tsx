import { useEffect } from 'react'
import { Sparkles, Play } from 'lucide-react'
import { useStore } from '../store/useStore'
import { TEMPLATE_MEDIA, RUN_COST, IMG_RUN_COST } from '../data/seed'
import { mediaUrl } from '../lib/media'
import { FieldsPanel } from '../components/studio/FieldsPanel'
import { NodeCanvas } from '../components/studio/NodeCanvas'
import { RunToolbar } from '../components/studio/RunToolbar'
import { ResultStage } from '../components/studio/ResultStage'
import type { Branch } from '../types'

export function Studio() {
  const branch = useStore((s) => s.branch())
  const template = useStore((s) => s.template())
  const inputImage = useStore((s) => s.inputImage())
  const runStatus = useStore((s) => s.runStatus)
  const showNodes = useStore((s) => s.showNodes)
  const setShowNodes = useStore((s) => s.setShowNodes)
  const startRun = useStore((s) => s.startRun)
  const finishRun = useStore((s) => s.finishRun)
  const clearRun = useStore((s) => s.clearRun)
  const loadTemplate = useStore((s) => s.loadTemplate)

  // load the right template's fields when Studio mounts
  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  const run = () => {
    startRun()
    window.setTimeout(() => finishRun(), 2500)
  }

  const inResult = runStatus === 'running' || runStatus === 'done'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <span className="text-sm text-ink-dim">
          {template === 'video' ? 'Image → Video' : 'Product image'}
          <span className="ml-2 rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase text-ink-faint">
            {branch}
          </span>
        </span>
        {/* app + guided show Run below the config; only nodes keeps it in the toolbar */}
        {!inResult && branch === 'nodes' && <RunToolbar onRun={run} />}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-thin">
        {inResult ? (
          <ResultStage branch={branch} onEdit={clearRun} />
        ) : (
          <Editor
            branch={branch}
            showNodes={showNodes}
            setShowNodes={setShowNodes}
            inputImg={mediaUrl(inputImage)}
            onRun={run}
          />
        )}
      </div>
    </div>
  )
}

function Editor({
  branch,
  showNodes,
  setShowNodes,
  inputImg,
  onRun,
}: {
  branch: Branch
  showNodes: boolean
  setShowNodes: (v: boolean) => void
  inputImg: string
  onRun: () => void
}) {
  if (branch === 'app') {
    return (
      <div className="mx-auto max-w-2xl">
        <FieldsPanel />
        <RunCta onRun={onRun} />
      </div>
    )
  }

  if (branch === 'guided') {
    return (
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        <div>
          <button
            onClick={() => setShowNodes(!showNodes)}
            className="mb-2 text-xs font-medium text-primary hover:underline"
          >
            {showNodes ? 'Hide nodes ▾' : 'Show nodes ▸'}
          </button>
          {showNodes ? (
            <div className="h-[460px]">
              <NodeCanvas />
            </div>
          ) : (
            <img
              src={inputImg}
              alt=""
              className="h-[460px] w-full rounded-xl border border-border object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles size={13} /> Edit these to make it yours
          </div>
          <FieldsPanel highlight />
          <RunCta onRun={onRun} />
        </div>
      </div>
    )
  }

  // nodes (pro)
  return (
    <div className="grid h-full grid-cols-[1fr_300px] gap-4">
      <div className="h-[560px]">
        <NodeCanvas />
      </div>
      <FieldsPanel />
    </div>
  )
}

/** Prominent Run CTA shown below the config region (app + guided branches). */
function RunCta({ onRun }: { onRun: () => void }) {
  const credits = useStore((s) => s.credits)
  const template = useStore((s) => s.template())
  const cost = template === 'video' ? RUN_COST : IMG_RUN_COST
  return (
    <div className="mt-4">
      <button
        onClick={onRun}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-95"
      >
        <Play size={18} /> Run
      </button>
      <div className="mt-2 text-center text-xs text-ink-faint">
        ~{cost} credits · {credits} free
      </div>
    </div>
  )
}
