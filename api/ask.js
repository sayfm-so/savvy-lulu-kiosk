import { fuguAnswer, ttsAliAhmed } from './_lib.js'

// Text question -> Fugu (grounded) -> Ali Ahmed voice. Returns {answer, audio(base64 mp3)}.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const q = (req.body?.q || '').toString().trim()
    if (!q) return res.status(400).json({ error: 'no question' })
    const answer = await fuguAnswer(q)
    const audio = answer ? await ttsAliAhmed(answer) : null
    res.status(200).json({ q, answer, audio })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
