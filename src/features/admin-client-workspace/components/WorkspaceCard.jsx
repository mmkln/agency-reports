import {
  CardContent,
  CardTitle,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="text-xs font-medium text-destructive" role="alert">
      {children}
    </p>
  )
}

export function InlineEmptyState({ children, iconName = 'helpCircle', title }) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-dashed border-control-border bg-surface-subtle px-3 py-4 text-sm text-text-muted">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-text-quaternary">
        <Icon name={iconName} size={15} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-text-secondary">{title}</p>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  )
}

export function WorkspaceCard({ action, children, description, iconName, title }) {
  return (
    <Card className="gap-0 bg-block py-0 shadow-none">
      <CardHeader className="border-b border-separator px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              {iconName ? <Icon className="text-text-quaternary" name={iconName} size={15} /> : null}
              {title}
            </CardTitle>
            {description ? <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}
