import { LayoutTemplate } from 'lucide-react'
import { useStore } from '../store/useStore'
import { AgentCanvas } from '../components/build/AgentCanvas'

export function Build() {
  const selectedWorkflow = useStore((s) => s.selectedWorkflow)
  const clearWorkflow = useStore((s) => s.clearWorkflow)
  const openTemplates = useStore((s) => s.openTemplates)

  // No template chosen yet (e.g. landed on /build directly) — prompt the browser.
  if (!selectedWorkflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <LayoutTemplate size={28} className="text-ink-faint" />
        <p className="text-sm text-ink-dim">Pick a template to start building.</p>
        <button
          onClick={openTemplates}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          Browse templates
        </button>
      </div>
    )
  }

  return <AgentCanvas workflow={selectedWorkflow} onExit={clearWorkflow} />
}
