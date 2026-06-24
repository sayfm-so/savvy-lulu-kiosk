import VoiceOrb from './VoiceOrb'
import type { Lang } from '../lib/clips'

type Ui = { eyebrow: string; title: string; splashSub: string; dates: string; start: string }

export default function Splash({
  ui, lang, setLang, onStart,
}: {
  ui: Ui
  lang: Lang
  setLang: (l: Lang) => void
  onStart: () => void
}) {
  return (
    <main dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-full w-full flex flex-col items-center justify-center text-center px-6 relative">
      <button
        type="button"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="btn-press focus-ring glass absolute top-5 rounded-full px-4 py-1.5 text-sm font-bold"
        style={{ insetInlineEnd: '1.25rem' }}
        aria-label="Switch language"
      >
        {lang === 'ar' ? 'English' : 'عربي'}
      </button>

      <VoiceOrb state="idle" />
      <p className="eyebrow text-sm mt-4" style={{ color: 'var(--accent)' }}>{ui.eyebrow}</p>
      <h1 className="display text-5xl sm:text-6xl mt-2" style={{ color: 'var(--ink)' }}>{ui.title}</h1>
      <p className="mt-3 text-base sm:text-lg" style={{ color: 'var(--muted)' }}>{ui.splashSub}</p>
      <button
        type="button"
        onClick={onStart}
        className="voice-cta voice-idle btn-press focus-ring mt-9 rounded-full px-12 py-5 text-2xl font-extrabold"
      >
        {ui.start}
      </button>
      <p className="mt-6 text-xs" style={{ color: 'var(--muted)' }}>{ui.dates}</p>
    </main>
  )
}
