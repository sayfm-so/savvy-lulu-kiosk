import { fuguAnswer, ttsVoice, sttScribe } from './_lib.js'

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } }

// Recorded audio (base64) -> ElevenLabs STT -> Fugu (by lang) -> voice.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const audio = req.body?.audio
    const mime = req.body?.mime || 'audio/webm'
    const lang = req.body?.lang === 'en' ? 'en' : 'ar'
    if (!audio) return res.status(400).json({ error: 'no audio' })
    const buf = Buffer.from(audio, 'base64')
    const q = await sttScribe(buf, mime)
    if (!q || q.length < 2) return res.status(200).json({ heard: false, q: '', answer: '', audio: null })
    const answer = await fuguAnswer(q, lang)
    const out = answer ? await ttsVoice(answer, lang) : null
    res.status(200).json({ heard: true, q, answer, audio: out })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
