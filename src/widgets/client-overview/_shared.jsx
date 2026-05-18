import {
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
} from '@/shared/ui'

import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'

export function SectionCard({ action, children, className, contentClassName, description, iconName, title }) {
  return (
    <Card className={cn('border-control-border bg-block py-0 shadow-none', className)}>
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-separator bg-surface-subtle py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {iconName ? (
            <span className="flex shrink-0 text-text-quaternary">
              <Icon name={iconName} size={17} />
            </span>
          ) : null}
          <div className="min-w-0">
            <CardTitle as="h2" className="truncate text-ui text-text-primary">{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
        </div>
        {action ? <CardAction className="self-center">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn('py-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export function EmptyState({ children, iconName = 'helpCircle' }) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-dashed border-control-border bg-surface-subtle px-4 py-4 text-ui text-text-muted">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-block text-text-quaternary ring-1 ring-control-border">
        <Icon name={iconName} size={15} />
      </span>
      <p className="text-body">{children}</p>
    </div>
  )
}
