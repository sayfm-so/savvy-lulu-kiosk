import { fuguAnswer, ttsVoice } from './_lib.js'

// Text question -> Fugu (grounded, by lang) -> voice (Ali Ahmed AR / Brian EN).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const q = (req.body?.q || '').toString().trim()
    const lang = req.body?.lang === 'en' ? 'en' : 'ar'
    if (!q) return res.status(400).json({ error: 'no question' })
    const answer = await fuguAnswer(q, lang)
    const audio = answer ? await ttsVoice(answer, lang) : null
    res.status(200).json({ q, answer, audio })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
