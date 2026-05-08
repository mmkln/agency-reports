export function Badge({ children, className = '', icon, tone = 'neutral' }) {
  const toneClass = {
    blue: 'bg-indigo-100 text-indigo-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    neutral: 'bg-slate-100 text-slate-500',
    rose: 'bg-rose-100 text-rose-700',
  }[tone]

  return (
    <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold ${toneClass} ${className}`.trim()}>
      {icon ? <span className="inline-flex" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </span>
  )
}
