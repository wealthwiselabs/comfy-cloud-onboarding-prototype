import { useNavigate } from 'react-router-dom'
import { Mail, BarChart3, Plus } from 'lucide-react'
import { Logo } from '../components/Logo'
import { mediaUrl } from '../lib/media'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

/** A floating image tile in the marketing collage. */
function Tile({
  src,
  className,
  badge,
}: {
  src: string
  className?: string
  badge?: 'chart' | 'plus'
}) {
  return (
    <div
      className={`absolute overflow-hidden rounded-xl border border-border-light bg-panel shadow-2xl ${className ?? ''}`}
    >
      <img
        src={mediaUrl(src)}
        alt=""
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden'
        }}
      />
      {badge && (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/55 text-ink backdrop-blur">
          {badge === 'chart' ? <BarChart3 size={11} /> : <Plus size={11} />}
        </div>
      )}
    </div>
  )
}

export function SignIn() {
  const nav = useNavigate()
  const go = () => nav('/intake')

  return (
    <div className="flex min-h-full bg-bg">
      {/* Left — login form */}
      <div className="relative flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-20">
        <div className="absolute left-8 top-7 lg:left-10">
          <Logo className="text-2xl" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-semibold text-ink">Log in to your account</h1>
          <p className="mt-2 text-sm text-ink-dim">
            New here?{' '}
            <button onClick={go} className="font-medium text-primary hover:underline">
              Sign up
            </button>
          </p>

          <div className="mt-7 space-y-3">
            <button
              onClick={go}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border-light bg-panel py-2.5 text-sm font-medium text-ink transition hover:bg-panel-2"
            >
              <GoogleIcon /> Log in with Google
            </button>
            <button
              onClick={go}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border-light bg-panel py-2.5 text-sm font-medium text-ink transition hover:bg-panel-2"
            >
              <GitHubIcon /> Log in with GitHub
            </button>
          </div>

          <button
            onClick={go}
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-ink-dim transition hover:text-ink"
          >
            <Mail size={14} /> Use email instead
          </button>

          <p className="mt-7 text-center text-xs leading-relaxed text-ink-faint">
            By clicking &ldquo;Next&rdquo; or &ldquo;Sign Up&rdquo;, you agree to our{' '}
            <a className="text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Terms of Use
            </a>{' '}
            and{' '}
            <a className="text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Right — marketing collage */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1430] via-[#130f23] to-[#0c0c0f] lg:flex">
        <div className="relative h-[380px] w-[460px]">
          {/* central "app" panel */}
          <div className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-light bg-panel shadow-2xl">
            <div className="flex items-center border-b border-border px-3 py-2">
              <Logo className="text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-2.5">
              {[
                'result-image.jpg',
                'uc-product-photo.jpg',
                'uc-enhance-restyle.jpg',
                'showroom-1.jpg',
                'showroom-2.jpg',
                'showroom-3.jpg',
              ].map((m) => (
                <img
                  key={m}
                  src={mediaUrl(m)}
                  alt=""
                  className="h-12 w-full rounded-md object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden'
                  }}
                />
              ))}
            </div>
          </div>

          {/* floating tiles */}
          <Tile src="editorial-fashion.jpg" badge="chart" className="left-1 top-3 h-32 w-44 -rotate-6" />
          <Tile src="uc-product-photo.jpg" className="bottom-2 left-6 h-24 w-32 rotate-3" />
          <Tile src="result-image.jpg" badge="plus" className="right-0 top-8 h-36 w-28 rotate-6" />

          {/* a looping video tile */}
          <div className="absolute bottom-4 right-2 h-24 w-36 -rotate-3 overflow-hidden rounded-xl border border-border-light bg-black shadow-2xl">
            <video
              src={mediaUrl('result-video.mp4')}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="absolute bottom-12 px-6 text-center">
          <div className="text-lg font-semibold text-ink">Cloud</div>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-dim">
            Best for most users who want to work from anywhere with models verified
            for commercial license.
          </p>
        </div>
      </div>
    </div>
  )
}
