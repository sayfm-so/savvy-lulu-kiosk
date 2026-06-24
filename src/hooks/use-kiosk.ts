import { useCallback, useRef, useState } from 'react'
import { clipUrl } from '../lib/clips'

// Soundboard: SM taps a button, it plays that approved clip instantly. No mic,
// no live AI. ONE reusable <audio> element (unlocked on the first tap) so every
// clip — including the second, third, … — plays reliably on iPad.
export function useKiosk() {
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback((clip: string) => {
    if (!audioRef.current) audioRef.current = new Audio()
    const a = audioRef.current
    const clear = () => setPlaying((p) => (p === clip ? null : p))
    a.onended = clear
    a.onerror = clear
    try { a.pause() } catch { /* ignore */ }
    a.src = clipUrl(clip)
    try { a.currentTime = 0 } catch { /* ignore */ }
    setPlaying(clip)
    a.play().catch(() => setPlaying(null))
  }, [])

  const stop = useCallback(() => {
    const a = audioRef.current
    if (a) { try { a.pause() } catch { /* ignore */ } }
    setPlaying(null)
  }, [])

  return { play, stop, playing }
}
