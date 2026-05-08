import { Icon } from '../icons'

export function GoalCard({ barColor, color, icon, label, progress, suffix, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <Icon className={color} name={icon} size={20} />
        <span className="text-xs leading-5 text-slate-700">{progress}% Complete</span>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-600">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <strong className="text-2xl leading-8 text-slate-900">{value}</strong>
        <span className="text-sm font-semibold text-slate-500">{suffix}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </article>
  )
}
