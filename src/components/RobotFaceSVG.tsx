import type { FaceState } from './face-state'

// 2D fallback (used only if WebGL is unavailable). The primary face is RobotHead3D.
export default function RobotFaceSVG({ state }: { state: FaceState }) {
  return (
    <svg className={`face-svg face-${state}`} viewBox="0 0 320 340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.70 0.12 165)" />
          <stop offset="0.18" stopColor="oklch(0.58 0.12 165)" />
          <stop offset="1" stopColor="oklch(0.34 0.09 168)" />
        </linearGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="oklch(0.24 0.05 172)" />
          <stop offset="1" stopColor="oklch(0.13 0.035 175)" />
        </linearGradient>
        <radialGradient id="eyeg" cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor="oklch(0.97 0.10 178)" />
          <stop offset="1" stopColor="oklch(0.82 0.16 178)" />
        </radialGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="160" cy="312" rx="92" ry="16" fill="oklch(0.10 0.03 170 / 0.45)" />
      <rect x="46" y="56" width="228" height="218" rx="58" fill="url(#shell)" />
      <rect x="74" y="84" width="172" height="160" rx="44" fill="url(#visor)" />
      <g filter="url(#glow)">
        <rect className="eye" x="108" y="132" width="26" height="46" rx="13" fill="url(#eyeg)" />
        <rect className="eye" x="186" y="132" width="26" height="46" rx="13" fill="url(#eyeg)" />
      </g>
      <path className="mouth-rest" d="M132 206 Q160 224 188 206" stroke="oklch(0.88 0.12 178)"
            strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#glow)" />
    </svg>
  )
}
