import {
  EmptyState,
  Panel,
  PanelBody,
  Skeleton,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="text-label text-destructive" role="alert">
      {children}
    </p>
  )
}

export function InlineEmptyState({ children, iconName = 'helpCircle', title }) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-dashed border-control-border bg-surface-subtle px-3 py-4 text-ui text-text-muted">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-text-quaternary">
        <Icon name={iconName} size={15} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-text-secondary">{title}</p>
        <p className="mt-1 text-ui">{children}</p>
      </div>
    </div>
  )
}

export function WorkspaceCard({ action, children, description, iconName, title }) {
  return (
    <section className="grid gap-control rounded-block bg-block p-component">
      <div className="flex items-center justify-between gap-control">
        <div className="flex min-w-0 items-start gap-control">
          {iconName ? (
            <span className="mt-micro flex shrink-0 text-text-quaternary">
              <Icon name={iconName} size={17} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="m-0 truncate text-ui font-semibold text-text-primary">{title}</h2>
            {description ? <p className="mt-tag text-ui text-text-muted">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function WorkspaceState({ description, message, status = 'loading', title }) {
  const isLoading = status === 'loading'

  return (
    <Panel>
      <PanelBody className="flex min-h-[260px] items-center justify-center">
        {isLoading ? (
          <div className="grid w-full max-w-md gap-component">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <EmptyState
            className={status === 'error' ? 'text-destructive' : ''}
            description={description ?? message}
            iconName={status === 'error' ? 'circleAlert' : 'helpCircle'}
            title={title ?? (status === 'error' ? 'Unable to load workspace' : 'No data')}
          />
        )}
      </PanelBody>
    </Panel>
  )
}
