export function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = {
    default: 'border-slate-200 bg-white',
    blue: 'border-slate-200 border-l-4 border-l-indigo-600 bg-indigo-50',
    green: 'border-slate-200 border-l-4 border-l-emerald-600 bg-emerald-50',
  }[tone]

  return (
    <section className={`rounded-2xl border p-6 shadow-xs ${toneClass} ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}

export function CardHeader({ action, eyebrow, title }) {
  return (
    <header className="mb-[18px] flex items-center justify-between gap-4 max-[520px]:flex-col max-[520px]:items-start">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">{eyebrow}</p> : null}
        <h2 className="m-0 text-lg font-semibold leading-7 text-slate-800">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
