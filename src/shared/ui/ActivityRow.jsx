import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function ActivityRow({ color, detail, iconName, id, time, title }) {
  const inspectorId = useInspectorId('ActivityRow', id)

  return (
    <article id={inspectorId} className="flex items-center justify-between gap-card rounded-control bg-block px-control py-component max-[640px]:items-start">
      <div className="flex min-w-0 items-center gap-control">
        <Icon className={color} name={iconName} size={20} />
        <div className="min-w-0">
          <h3 className="m-0 text-body text-text-primary">{title}</h3>
          <p className="text-ui text-text-secondary">{detail}</p>
        </div>
      </div>
      <span className="shrink-0 text-ui text-text-secondary">{time}</span>
    </article>
  )
}
