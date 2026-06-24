import { useCallback, useRef, useState } from 'react'
import type { FaceState } from '../components/face-state'
import {
  ANSWER_CLIP, CATEGORY_LABEL, WELCOME, clipUrl, fileUrl, nextAck, type Category,
} from '../lib/clips'

export type Phase = 'splash' | 'kiosk'

// The 6 approved topics play pre-rendered clips (instant, grounded). Free-text
// and voice questions go LIVE: backend relay -> Fugu (grounded) -> Ali Ahmed.
export function useKiosk() {
  const [phase, setPhase] = useState<Phase>('splash')
  const [face, setFace] = useState<FaceState>('idle')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('')
  const [transcript, setTranscript] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) { a.onended = null; a.pause(); audioRef.current = null }
  }, [])

  const playUrl = (url: string) =>
    new Promise<void>((resolve) => {
      const a = new Audio(url)
      audioRef.current = a
      a.onended = () => resolve()
      a.onerror = () => resolve()
      a.play().catch(() => resolve())
    })

  // play approved clips (welcome / ack+answer)
  const playClips = useCallback(async (names: string[]) => {
    stopAudio(); setBusy(true); setFace('talking')
    for (const n of names) if (n) await playUrl(clipUrl(n))
    setFace('idle'); setBusy(false)
  }, [stopAudio])

  const answer = useCallback((cat: Category) => {
    setStatus(`الموضوع: ${CATEGORY_LABEL[cat]}`)
    void playClips([nextAck(), ANSWER_CLIP[cat]])
  }, [playClips])

  // scripted English opening speech (operator-triggered)
  const playSpeech = useCallback(async (file: string) => {
    if (busy) return
    stopAudio(); setBusy(true); setTranscript(''); setStatus('🎤 خطاب الافتتاح…'); setFace('talking')
    await playUrl(fileUrl(file))
    setFace('idle'); setBusy(false)
  }, [busy, stopAudio])

  // live answer audio (base64 mp3 from the backend)
  const playB64 = (b64: string) =>
    new Promise<void>((resolve) => {
      const a = new Audio(`data:audio/mpeg;base64,${b64}`)
      audioRef.current = a
      a.onended = () => resolve()
      a.onerror = () => resolve()
      a.play().catch(() => resolve())
    })

  // free-text question -> live brain
  const askText = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    stopAudio(); setBusy(true); setTranscript(q); setStatus('أبشر، لحظة…'); setFace('talking')
    try {
      const r = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }),
      })
      const d = await r.json()
      if (d.answer) setStatus(d.answer)
      if (d.audio) await playB64(d.audio)
      else setStatus('ما قدرت أجاوب الحين — جرّب مرة ثانية أو اختر موضوع تحت.')
    } catch {
      setStatus('ما فيه اتصال بالخادم — استخدم الأزرار تحت.')
    }
    setFace('idle'); setBusy(false)
  }, [busy, stopAudio])

  // voice: tap to start, tap again to stop -> record -> backend (STT+brain+voice)
  const toggleRecord = useCallback(async () => {
    if (busy) return
    if (recording) { recRef.current?.stop(); return }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setStatus('اسمح بالمايكروفون، أو استخدم الأزرار تحت.')
      return
    }
    const mime = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    recRef.current = rec
    chunksRef.current = []
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      setRecording(false)
      setBusy(true); setFace('talking'); setStatus('أبشر، لحظة…')
      try {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || 'audio/webm' })
        const b64 = await blobToB64(blob)
        const r = await fetch('/api/voice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: b64, mime: rec.mimeType || mime }),
        })
        const d = await r.json()
        if (!d.heard) { setStatus('ما سمعت سؤالك — جرّب مرة ثانية أو اختر موضوع.') }
        else {
          setTranscript(d.q || '')
          if (d.answer) setStatus(d.answer)
          if (d.audio) await playB64(d.audio)
        }
      } catch {
        setStatus('ما فيه اتصال بالخادم — استخدم الأزرار تحت.')
      }
      setFace('idle'); setBusy(false)
    }
    setTranscript(''); setStatus('أسمعك… اسأل سؤالك، واضغط مرة ثانية لمّا تخلص')
    setFace('listening'); setRecording(true)
    rec.start()
    // safety auto-stop after 12s
    setTimeout(() => { if (recRef.current === rec && rec.state === 'recording') rec.stop() }, 12000)
  }, [busy, recording])

  const enter = useCallback(() => {
    setPhase('kiosk')
    document.documentElement.requestFullscreen?.().catch(() => {})
    void playClips([WELCOME])
  }, [playClips])

  return { phase, face, busy, recording, status, transcript, enter, answer, askText, toggleRecord, playSpeech }
}

function blobToB64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1] || '')
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}
