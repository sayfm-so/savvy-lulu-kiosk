// Intent matcher for the Lulu Let's Connect 2026 kiosk — ported from the robot's
// limitless/lulu_host.py keyword layer. Runs in-browser on the Web-Speech
// transcript (clean text, so keyword coverage is high). Maps a spoken Najdi/MSA
// question to one of the six approved categories, or greeting / clarify / redirect.

import type { Category } from './clips'

export type MatchKind = 'approved' | 'greeting' | 'clarify' | 'redirect'
export interface MatchResult {
  kind: MatchKind
  category: Category | null
  method: string
}

// --- Arabic normalization (same transforms as lulu_host._norm) ---------------
const TASHKEEL = /[ً-ْٰـ]/g
function norm(text: string): string {
  let t = (text || '').trim().toLowerCase()
  t = t.replace(TASHKEEL, '')
  t = t
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/ة/g, 'ه')
  t = t.replace(/[^0-9a-z؀-ۿ]+/g, ' ')
  return t.trim().split(/\s+/).filter(Boolean).join(' ')
}
const n = (arr: string[]) => arr.map(norm)

// --- keyword/synonym sets per category ---------------------------------------
const KW: Record<Category, string[]> = {
  what: n([
    'وش الفعالية', 'ايش الفعالية', 'وش هي الفعالية', 'وش هي فعالية', 'وش فعالية',
    'ايش فعالية', 'ماهي الفعالية', 'ماهي فعالية', 'وش هو لولو ليتس', 'وش هي لولو ليتس',
    'ايش لولو ليتس', 'وش لولو ليتس', 'وش ليتس كونيكت', 'عن وش', 'وش هذا الحدث',
    'ايش هذا الحدث', 'وش قصة', 'وش يصير', 'تعريف', 'وش الموضوع', 'وش معنى',
    'الفعالية وش', 'وش تسوون', 'وش عندكم هنا', 'وش هذا',
  ]),
  when: n([
    'متى', 'تاريخ', 'التواريخ', 'تبدا', 'تنتهي', 'يبدا', 'ينتهي', 'كم باقي',
    'الى متى', 'لين متى', 'المده', 'كم يوم', 'ايام', 'اخر يوم', 'وقت', 'متى تخلص',
    'بدت', 'خلصت متى', 'كم تستمر', 'فتره', 'موعد', 'متى تبدا',
  ]),
  where: n([
    'وين', 'فين', 'اي فرع', 'الفرع', 'الفروع', 'المكان', 'مكان', 'موقع', 'اي مدينه',
    'عنوان', 'وينكم', 'اقرب فرع', 'في اي', 'وين القاكم', 'وين الاقيكم', 'محل', 'اين',
  ]),
  products: n([
    'منتجات', 'المنتجات', 'منتج', 'اجهزه', 'جهاز', 'جوال', 'جوالات', 'موبايل',
    'تلفون', 'لابتوب', 'لابتوبات', 'حاسب', 'كمبيوتر', 'تلفزيون', 'تلفزيونات',
    'شاشه', 'شاشات', 'سماعه', 'سماعات', 'ساعه', 'ساعات', 'بلايستيشن', 'العاب',
    'قيمنق', 'براندات', 'ماركات', 'ماركه', 'وش فيه', 'وش تبيعون', 'وش المعروض',
    'ابي اشتري', 'وش الاجهزه', 'بيوت ذكيه', 'ذكيه',
  ]),
  offers: n([
    'عرض', 'عروض', 'خصم', 'خصومات', 'تخفيض', 'تخفيضات', 'سعر', 'اسعار', 'رخيص',
    'صفقه', 'صفقات', 'وفر', 'كم الخصم', 'نسبه الخصم', 'عروضات', 'تنزيلات', 'تنزيل',
    'حصري', 'حصريه', 'وش العروض', 'في خصم', 'فيه خصم', 'في عروض', 'فيه عروض',
    'كم نسبه', 'الويكند', 'نهايه الاسبوع',
  ]),
  social: n([
    'صور', 'اصور', 'تصوير', 'اصوره', 'سناب', 'سناب شات', 'فيديو', 'فيديوهات',
    'انشر', 'نشر', 'سوشيال', 'سوشال', 'هاشتاق', 'هشتاق', 'حساب', 'حسابكم',
    'انستقرام', 'انستا', 'تويتر', 'اكس', 'تيك توك', 'تيكتوك', 'بوست', 'مشاركه',
    'اشارك', 'تاق', 'منشن', 'وش الهاشتاق', 'احط هاشتاق',
  ]),
}

