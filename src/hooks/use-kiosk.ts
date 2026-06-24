import { useCallback, useRef, useState } from 'react'
import type { FaceState } from '../components/face-state'
import {
  CAT_LABEL, UI, answerClip, clipUrl, nextAck, welcomeClip,
  type Category, type Lang,
} from '../lib/clips'

export type Phase = 'splash' | 'kiosk'

// ONE reusable <audio> element, unlocked on the first user gesture (Start), then
// reused for every clip + live answer — this is what makes a second sound play
// reliably (iOS blocks fresh elements created after the first gesture).
export function useKiosk() {
  const [phase, setPhase] = useState<Phase>('splash')
  const [lang, setLang] = useState<Lang>('ar')
  const [face, setFace] = useState<FaceState>('idle')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('')
  const [transcript, setTranscript] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const langRef = useRef<Lang>('ar')
  langRef.current = lang

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  // play one source on the single element; ALWAYS resolves (no hang)
  const playSrc = (src: string) =>
    new Promise<void>((resolve) => {
      const a = getAudio()
      a.onended = () => resolve()
      a.onerror = () => resolve()
      try { a.pause() } catch { /* ignore */ }
      a.src = src
      try { a.currentTime = 0 } catch { /* ignore */ }
      a.play().catch(() => resolve())
    })

  const runSeq = useCallback(async (srcs: string[]) => {
    setBusy(true); setFace('talking')
    try { for (const s of srcs) if (s) await playSrc(s) }
    finally { setFace('idle'); setBusy(false) }
  }, [])

  const playB64 = (b64: string) => playSrc(`data:audio/mpeg;base64,${b64}`)

  const answer = useCallback((cat: Category) => {
    if (busy) return
    const l = langRef.current
    setTranscript(''); setStatus(UI[l].topic(CAT_LABEL[l][cat]))
    const seq = l === 'ar'
      ? [clipUrl(nextAck()), clipUrl(answerClip(cat, 'ar'))]
      : [clipUrl(answerClip(cat, 'en'))]
    void runSeq(seq)
  }, [busy, runSeq])

  const askText = useCallback(async (text: string) => {
    const q = text.trim(); if (!q || busy) return
    const l = langRef.current
    setBusy(true); setTranscript(q); setStatus(UI[l].thinking); setFace('talking')
    try {
      const r = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, lang: l }),
      })
      const d = await r.json()
      if (d.answer) setStatus(d.answer)
      if (d.audio) await playB64(d.audio)
      else if (!d.answer) setStatus(UI[l].noNet)
    } catch { setStatus(UI[l].noNet) }
    setFace('idle'); setBusy(false)
  }, [busy])

  const toggleRecord = useCallback(async () => {
    if (busy) return
    if (recording) { recRef.current?.stop(); return }
    const l = langRef.current
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) }
    catch { setStatus(UI[l].noNet); return }
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    recRef.current = rec; chunksRef.current = []
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach((x) => x.stop())
      setRecording(false); setBusy(true); setFace('talking'); setStatus(UI[l].thinking)
      try {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || 'audio/webm' })
        const b64 = await blobToB64(blob)
        const r = await fetch('/api/voice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: b64, mime: rec.mimeType || mime, lang: l }),
        })
        const d = await r.json()
        if (!d.heard) setStatus(UI[l].noHear)
        else { setTranscript(d.q || ''); if (d.answer) setStatus(d.answer); if (d.audio) await playB64(d.audio) }
      } catch { setStatus(UI[l].noNet) }
      setFace('idle'); setBusy(false)
    }
    setTranscript(''); setStatus(UI[l].listening); setFace('listening'); setRecording(true); rec.start()
    setTimeout(() => { if (recRef.current === rec && rec.state === 'recording') rec.stop() }, 12000)
  }, [busy, recording])

  const enter = useCallback(() => {
    setPhase('kiosk')
    document.documentElement.requestFullscreen?.().catch(() => {})
    void runSeq([clipUrl(welcomeClip(langRef.current))]) // also unlocks the element
  }, [runSeq])

  return {
    phase, lang, setLang, ui: UI[lang], face, busy, recording, status, transcript,
    enter, answer, askText, toggleRecord,
  }
}

function blobToB64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1] || '')
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}
