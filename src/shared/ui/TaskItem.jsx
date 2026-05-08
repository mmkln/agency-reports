import { Icon } from '../icons'
import { Badge } from './Badge'

export function TaskItem({ completed = false, meta, priority, title }) {
  const priorityTone = {
    HIGH: 'rose',
    LOW: 'neutral',
    MEDIUM: 'amber',
  }[priority] ?? 'neutral'
  const stateClass = completed ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white'
  const indicatorClass = completed
    ? 'border-emerald-600 bg-emerald-600 after:mt-[-2px] after:h-1.5 after:w-3 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:content-[""]'
    : 'border-slate-300 bg-white'

  return (
    <article className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-4 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50/60 ${stateClass}`}>
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${indicatorClass}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className={`m-0 text-base font-medium text-slate-900 ${completed ? 'text-slate-500 line-through decoration-slate-300' : ''}`}>
            {title}
          </h3>
          {meta ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Icon name="clock" size={14} />
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      {priority ? <Badge tone={priorityTone}>{priority}</Badge> : null}
    </article>
  )
}
