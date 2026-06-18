import { Sparkles, Check, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Lesson } from '../../types'

export function LessonPopover({
  lesson,
  onClose,
}: {
  lesson: Lesson
  onClose: () => void
}) {
  const completeLesson = useStore((s) => s.completeLesson)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[360px] rounded-xl border border-border-light bg-panel p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-ink">
            What&apos;s a {lesson.concept}?
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-dim">{lesson.blurb}</p>
        <button
          onClick={() => {
            completeLesson(lesson.id)
            onClose()
          }}
          disabled={lesson.done}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {lesson.done ? (
            <>
              <Check size={14} /> Completed
            </>
          ) : (
            <>
              <Sparkles size={14} /> +{lesson.reward} credits — Got it
            </>
          )}
        </button>
      </div>
    </div>
  )
}
