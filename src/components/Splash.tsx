import VoiceOrb from './VoiceOrb'

// Entry screen — also the user gesture that unlocks audio playback.
export default function Splash({ onStart }: { onStart: () => void }) {
  return (
    <main className="h-full w-full flex flex-col items-center justify-center text-center px-6">
      <VoiceOrb state="idle" />
      <p className="eyebrow text-sm mt-4" style={{ color: 'var(--accent)' }}>
        مضيف لولو ليتس كونيكت ٢٠٢٦
      </p>
      <h1 className="display text-5xl sm:text-6xl mt-2" style={{ color: 'var(--ink)' }}>
        مستر سافي
      </h1>
      <p className="mt-3 text-base sm:text-lg" style={{ color: 'var(--muted)' }}>
        اسألني عن الفعالية، صوتاً أو باللمس
      </p>
      <button
        type="button"
        onClick={onStart}
        className="voice-cta voice-idle btn-press focus-ring mt-9 rounded-full px-12 py-5 text-2xl font-extrabold"
      >
        ابدأ
      </button>
      <p className="mt-6 text-xs" style={{ color: 'var(--muted)' }}>
        ٢٥ يونيو – ٥ يوليو · أضخم حدث تقني في لولو هايبر ماركت
      </p>
    </main>
  )
}
