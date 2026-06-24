import type { Lang } from '../lib/clips'

export default function BrandBar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="w-full max-w-3xl flex items-center justify-between px-1 pt-1 shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} aria-hidden="true" />
        <span className="font-extrabold text-base sm:text-lg">
          {lang === 'ar' ? 'لولو ليتس كونيكت ٢٠٢٦' : 'Lulu Let’s Connect 2026'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="btn-press focus-ring glass rounded-full px-4 py-1.5 text-sm font-bold"
        aria-label="Switch language"
      >
        {lang === 'ar' ? 'English' : 'عربي'}
      </button>
    </header>
  )
}
