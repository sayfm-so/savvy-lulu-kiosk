import { fuguAnswer, ttsAliAhmed, sttScribe } from './_lib.js'

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } }

// Voice turn: recorded audio (base64) -> ElevenLabs STT -> Fugu -> Ali Ahmed.
// Returns {heard, q, answer, audio(base64 mp3)}.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const audio = req.body?.audio
    const mime = req.body?.mime || 'audio/webm'
    if (!audio) return res.status(400).json({ error: 'no audio' })
    const buf = Buffer.from(audio, 'base64')
    const q = await sttScribe(buf, mime)
    if (!q || q.length < 2) return res.status(200).json({ heard: false, q: '', answer: '', audio: null })
    const answer = await fuguAnswer(q)
    const out = answer ? await ttsAliAhmed(answer) : null
    res.status(200).json({ heard: true, q, answer, audio: out })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
