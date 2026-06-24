// Spoken-status + heard transcript. aria-live announces the matched topic.
export default function StatusDisplay({ status, transcript }: { status: string; transcript: string }) {
  return (
    <div className="text-center mt-5 min-h-[3.25rem]">
      <p role="status" aria-live="polite"
         className="display text-2xl sm:text-3xl min-h-[2rem]"
         style={{ color: 'var(--glow)' }}>
        {status}
      </p>
      <p className="text-base sm:text-lg min-h-[1.5rem]" style={{ color: 'var(--muted)' }}>
        {transcript && `«${transcript}»`}
      </p>
    </div>
  )
}
