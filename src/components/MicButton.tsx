// Hero voice CTA — the primary action. Wide pill, amber, gentle attract pulse.
export default function MicButton({
  onClick, busy, listening, micAvailable,
}: {
  onClick: () => void
  busy: boolean
  listening: boolean
  micAvailable: boolean
}) {
  const label = busy ? 'أبشر…' : listening ? 'أسمعك…' : micAvailable ? 'اضغط واسأل' : 'استخدم الأزرار تحت'
  const emoji = busy ? '💬' : listening ? '👂' : '🎙️'
  const idle = !busy && !listening && micAvailable

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || !micAvailable}
      aria-label="اضغط واسأل صوتاً"
      aria-pressed={listening}
      className={`voice-cta btn-press focus-ring shrink-0 flex items-center gap-3 rounded-full
        h-16 px-8 text-xl font-extrabold ${listening ? 'is-listening' : ''} ${idle ? 'voice-idle' : ''}`}
      style={{ opacity: busy || !micAvailable ? 0.5 : 1 }}
    >
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
