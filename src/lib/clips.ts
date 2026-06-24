// Bilingual clip manifest (AR = Ali Ahmed, EN = Brian) for Lulu Let's Connect 2026.

export type Category = 'what' | 'when' | 'where' | 'products' | 'offers' | 'social'
export type Lang = 'ar' | 'en'

export const ACKS = ['ack_1', 'ack_2', 'ack_3', 'ack_4'] // short welcoming acks (AR only)

export function welcomeClip(lang: Lang): string {
  return lang === 'en' ? 'welcome_en' : 'welcome'
}
export function answerClip(cat: Category, lang: Lang): string {
  return lang === 'en' ? `${cat}_en` : cat
}

export const TOPICS: { cat: Category; ar: string; en: string; icon: string }[] = [
  { cat: 'what', ar: 'وش هي الفعالية؟', en: 'What is the event?', icon: '🎉' },
  { cat: 'when', ar: 'متى العروض؟', en: 'When are the offers?', icon: '📅' },
  { cat: 'where', ar: 'وين الفروع؟', en: 'Where can I go?', icon: '📍' },
  { cat: 'products', ar: 'وش المنتجات؟', en: 'What products?', icon: '🛍️' },
  { cat: 'offers', ar: 'العروض والخصومات', en: 'Offers & discounts', icon: '🏷️' },
  { cat: 'social', ar: 'التصوير والسوشيال', en: 'Photos & social', icon: '📸' },
]

export const CAT_LABEL: Record<Lang, Record<Category, string>> = {
  ar: { what: 'الفعالية', when: 'التواريخ', where: 'الفروع', products: 'المنتجات', offers: 'العروض والخصومات', social: 'التصوير والسوشيال' },
  en: { what: 'the event', when: 'the dates', where: 'the branches', products: 'products', offers: 'offers & discounts', social: 'photos & social' },
}

// UI strings per language
export const UI = {
  ar: {
    eyebrow: 'مضيف لولو ليتس كونيكت ٢٠٢٦',
    title: 'مستر سافي',
    splashSub: 'اسألني عن الفعالية، صوتاً أو باللمس',
    dates: '٢٥ يونيو – ٥ يوليو · أضخم حدث تقني',
    start: 'ابدأ',
    micIdle: 'اضغط واسأل', micListen: 'أسمعك…', micBusy: 'أبشر…',
    ask: 'اسأل', placeholder: 'اكتب سؤالك لمستر سافي…',
    pickTopic: 'أو اختر موضوع', topic: (l: string) => `الموضوع: ${l}`,
    thinking: 'أبشر، لحظة…', listening: 'أسمعك… اسأل سؤالك، واضغط مرة ثانية لمّا تخلص',
    noHear: 'ما سمعت سؤالك — جرّب مرة ثانية أو اختر موضوع.',
    noNet: 'ما فيه اتصال — استخدم الأزرار تحت.',
  },
  en: {
    eyebrow: 'Host of Lulu Let’s Connect 2026',
    title: 'Mr Savvy',
    splashSub: 'Ask me about the event, by voice or touch',
    dates: 'June 25 – July 5 · the biggest tech event',
    start: 'Start',
    micIdle: 'Tap & ask', micListen: 'Listening…', micBusy: 'One sec…',
    ask: 'Ask', placeholder: 'Type your question for Mr Savvy…',
    pickTopic: 'or pick a topic', topic: (l: string) => `Topic: ${l}`,
    thinking: 'One second…', listening: 'Listening… ask your question, tap again when done',
    noHear: 'I didn’t catch that — try again or pick a topic.',
    noNet: 'No connection — use the buttons below.',
  },
} as const

let ackIdx = 0
export function nextAck(): string {
  const a = ACKS[ackIdx % ACKS.length]
  ackIdx += 1
  return a
}

export function clipUrl(name: string): string {
  return `${import.meta.env.BASE_URL}clips/${name}.wav`
}
