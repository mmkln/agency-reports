export function PageHeader({ actions, subtitle, title }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-2xl leading-7 font-bold text-slate-900 transition-all sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-6">
              <p className="mt-2 flex items-center text-sm text-slate-500">{subtitle}</p>
            </div>
          ) : null}
        </div>
        {actions ? <div className="mt-5 flex gap-3 lg:mt-0 lg:ml-4">{actions}</div> : null}
      </div>
    </header>
  )
}
