/// <reference types="vite/client" />

// Minimal Web Speech API typings (Chrome / Samsung Internet use webkit prefix).
interface SpeechRecognitionResultLike {
  0: { transcript: string; confidence: number }
  isFinal: boolean
  length: number
}
interface SpeechRecognitionEventLike extends Event {
  results: { length: number; [i: number]: SpeechRecognitionResultLike }
  resultIndex: number
}
interface SpeechRecognitionErrorLike extends Event {
  error: string
  message?: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null
  onend: ((e: Event) => void) | null
  onstart: ((e: Event) => void) | null
  onspeechend: ((e: Event) => void) | null
}
interface Window {
  SpeechRecognition?: { new (): SpeechRecognitionLike }
  webkitSpeechRecognition?: { new (): SpeechRecognitionLike }
}
