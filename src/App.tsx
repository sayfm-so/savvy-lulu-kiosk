import { BOARD } from './lib/clips'
import { useKiosk } from './hooks/use-kiosk'

export default function App() {
  const { play, stop, playing } = useKiosk()

  const Btn = ({ active, icon, label, onClick, dir }: {
    active: boolean; icon: string; label: string; onClick: () => void; dir: 'rtl' | 'ltr'
  }) => (
    <button
      type="button"
      dir={dir}
      onClick={onClick}
      className={`sb-btn btn-press focus-ring ${active ? 'sb-active' : ''}`}
    >
      <span className="text-2xl shrink-0" aria-hidden="true">{active ? '🔊' : icon}</span>
      <span className="flex-1 font-bold leading-tight" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{label}</span>
    </button>
  )

  return (
    <div className="h-full w-full flex flex-col px-4 py-3 gap-3">
      {/* header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="font-extrabold text-base sm:text-lg">مستر سافي · لولو ليتس كونيكت ٢٠٢٦</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>٢٥ يونيو – ٥ يوليو</span>
          <button
            type="button"
            onClick={stop}
            disabled={!playing}
            className="btn-press focus-ring glass rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-30"
          >
            ⏹ إيقاف
          </button>
        </div>
      </header>

      {/* board: both languages, one screen */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full max-w-4xl mx-auto min-h-0 overflow-y-auto">
        <section className="flex flex-col gap-2.5">
          <h2 className="eyebrow text-sm" style={{ color: 'var(--accent)' }}>العربية</h2>
          {BOARD.map((b) => (
            <Btn key={b.arClip} dir="rtl" icon={b.icon} label={b.ar}
              active={playing === b.arClip} onClick={() => play(b.arClip)} />
          ))}
        </section>
        <section className="flex flex-col gap-2.5">
          <h2 className="eyebrow text-sm" style={{ color: 'var(--accent)' }} dir="ltr">English</h2>
          {BOARD.map((b) => (
            <Btn key={b.enClip} dir="ltr" icon={b.icon} label={b.en}
              active={playing === b.enClip} onClick={() => play(b.enClip)} />
          ))}
        </section>
      </div>
    </div>
  )
}
