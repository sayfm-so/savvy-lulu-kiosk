import { useState } from 'react'
import BrandBar from './components/BrandBar'
import MicButton from './components/MicButton'
import VoiceOrb from './components/VoiceOrb'
import Splash from './components/Splash'
import StatusDisplay from './components/StatusDisplay'
import TopicGrid from './components/TopicGrid'
import { useKiosk } from './hooks/use-kiosk'

export default function App() {
  const k = useKiosk()
  const [text, setText] = useState('')

  if (k.phase === 'splash') {
    return <Splash ui={k.ui} lang={k.lang} setLang={k.setLang} onStart={k.enter} />
  }

  const onAsk = (e: React.FormEvent) => {
    e.preventDefault()
    const v = text.trim()
    if (!v) return
    setText('')
    void k.askText(v)
  }

  return (
    <div dir={k.lang === 'ar' ? 'rtl' : 'ltr'} className="h-full w-full flex flex-col items-center px-4 py-3 gap-2">
      <BrandBar lang={k.lang} setLang={k.setLang} />

      <section className="flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <VoiceOrb state={k.face} />
        <StatusDisplay status={k.status} transcript={k.transcript} />
      </section>

      <MicButton onClick={k.toggleRecord} busy={k.busy} listening={k.recording} ui={k.ui} />

      <form onSubmit={onAsk} className="w-full max-w-xl flex gap-2 mb-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={k.busy || k.recording}
          placeholder={k.ui.placeholder}
          className="ask-input flex-1 rounded-full px-5 py-3 text-base outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={k.busy || k.recording || !text.trim()}
          className="btn-press focus-ring rounded-full px-6 py-3 font-extrabold disabled:opacity-40"
          style={{ background: 'var(--gold)', color: 'var(--accent-ink)' }}
        >
          {k.ui.ask}
        </button>
      </form>

      <TopicGrid lang={k.lang} pickLabel={k.ui.pickTopic} onPick={k.answer} disabled={k.busy || k.recording} />
    </div>
  )
}
