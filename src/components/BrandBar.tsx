// Event header — clean editorial row (no glass pill).
export default function BrandBar() {
  return (
    <header className="w-full max-w-3xl flex items-center justify-between px-1 pt-1 shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} aria-hidden="true" />
        <span className="font-extrabold text-base sm:text-lg">لولو ليتس كونيكت ٢٠٢٦</span>
      </div>
      <span className="text-sm sm:text-base" style={{ color: 'var(--muted)' }}>٢٥ يونيو – ٥ يوليو</span>
    </header>
  )
}
