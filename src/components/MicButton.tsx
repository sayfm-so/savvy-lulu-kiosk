// Hero voice CTA — tap to record, tap again to stop (works on iPad).
export default function MicButton({
  onClick, busy, listening, ui,
}: {
  onClick: () => void
  busy: boolean
  listening: boolean
  ui: { micIdle: string; micListen: string; micBusy: string }
}) {
  const label = busy ? ui.micBusy : listening ? ui.micListen : ui.micIdle
  const emoji = busy ? '💬' : listening ? '👂' : '🎙️'
  const idle = !busy && !listening

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={listening}
      className={`voice-cta btn-press focus-ring shrink-0 flex items-center gap-3 rounded-full h-16 px-8 text-xl font-extrabold ${listening ? 'is-listening' : ''} ${idle ? 'voice-idle' : ''}`}
      style={{ opacity: busy ? 0.5 : 1 }}
    >
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
