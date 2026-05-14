import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function EmptyState({
  action,
  className = '',
  description,
  iconName,
  id,
  title,
}) {
  const inspectorId = useInspectorId('EmptyState', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'flex flex-col items-start gap-item rounded-block bg-block-subtle p-component',
        className,
      )}
    >
      {iconName ? (
        <span className="flex size-14 items-center justify-center rounded-block bg-control text-text-quaternary">
          <Icon name={iconName} size={24} />
        </span>
      ) : null}
      <p className="text-ui text-text-primary">{title}</p>
      {description ? <p className="text-body text-text-muted">{description}</p> : null}
      {action ? <div className="pt-micro">{action}</div> : null}
    </div>
  )
}
