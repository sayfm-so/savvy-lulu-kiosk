// Shared backend helpers (not an endpoint — leading underscore).
// Keys come from Vercel env: SAKANA_API_KEY, ELEVENLABS_API_KEY.

export const ALI_AHMED = 'OoE8swS3hImZANNOodf6'

// Mr Savvy — Lulu Let's Connect 2026 host. Najdi, grounded, no invention.
export const LULU_SYSTEM = [
  'أنت «مستر سافي»، مضيف فعالية «لولو ليتس كونيكت ٢٠٢٦» في لولو هايبر ماركت.',
  'تكلّم بعامية سعودية نجدية، ودود ومختصر (جملتين لين ثلاث)، منطوق بدون رموز ولا قوائم.',
  'معلومات الفعالية المعتمدة فقط:',
  '- مهرجان تقني كبير.',
  '- التواريخ: من ٢٥ يونيو لين ٥ يوليو ٢٠٢٦.',
  '- المكان: فروع لولو هايبر ماركت المشاركة بالسعودية.',
  '- المنتجات: جوالات، لابتوبات، أجهزة ذكاء اصطناعي، بلايستيشن وألعاب، شاشات ذكية، سماعات وأنظمة صوت، ساعات ذكية، ابتكارات البيوت الذكية.',
  '- العروض: خصومات وعروض حصرية من أشهر البراندات، وبعض الصفقات حصرية بالويكند.',
  '- التصوير: شجّع الزوار يصوّرون ويشاركون على السوشيال ويستخدمون هاشتاق الفعالية ويذكرون حساب لولو الرسمي.',
  'قواعد صارمة (مهمة لأنها فعالية عميل):',
  '- لا تخترع أسعاراً محددة ولا نسب خصم محددة.',
  '- لا تخترع هاشتاق محدد — قل «هاشتاق الفعالية».',
  '- لا تؤكّد فروعاً بعينها ولا «كل الفروع» — قل «الفروع المشاركة».',
  '- لا تتكلم عن أي شيء خارج لولو ليتس كونيكت؛ أي سؤال خارج الموضوع رجّعه بلطف لمواضيع الفعالية.',
  '- لا أمن سيبراني ولا مواضيع ثانية. إنت مضيف لولو فقط.',
].join('\n')

export async function fuguAnswer(q) {
  const key = process.env.SAKANA_API_KEY
  const r = await fetch('https://api.sakana.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'fugu-ultra',
      stream: false,
      messages: [
        { role: 'system', content: LULU_SYSTEM },
        { role: 'user', content: q },
      ],
    }),
  })
  if (!r.ok) throw new Error(`fugu ${r.status}: ${await r.text()}`)
  const d = await r.json()
  return (d?.choices?.[0]?.message?.content || '').trim()
}

export async function ttsAliAhmed(text) {
  const key = process.env.ELEVENLABS_API_KEY
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ALI_AHMED}?output_format=mp3_44100_128`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, speed: 0.9, use_speaker_boost: true },
    }),
  })
  if (!r.ok) throw new Error(`tts ${r.status}: ${await r.text()}`)
  const buf = Buffer.from(await r.arrayBuffer())
  return buf.toString('base64')
}

export async function sttScribe(audioBuf, mime) {
  const key = process.env.ELEVENLABS_API_KEY
  const fd = new FormData()
  fd.append('model_id', 'scribe_v1')
  fd.append('file', new Blob([audioBuf], { type: mime || 'audio/webm' }), 'q')
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: fd,
  })
  if (!r.ok) throw new Error(`stt ${r.status}: ${await r.text()}`)
  const d = await r.json()
  return (d?.text || '').trim()
}
