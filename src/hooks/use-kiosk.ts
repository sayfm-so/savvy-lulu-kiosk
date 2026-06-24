import { useCallback, useRef, useState } from 'react'
import type { FaceState } from '../components/RobotFace'
import { listenOnce, speechSupported, type ListenHandle } from '../lib/speech'
import { match } from '../lib/match'
import {
  ANSWER_CLIP, CATEGORY_LABEL, CLARIFY, REDIRECT, WELCOME,
  clipUrl, nextAck, type Category,
} from '../lib/clips'

export type Phase = 'splash' | 'kiosk'

// All kiosk logic lives here so the components stay pure presentation.
export function useKiosk() {
  const [phase, setPhase] = useState<Phase>('splash')
  const [face, setFace] = useState<FaceState>('idle')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState('')
  const [transcript, setTranscript] = useState('')
  const [micAvailable] = useState<boolean>(() => speechSupported())

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listenRef = useRef<ListenHandle | null>(null)
  const lastCat = useRef<Category | null>(null)

  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) { a.onended = null; a.onerror = null; a.pause(); audioRef.current = null }
  }, [])

  const playOne = (name: string) =>
    new Promise<void>((resolve) => {
      const a = new Audio(clipUrl(name))
      audioRef.current = a
      a.onended = () => resolve()
      a.onerror = () => resolve()
      a.play().catch(() => resolve())
    })

  const playSequence = useCallback(async (names: string[]) => {
    stopAudio()
    setBusy(true)
    setFace('talking')
    for (const nm of names) if (nm) await playOne(nm)
    setFace('idle')
    setBusy(false)
  }, [stopAudio])

  const answer = useCallback((cat: Category) => {
    lastCat.current = cat
    setStatus(`الموضوع: ${CATEGORY_LABEL[cat]}`)
    void playSequence([nextAck(), ANSWER_CLIP[cat]])
  }, [playSequence])

  const processQuery = useCallback((text: string) => {
    setTranscript(text)
    const r = match(text, lastCat.current)
    if (r.kind === 'approved' && r.category) { answer(r.category); return }
    if (r.kind === 'greeting') { setStatus('يا هلا فيك!'); void playSequence([WELCOME]); return }
    if (r.kind === 'clarify') { setStatus('ما لحقت عليك…'); void playSequence([CLARIFY]); return }
    setStatus('خلّني أساعدك بالفعالية'); void playSequence([REDIRECT])
  }, [answer, playSequence])

  const startListening = useCallback(() => {
    if (busy || listening) return
    if (!micAvailable) { setStatus('الصوت مو مدعوم بهالمتصفح — استخدم الأزرار') ; return }
    setTranscript('')
    setStatus('أسمعك… اسأل سؤالك')
    setListening(true)
    setFace('listening')
    listenRef.current = listenOnce({
      onInterim: (t) => setTranscript(t),
      onFinal: (t) => { setListening(false); processQuery(t) },
      onError: (err) => {
        setListening(false)
        setFace('idle')
        if (err === 'no-speech') { setStatus('ما سمعت شي — جرّب مرة ثانية'); void playSequence([CLARIFY]) }
        else if (err === 'not-allowed') setStatus('اسمح بالمايكروفون من إعدادات المتصفح')
        else if (err === 'network') setStatus('ما فيه نت للصوت — استخدم الأزرار')
        else setStatus('صار خطأ بسيط — جرّب مرة ثانية أو استخدم الأزرار')
      },
    })
  }, [busy, listening, micAvailable, processQuery, playSequence])

  const enter = useCallback(() => {
    setPhase('kiosk')
    document.documentElement.requestFullscreen?.().catch(() => {})
    void playSequence([WELCOME])
  }, [playSequence])

  return { phase, face, busy, listening, status, transcript, micAvailable, enter, startListening, answer }
}
