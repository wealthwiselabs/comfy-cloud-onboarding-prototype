import clsx from 'clsx'

/** Comfy wordmark — yellow, slightly condensed. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'font-bold tracking-tight text-comfy select-none',
        className,
      )}
      style={{ fontStyle: 'italic' }}
    >
      Comfy
    </span>
  )
}
