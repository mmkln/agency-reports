import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function ErrorBlock({ children, className = '', id, title = 'Something went wrong' }) {
  const inspectorId = useInspectorId('ErrorBlock', id)

  return (
    <div
      id={inspectorId}
      role="alert"
      className={cn(
        'flex items-start gap-item rounded-block bg-destructive/10 p-component text-ui text-destructive',
        className,
      )}
    >
      <span className="mt-micro flex size-control-small shrink-0 items-center justify-center rounded-control bg-destructive/10">
        <Icon name="circleAlert" size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-destructive">{title}</p>
        {children ? <p className="mt-tag text-text-secondary">{children}</p> : null}
      </div>
    </div>
  )
}
