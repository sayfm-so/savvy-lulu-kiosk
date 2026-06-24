import { TOPICS, type Category } from '../lib/clips'

// The six approved topics as an editorial numbered menu (two columns, hairline
// dividers) — the bulletproof touch path. Deliberately NOT an identical card grid.
export default function TopicGrid({
  onPick, disabled,
}: {
  onPick: (cat: Category) => void
  disabled: boolean
}) {
  return (
    <nav aria-label="مواضيع لولو ليتس كونيكت" className="w-full max-w-2xl shrink-0">
      <p className="eyebrow text-xs mb-1 text-center" style={{ color: 'var(--muted)' }}>
        أو اختر موضوع
      </p>
      <ul className="grid grid-cols-2 gap-x-8" style={{ opacity: disabled ? 0.5 : 1 }}>
        {TOPICS.map((t, i) => (
          <li key={t.cat} style={{ borderBottom: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => !disabled && onPick(t.cat)}
              disabled={disabled}
              className="topic-row focus-ring w-full flex items-center gap-3 py-3.5 px-2 text-right"
            >
              <span className="topic-num text-base w-6">{(i + 1).toLocaleString('ar-EG')}</span>
              <span className="flex-1 text-base sm:text-lg font-bold">{t.label}</span>
              <span className="text-xl opacity-75" aria-hidden="true">{t.icon}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
