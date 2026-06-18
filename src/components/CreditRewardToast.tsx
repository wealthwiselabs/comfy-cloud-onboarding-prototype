import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

export function CreditRewardToast() {
  const rewardToast = useStore((s) => s.rewardToast)
  const clearReward = useStore((s) => s.clearReward)

  useEffect(() => {
    if (!rewardToast) return
    const t = window.setTimeout(clearReward, 2600)
    return () => window.clearTimeout(t)
  }, [rewardToast, clearReward])

  if (!rewardToast) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadein_0.2s_ease-out]">
      <div className="flex items-center gap-2 rounded-full border border-comfy/40 bg-panel px-4 py-2 text-sm font-semibold text-comfy shadow-2xl">
        <Sparkles size={15} /> {rewardToast}
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  )
}
