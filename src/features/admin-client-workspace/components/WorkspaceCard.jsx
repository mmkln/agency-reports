import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
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
    <Panel>
      <PanelHeader
        action={action}
        divided
        iconName={iconName}
        subtitle={description}
        title={title}
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
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
