import type { FaceState } from './face-state'

// Replaces the on-screen robot face (the real robot head sits above the chest
// tablet). A clean premium voice indicator: a glowing orb + equalizer that
// breathes when idle, ripples when listening, and animates when talking.
export default function VoiceOrb({ state }: { state: FaceState }) {
  return (
    <div className={`orb-wrap orb-${state}`} aria-hidden="true">
      <span className="orb-halo" />
      <span className="orb-ring" />
      <span className="orb-ring r2" />
      <div className="orb-core">
        <div className="eq">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`eq-bar b${i}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
