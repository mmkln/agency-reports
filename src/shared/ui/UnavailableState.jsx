import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function UnavailableState({
  action,
  className,
  description,
  iconName,
  id,
  title,
}) {
  const inspectorId = useInspectorId('UnavailableState', id)

  return (
    <div
      id={inspectorId}
      className={cn('flex flex-col items-center justify-center gap-item rounded-block bg-block-subtle p-card text-center', className)}
    >
      {iconName ? (
        <span className="flex size-target items-center justify-center rounded-full bg-block text-text-quaternary shadow-block">
          <Icon name={iconName} size={22} />
        </span>
      ) : null}
      <p className="text-ui text-text-primary">{title}</p>
      {description ? <p className="max-w-readable text-body text-text-muted">{description}</p> : null}
      {action ? <div className="pt-micro">{action}</div> : null}
    </div>
  )
}
