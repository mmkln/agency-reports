export function Panel({ children, className = '' }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs ${className}`.trim()}>
      {children}
    </section>
  )
}

export function PanelHeader({ action, children, eyebrow, subtitle, title }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
      {title ? (
        <div>
          {eyebrow ? <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">{eyebrow}</p> : null}
          <h2 className="m-0 text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
      ) : (
        children
      )}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PanelBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`.trim()}>{children}</div>
}
