import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../store/useStore'
import { Logo } from '../components/Logo'
import { mediaUrl } from '../lib/media'
import { USE_CASES } from '../data/seed'
import { RoleStep } from '../components/wizard/RoleStep'
import { UseCaseStep } from '../components/wizard/UseCaseStep'
import { SkillStep } from '../components/wizard/SkillStep'

const STEPS = ['Your role', 'Your goal', 'Your skill']
const USER_NAME = 'Eric'

export function Intake() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [welcomed, setWelcomed] = useState(false)

  const intake = useStore((s) => s.intake)
  const setRole = useStore((s) => s.setRole)
  const setRoleOther = useStore((s) => s.setRoleOther)
  const setUseCase = useStore((s) => s.setUseCase)
  const setOutput = useStore((s) => s.setOutput)
  const setSkill = useStore((s) => s.setSkill)

  // per-step "can advance" guard
  const valid = [
    intake.role !== null,
    intake.useCase !== null && intake.output !== null,
    intake.skill !== null,
  ]

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else nav('/studio')
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  // auto-advance to the next step shortly after a selection (so the highlight
  // registers); the last step lands in the editor
  const advance = (from: number) => {
    window.setTimeout(() => {
      if (from < STEPS.length - 1) setStep(from + 1)
      else nav('/studio')
    }, 180)
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-bg">
      {/* aurora glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-[110px]" />
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-comfy/10 blur-[110px]" />
      </div>

      <header className="relative flex items-center justify-between border-b border-border px-6 py-4">
        <Logo className="text-lg" />
        <div className="flex items-center gap-1.5 rounded-full border border-border-light bg-panel-2 px-3 py-1 text-sm">
          <Sparkles size={14} className="text-comfy" />
          <span className="font-semibold">400 free credits to start</span>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        {/* progress — numbered stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  i <= step ? 'bg-primary text-white' : 'bg-panel-2 text-ink-faint',
                )}
              >
                {i + 1}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium',
                  i === step
                    ? 'text-ink'
                    : i < step
                      ? 'text-ink-dim'
                      : 'text-ink-faint',
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-px w-6 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1">
          {step === 0 && (
            <RoleStep
              value={intake.role}
              onSelect={(r) => {
                setRole(r)
                if (r !== 'other') advance(0)
              }}
              roleOther={intake.roleOther}
              onRoleOther={setRoleOther}
            />
          )}
          {step === 1 && (
            <UseCaseStep
              role={intake.role}
              value={intake.useCase}
              output={intake.output}
              onSelect={(u) => {
                setUseCase(u)
                // ambiguous use-cases wait for a format chip before advancing
                if (!USE_CASES.find((x) => x.id === u)?.ambiguous) advance(1)
              }}
              onPickModality={(o) => {
                setOutput(o)
                advance(1)
              }}
            />
          )}
          {step === 2 && (
            <SkillStep
              value={intake.skill}
              onSelect={(s) => {
                setSkill(s)
                advance(2)
              }}
            />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className={clsx(
              'flex items-center gap-1.5 text-sm',
              step === 0 ? 'invisible' : 'text-ink-dim hover:text-ink',
            )}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={next}
            disabled={!valid[step]}
            className={clsx(
              'flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition',
              valid[step]
                ? 'bg-primary text-white hover:brightness-95'
                : 'cursor-not-allowed bg-panel-2 text-ink-faint',
            )}
          >
            {step < STEPS.length - 1 ? 'Continue' : 'Start creating'}
          </button>
        </div>
      </div>

      {!welcomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-light bg-panel p-7 text-center shadow-2xl">
            <img
              src={mediaUrl('comfy-logo.png')}
              alt="Comfy"
              className="mx-auto h-7 w-auto"
            />
            <h2 className="mt-5 text-xl font-semibold text-ink">
              Welcome to Comfy Cloud, {USER_NAME}!
            </h2>
            <p className="mt-2 text-sm text-ink-dim">
              Let&apos;s set it up for your needs — three quick questions and
              you&apos;ll be creating in under a minute.
            </p>
            <button
              onClick={() => setWelcomed(true)}
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Get started
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
