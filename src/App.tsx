import { useState } from 'react'
import BrandBar from './components/BrandBar'
import MicButton from './components/MicButton'
import VoiceOrb from './components/VoiceOrb'
import Splash from './components/Splash'
import StatusDisplay from './components/StatusDisplay'
import TopicGrid from './components/TopicGrid'
import { SPEECHES } from './lib/clips'
import { useKiosk } from './hooks/use-kiosk'

export default function App() {
  const k = useKiosk()
  const [text, setText] = useState('')

  if (k.phase === 'splash') return <Splash onStart={k.enter} />

  const onAsk = (e: React.FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    void k.askText(t)
  }

  return (
    <div className="h-full w-full flex flex-col items-center px-4 py-3 gap-2">
      <BrandBar />

      <section className="flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <VoiceOrb state={k.face} />
        <StatusDisplay status={k.status} transcript={k.transcript} />
      </section>

      <MicButton onClick={k.toggleRecord} busy={k.busy} listening={k.recording} micAvailable={true} />

      {/* ask anything (text) — works on every device incl. iPad */}
      <form onSubmit={onAsk} className="w-full max-w-xl flex gap-2 mb-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={k.busy || k.recording}
          placeholder="اكتب سؤالك لمستر سافي…"
          className="ask-input flex-1 rounded-full px-5 py-3 text-base outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={k.busy || k.recording || !text.trim()}
          className="btn-press focus-ring rounded-full px-6 py-3 font-extrabold disabled:opacity-40"
          style={{ background: 'var(--gold)', color: 'var(--accent-ink)' }}
        >
          اسأل
        </button>
      </form>

      {/* scripted English opening speeches (operator-triggered) */}
      <div className="w-full max-w-xl flex gap-2">
        {SPEECHES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => k.playSpeech(s.file)}
            disabled={k.busy || k.recording}
            className="btn-press focus-ring glass flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
          >
            🎤 {s.label} <span style={{ color: 'var(--muted)' }}>· EN</span>
          </button>
        ))}
      </div>

      <TopicGrid onPick={k.answer} disabled={k.busy || k.recording} />
    </div>
  )
}
