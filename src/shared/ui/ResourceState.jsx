import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { Button } from './Button'
import { useInspectorId } from './inspectorId'

const KIND_CONFIG = {
  failure: {
    defaultDescription: 'Try again in a moment.',
    defaultIconName: 'circleAlert',
    defaultTitle: 'This content is unavailable',
    toneClassName: 'text-destructive',
  },
  forbidden: {
    defaultDescription: 'Ask an admin to update your permissions.',
    defaultIconName: 'shieldCheck',
    defaultTitle: 'You do not have access',
    toneClassName: 'text-text-quaternary',
  },
  network: {
    defaultDescription: 'Check the connection and try again.',
    defaultIconName: 'circleAlert',
    defaultTitle: 'This content is unavailable',
    toneClassName: 'text-destructive',
  },
  'not-found': {
    defaultDescription: 'There is nothing to show here yet.',
    defaultIconName: 'helpCircle',
    defaultTitle: 'Not configured yet',
    toneClassName: 'text-text-quaternary',
  },
  permission: {
    defaultDescription: 'Ask an admin to update your permissions.',
    defaultIconName: 'shieldCheck',
    defaultTitle: 'You do not have access',
    toneClassName: 'text-text-quaternary',
  },
  'session-expired': {
    defaultDescription: 'Sign in again to continue.',
    defaultIconName: 'lock',
    defaultTitle: 'Your session expired',
    toneClassName: 'text-text-quaternary',
  },
  unauthenticated: {
    defaultDescription: 'Sign in to continue.',
    defaultIconName: 'lock',
    defaultTitle: 'Authentication required',
    toneClassName: 'text-text-quaternary',
  },
  validation: {
    defaultDescription: 'Check the fields and try again.',
    defaultIconName: 'circleAlert',
    defaultTitle: 'Some information needs attention',
    toneClassName: 'text-destructive',
  },
}

function getLabel(labels = {}, kind, key) {
  const scopedKey = `${kind.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}${key}`

  return labels[scopedKey] ?? labels[key]
}

export function ResourceState({
  action,
  className,
  errorInfo,
  iconName,
  id,
  labels = {},
  onRetry,
}) {
  const inspectorId = useInspectorId('ResourceState', id)
  const kind = errorInfo?.kind ?? 'failure'
  const config = KIND_CONFIG[kind] ?? KIND_CONFIG.failure
  const title = getLabel(labels, kind, 'Title') ?? config.defaultTitle
  const description = getLabel(labels, kind, 'Description') ?? config.defaultDescription
  const canRetry = Boolean(onRetry && (kind === 'failure' || kind === 'network'))

  return (
    <div
      id={inspectorId}
      className={cn(
        'flex min-h-[180px] flex-col items-center justify-center gap-item rounded-block bg-block-subtle p-card text-center',
        className,
      )}
    >
      <span className={cn('flex size-target items-center justify-center rounded-full bg-block', config.toneClassName)}>
        <Icon name={iconName ?? config.defaultIconName} size={22} />
      </span>
      <div className="grid max-w-readable gap-tag">
        <p className="text-ui font-semibold text-text-primary">{title}</p>
        {description ? <p className="text-body text-text-muted">{description}</p> : null}
      </div>
      {action ? <div className="pt-micro">{action}</div> : null}
      {!action && canRetry ? (
        <Button onClick={onRetry} size="sm" type="button" variant="secondary">
          Retry
        </Button>
      ) : null}
    </div>
  )
}