// Strong interrogatives: signal the QUESTION TYPE more than any noun, so
// "متى العروض؟" -> when (not offers), "وين العروض؟" -> where.
const STRONG: Partial<Record<Category, string[]>> = {
  when: n(['متى']),
  where: n(['وين', 'فين', 'اين']),
}

const GREET = n([
  'السلام عليكم', 'سلام', 'هلا', 'هلا والله', 'مرحبا', 'اهلا', 'صباح الخير',
  'مساء الخير', 'كيفك', 'شخبارك', 'حياك', 'يا هلا', 'هاي', 'مين انت', 'من انت',
  'وش اسمك', 'انت مين', 'تعرفني',
])

const STOP = new Set(
  n(['و', 'في', 'من', 'عن', 'هل', 'ايش', 'وش', 'كم', 'لي', 'لو', 'يا', 'هذا',
     'هذي', 'ذا', 'اللي', 'على', 'مع', 'بس', 'طيب', 'اوكي', 'اها']),
)

const CATS: Category[] = ['what', 'when', 'where', 'products', 'offers', 'social']

function kwScores(qn: string): Record<Category, number> {
  const s: Record<Category, number> = { what: 0, when: 0, where: 0, products: 0, offers: 0, social: 0 }
  for (const cat of CATS) {
    for (const kw of KW[cat]) {
      if (!kw) continue
      if (kw.includes(' ')) {
        if (qn.includes(kw)) s[cat] += 2
      } else if (kw.length >= 3 && qn.includes(kw)) {
        s[cat] += 1
      }
    }
  }
  for (const cat of CATS) {
    for (const kw of STRONG[cat] ?? []) {
      if (kw && qn.includes(kw)) s[cat] += 2
    }
  }
  return s
}

function isGreeting(qn: string): boolean {
  return GREET.some((g) => g && (qn.includes(g) || g.includes(qn)))
}

function hasSignal(qn: string): boolean {
  const toks = qn.split(' ').filter((t) => t && !STOP.has(t))
  return toks.length >= 1 && qn.length >= 3
}

export function match(q: string, lastCat: Category | null = null): MatchResult {
  const qn = norm(q)
  if (!hasSignal(qn)) return { kind: 'clarify', category: null, method: 'empty' }

  const scores = kwScores(qn)
  const nonzero = CATS.filter((c) => scores[c] > 0)
  let bestCat: Category = 'what'
  for (const c of CATS) if (scores[c] > scores[bestCat]) bestCat = c
  const best = scores[bestCat]
  const ordered = CATS.map((c) => scores[c]).sort((a, b) => b - a)
  const second = ordered[1] ?? 0

  // Confident, unambiguous keyword hit.
  if (best >= 2 || (best === 1 && nonzero.length === 1 && best > second)) {
    return { kind: 'approved', category: bestCat, method: 'keyword' }
  }
  // Greeting / smalltalk with no topic keyword.
  if (isGreeting(qn) && nonzero.length === 0) {
    return { kind: 'greeting', category: null, method: 'greeting' }
  }
  // Any weaker keyword lean still routes to the approved answer.
  if (best >= 1) {
    return { kind: 'approved', category: bestCat, method: 'keyword-weak' }
  }
  // Short follow-up after a known topic -> reuse it ("وكم؟" after offers).
  if (lastCat && qn.split(' ').length <= 2) {
    return { kind: 'approved', category: lastCat, method: 'context' }
  }
  // Heard words but nothing about the event -> friendly Lulu redirect.
  return { kind: 'redirect', category: null, method: 'redirect' }
}
