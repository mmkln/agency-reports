import { Icon } from '../icons'

export function PageHeader({ subtitle, title }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-2xl leading-7 font-bold text-slate-900 transition-all sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <p className="mt-2 flex items-center text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3 lg:mt-0 lg:ml-4">
          <button
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            type="button"
          >
            <Icon className="mr-2 text-slate-500" name="calendar" size={16} />
            May 4, 2026
          </button>
          <button
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            type="button"
          >
            <Icon className="mr-2" name="plus" size={16} />
            New Patient
          </button>
        </div>
      </div>
    </header>
  )
}
