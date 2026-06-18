import clsx from 'clsx'
import { useStore } from '../../store/useStore'
import { TEMPLATE_MEDIA } from '../../data/seed'
import { mediaUrl } from '../../lib/media'
import type { WorkflowField } from '../../types'

export function FieldsPanel({ highlight = false }: { highlight?: boolean }) {
  const fields = useStore((s) => s.fields)
  const editField = useStore((s) => s.editField)
  const inputImg = mediaUrl(useStore((s) => s.inputImage()))

  return (
    <div
      className={clsx(
        'rounded-xl border bg-panel p-4',
        highlight ? 'border-primary' : 'border-border',
      )}
    >
      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <Field
            key={f.id}
            field={f}
            inputImg={inputImg}
            onChange={(v) => editField(f.id, v)}
          />
        ))}
      </div>
    </div>
  )
}

function Field({
  field,
  inputImg,
  onChange,
}: {
  field: WorkflowField
  inputImg: string
  onChange: (v: string | number) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-dim">{field.label}</span>
      {field.hint && (
        <span className="ml-2 text-[11px] text-ink-faint">{field.hint}</span>
      )}
      <div className="mt-1.5">
        {field.kind === 'image' && (
          <div className="flex items-center gap-3">
            <img
              src={inputImg}
              alt=""
              className="h-16 w-16 rounded-lg border border-border object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
            <button
              onClick={() => onChange(String(field.value))}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-ink-dim hover:text-ink"
            >
              Replace image
            </button>
          </div>
        )}
        {field.kind === 'textarea' && (
          <textarea
            value={String(field.value)}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
        )}
        {field.kind === 'slider' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={Number(field.value)}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-12 text-right text-xs tabular-nums text-ink-dim">
              {field.value}
              {field.unit}
            </span>
          </div>
        )}
        {field.kind === 'select' && (
          <select
            value={String(field.value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          >
            {field.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      </div>
    </label>
  )
}
