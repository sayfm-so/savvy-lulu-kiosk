import BrandBar from './components/BrandBar'
import MicButton from './components/MicButton'
import VoiceOrb from './components/VoiceOrb'
import Splash from './components/Splash'
import StatusDisplay from './components/StatusDisplay'
import TopicGrid from './components/TopicGrid'
import { useKiosk } from './hooks/use-kiosk'

export default function App() {
  const k = useKiosk()

  if (k.phase === 'splash') return <Splash onStart={k.enter} />

  return (
    <div className="h-full w-full flex flex-col items-center px-4 py-3 gap-2">
      <BrandBar />

      <section className="flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <VoiceOrb state={k.face} />
        <StatusDisplay status={k.status} transcript={k.transcript} />
      </section>

      <MicButton
        onClick={k.startListening}
        busy={k.busy}
        listening={k.listening}
        micAvailable={k.micAvailable}
      />

      <TopicGrid onPick={k.answer} disabled={k.busy || k.listening} />
    </div>
  )
}
