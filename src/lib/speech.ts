// Thin wrapper over the Web Speech API (Chrome / Samsung Internet on Android).
// Needs a SECURE context (https or localhost) + internet (Google cloud STT).

export function speechSupported(): boolean {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export interface ListenHandle {
  abort: () => void
}

export interface ListenCallbacks {
  onInterim?: (text: string) => void
  onFinal: (text: string) => void
  onError: (err: string) => void
  onEnd?: () => void
}

// Start one listening turn (Najdi Arabic). Returns a handle so the caller can abort.
export function listenOnce(cb: ListenCallbacks, lang = 'ar-SA'): ListenHandle {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Ctor) {
    cb.onError('unsupported')
    return { abort: () => {} }
  }
  const rec = new Ctor()
  rec.lang = lang
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 1

  let finalText = ''
  let done = false

  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      const txt = r[0]?.transcript ?? ''
      if (r.isFinal) finalText += txt
      else interim += txt
    }
    if (interim && cb.onInterim) cb.onInterim(interim)
  }
  rec.onerror = (e) => {
    if (done) return
    done = true
    cb.onError(e.error || 'error')
  }
  rec.onend = () => {
    if (done) return
    done = true
    const t = finalText.trim()
    if (t) cb.onFinal(t)
    else cb.onError('no-speech')
    cb.onEnd?.()
  }

  try {
    rec.start()
  } catch {
    cb.onError('start-failed')
  }
  return {
    abort: () => {
      done = true
      try { rec.abort() } catch { /* ignore */ }
    },
  }
}
