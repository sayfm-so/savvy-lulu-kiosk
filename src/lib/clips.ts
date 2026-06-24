// Clip manifest + the six approved Lulu Let's Connect 2026 categories.
// Audio files live in public/clips/ (Ali Ahmed, eleven_v3, 0.90 — SM-approved).

export type Category = 'what' | 'when' | 'where' | 'products' | 'offers' | 'social'

export const WELCOME = 'welcome'
export const ENDING = 'ending'
export const REDIRECT = 'redirect'
export const CLARIFY = 'clarify'
export const ACKS = ['ack_1', 'ack_2', 'ack_3', 'ack_4']

// The answer clip basename per category == the category name here.
export const ANSWER_CLIP: Record<Category, string> = {
  what: 'what',
  when: 'when',
  where: 'where',
  products: 'products',
  offers: 'offers',
  social: 'social',
}

// The six big touch buttons (the bulletproof, offline path).
export const TOPICS: { cat: Category; label: string; icon: string }[] = [
  { cat: 'what', label: 'وش هي الفعالية؟', icon: '🎉' },
  { cat: 'when', label: 'متى العروض؟', icon: '📅' },
  { cat: 'where', label: 'وين الفروع؟', icon: '📍' },
  { cat: 'products', label: 'وش المنتجات؟', icon: '🛍️' },
  { cat: 'offers', label: 'العروض والخصومات', icon: '🏷️' },
  { cat: 'social', label: 'التصوير والسوشيال', icon: '📸' },
]

export const CATEGORY_LABEL: Record<Category, string> = {
  what: 'الفعالية',
  when: 'التواريخ',
  where: 'الفروع',
  products: 'المنتجات',
  offers: 'العروض والخصومات',
  social: 'التصوير والسوشيال',
}

let ackIdx = 0
export function nextAck(): string {
  const a = ACKS[ackIdx % ACKS.length]
  ackIdx += 1
  return a
}

export function clipUrl(name: string): string {
  return `${import.meta.env.BASE_URL}clips/${name}.wav`
}

export function fileUrl(file: string): string {
  return `${import.meta.env.BASE_URL}clips/${file}`
}

// Scripted English opening speeches (operator-triggered, verbatim, Brian voice).
export const SPEECHES = [
  { id: 'welcome', label: 'خطاب الترحيب', file: 'welcome_speech.mp3' },
  { id: 'logo', label: 'إعلان الشعار', file: 'logo_reveal.mp3' },
]
