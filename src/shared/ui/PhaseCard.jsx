import { Icon } from '../icons'
import { ChecklistItem } from './ChecklistItem'
import { ProgressBar } from './ProgressBar'

export function PhaseCard({ accent = 'blue', duration, iconName, items, phase, progress, status, title }) {
  const accentClass = {
    blue: {
      background: 'bg-indigo-50/70',
      border: 'border-l-indigo-600',
      text: 'text-indigo-600',
    },
    green: {
      background: 'bg-emerald-50/70',
      border: 'border-l-emerald-600',
      text: 'text-emerald-600',
    },
    orange: {
      background: 'bg-orange-50/70',
      border: 'border-l-orange-600',
      text: 'text-orange-600',
    },
    purple: {
      background: 'bg-purple-50/70',
      border: 'border-l-purple-600',
      text: 'text-purple-600',
    },
    rose: {
      background: 'bg-rose-50/70',
      border: 'border-l-rose-600',
      text: 'text-rose-600',
    },
  }[accent]

  return (
    <article className={`rounded-lg border-l-4 p-6 ${accentClass.background} ${accentClass.border}`}>
      <div className="mb-5 flex items-start justify-between gap-4 max-[640px]:flex-col">
        <div className="flex items-start gap-3">
          {iconName ? <Icon className={`mt-1 ${accentClass.text}`} name={iconName} size={30} /> : null}
          <div>
            <h3 className="m-0 text-xl font-bold text-slate-900">
              {phase}: {title}
            </h3>
            {duration ? <p className="mt-1 text-sm text-slate-600">Duration: {duration}</p> : null}
          </div>
        </div>
        <div className="text-right max-[640px]:text-left">
          <p className="m-0 text-sm text-slate-600">Progress</p>
          <strong className="block text-2xl font-bold text-slate-900">{progress}%</strong>
          {status ? <span className="sr-only">{status}</span> : null}
        </div>
      </div>

      <ProgressBar label={`${phase} progress`} showLabel={false} tone={accent} value={progress} />

      <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
        {items.map((item) => (
          <ChecklistItem checked={item.checked} key={item.label} pendingIcon={false} strikethrough>
            {item.label}
          </ChecklistItem>
        ))}
      </ul>
    </article>
  )
}
