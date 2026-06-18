import clsx from 'clsx'

/**
 * Creator avatar. A single-character `avatar` (e.g. Eric = 'E') renders as a
 * gradient monogram; anything longer (emoji like 🦊) renders as-is.
 */
export function Avatar({
  avatar,
  size = 'sm',
}: {
  avatar: string
  size?: 'sm' | 'lg'
}) {
  const isMono = [...avatar].length === 1 && /[a-z]/i.test(avatar)
  const box = size === 'lg' ? 'h-14 w-14' : 'h-5 w-5'
  if (isMono) {
    return (
      <span
        className={clsx(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 font-bold text-white',
          box,
          size === 'lg' ? 'text-xl' : 'text-[10px]',
        )}
      >
        {avatar.toUpperCase()}
      </span>
    )
  }
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-panel-2',
        box,
        size === 'lg' ? 'text-2xl' : 'text-xs',
      )}
    >
      {avatar}
    </span>
  )
}
