import type { FaceState } from './face-state'

export type { FaceState }

// Avatar = the user's ACTUAL robot photo (100% likeness), brought to life:
// a gentle float + a continuous subtle 3D tilt (parallax depth) + a glow over
// the face that breathes/pulses and reacts to listening/talking. Not a flat
// static image, and exactly his robot.
export default function RobotFace({ state }: { state: FaceState }) {
  return (
    <div className={`face-wrap face-${state}`} aria-hidden="true">
      <span className="aura" />
      <span className="ring" />
      <span className="ring r2" />
      <div className="tilt-wrap">
        <img className="robot-photo" src={`${import.meta.env.BASE_URL}savvy-robot.jpg`} alt="مستر سافي" />
      </div>
      <span className="face-glow" />
    </div>
  )
}
