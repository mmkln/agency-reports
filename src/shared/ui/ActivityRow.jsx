import { Icon } from '../icons'

export function ActivityRow({ color, detail, iconName, time, title }) {
  return (
    <article className="flex items-center justify-between gap-5 rounded-lg border border-slate-200 bg-white px-3 py-4 max-[640px]:items-start">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className={color} name={iconName} size={20} />
        <div className="min-w-0">
          <h3 className="m-0 text-base leading-6 font-normal text-slate-900">{title}</h3>
          <p className="text-sm leading-5 text-slate-700">{detail}</p>
        </div>
      </div>
      <span className="shrink-0 text-sm leading-5 text-slate-600">{time}</span>
    </article>
  )
}
