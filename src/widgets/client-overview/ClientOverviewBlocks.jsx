import { useState } from 'react'

import {
  Button,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
  Progress,
  Separator,
  Skeleton,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui'

import { cn } from '@/lib/utils'

import { Icon } from '../../shared/icons'

function SectionCard({ action, children, className, contentClassName, description, iconName, title }) {
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
            <CardTitle className="truncate text-base font-semibold leading-6 text-text-primary">{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
        </div>
        {action ? <CardAction className="self-center">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn('py-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

function EmptyState({ children, iconName = 'helpCircle' }) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-dashed border-control-border bg-surface-subtle px-4 py-4 text-sm text-text-muted">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-block text-text-quaternary ring-1 ring-control-border">
        <Icon name={iconName} size={15} />
      </span>
      <p className="leading-6">{children}</p>
    </div>
  )
}

function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function AccessDeniedState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center px-4 py-14">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon name="shieldCheck" size={34} />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          You do not have permission to view this client portal. Check the link or contact your agency manager.
        </p>
        <Button asChild className="mt-6" size="lg" variant="secondary">
          <a href="#landing">Return home</a>
        </Button>
      </div>
    </div>
  )
}

export function EmptyOverviewState({ client }) {
  return (
    <Card className="border-dashed border-border-strong bg-block shadow-none">
      <CardContent className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-block border border-control-border bg-surface-subtle text-text-muted">
            <Icon name="database" size={28} />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-heading">Welcome, {client.name}</h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Your client portal has been created. The agency team is still adding the first projects,
            tasks, dashboard, and report. This page will fill in as soon as the first client-facing
            information is published.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingOverviewState() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="grid gap-6">
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-4/5" />
          </CardContent>
        </Card>
      </div>
      <aside className="grid gap-6">
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="py-4">
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function NeededActionResponse({ action, onAnswerAction }) {
  const [isResponding, setIsResponding] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canRespond = Boolean(onAnswerAction) && action.status === 'pending'

  if (!canRespond) {
    return (
      <>
        {action.relatedLink ? (
          <div className="mt-4">
            <Button asChild size="sm" variant="outline">
              <a href={action.relatedLink} rel="noreferrer" target="_blank">Open related link</a>
            </Button>
          </div>
        ) : null}
        {action.clientResponse ? (
          <div className="mt-3 rounded-control border border-action/20 bg-action-muted px-3 py-2 text-sm text-action">
            <span className="font-semibold">Your response:</span> {action.clientResponse}
            {action.respondedAt ? (
              <span className="mt-1 block text-xs text-action">Sent {formatDate(action.respondedAt)}</span>
            ) : null}
          </div>
        ) : null}
        {action.status === 'resolved' ? (
          <div className="mt-3 rounded-control border border-success/20 bg-success-muted px-3 py-2 text-sm text-success-foreground">
            This request has been resolved by the agency.
          </div>
        ) : null}
      </>
    )
  }

  if (!isResponding) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {action.relatedLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">Open related link</a>
          </Button>
        ) : null}
        <Button onClick={() => setIsResponding(true)} size="sm" type="button">
          Mark as answered
        </Button>
      </div>
    )
  }

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()

        try {
          onAnswerAction(action.id, message || 'Completed by client')
          setIsResponding(false)
          setMessage('')
          setError('')
        } catch (caughtError) {
          setError(caughtError.message)
        }
      }}
    >
      <Textarea
        onChange={(event) => {
          setMessage(event.target.value)
          setError('')
        }}
        placeholder="Add a short note for the agency..."
        value={message}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={() => setIsResponding(false)} size="sm" type="button" variant="outline">
          Cancel
        </Button>
        <Button size="sm" type="submit">
          Send response
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}

function NeededActionTimeline({ action }) {
  if (!action.responseHistory?.length) {
    return null
  }

  return (
    <div className="mt-4 border-t border-separator pt-3">
      <p className="text-xs font-semibold tracking-wide text-text-quaternary uppercase">Activity</p>
      <ol className="mt-2 grid gap-2 text-xs text-text-muted">
        {action.responseHistory.map((event, index) => (
          <li className="flex items-start gap-2" key={`${event.type}-${event.created_at}-${index}`}>
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-quaternary" />
            <span>
              <span className="font-medium text-text-secondary">{event.type.replaceAll('_', ' ')}</span>
              {event.created_at ? ` · ${formatDate(event.created_at)}` : ''}
              {event.metadata?.note ? <span className="block">{event.metadata.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function NeededFromClientBlock({ actions, onAnswerAction }) {
  if (actions.length === 0) {
    return null
  }

  return (
    <SectionCard
      contentClassName="grid gap-3"
      description="These items are blocking or slowing current work."
      iconName="bell"
      title="Action needed from you"
    >
      {actions.map((action) => (
        <article className="rounded-control border border-control-border bg-block-subtle p-4" key={action.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary">{action.title}</h3>
              <p className={`mt-1 text-sm ${action.isOverdue ? 'font-medium text-destructive' : 'text-text-muted'}`}>
                Due: {formatDate(action.dueDate) || 'No due date'}{action.isOverdue ? ' · Overdue' : ''}
              </p>
            </div>
            <StatusBadge meta={action.statusMeta} />
          </div>
          {action.description ? <p className="mt-3 text-sm leading-6 text-text-secondary">{action.description}</p> : null}
          <NeededActionResponse action={action} onAnswerAction={onAnswerAction} />
          <NeededActionTimeline action={action} />
        </article>
      ))}
    </SectionCard>
  )
}

export function LatestUpdateBlock({ focusItems, update }) {
  return (
    <SectionCard iconName="target" title="Latest updates and focus">
      {update ? (
        <article className="rounded-control border border-control-border bg-block-subtle p-4">
          <p className="text-sm font-semibold text-text-secondary">{update.title}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{update.body}</p>
          <p className="mt-3 text-xs font-medium text-text-quaternary">Updated {formatDate(update.updatedAt)}</p>
        </article>
      ) : (
        <EmptyState>No client-facing update has been published yet.</EmptyState>
      )}

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Current team focus</p>
        {focusItems.length > 0 ? (
          <ul className="mt-3 grid gap-3">
            {focusItems.map((item) => (
              <li className="flex gap-3 text-sm text-text-secondary" key={item}>
                <Icon className="mt-0.5 text-action" name="arrowRight" size={16} />
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState>No current focus has been published yet.</EmptyState>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

export function ProgressSummaryBlock({ projects }) {
  return (
    <SectionCard iconName="barChart" title="Progress by stage">
      {projects.length > 0 ? (
        <div className="grid gap-5">
          {projects.map((project) => (
            <article className="grid gap-2" key={project.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text-primary">{project.name}</h3>
                  <p className="mt-1 text-xs text-text-muted">Current stage: {project.description}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-action">{project.progressPercent}%</span>
              </div>
              <Progress aria-label={`${project.name} progress`} value={project.progressPercent} />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>No progress summary has been published yet.</EmptyState>
      )}
    </SectionCard>
  )
}

export function ActiveTasksBlock({ tasks }) {
  return (
    <SectionCard iconName="checkCircle2" title="Current tasks">
      {tasks.length > 0 ? (
        <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Responsible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-text-primary">{task.title}</TableCell>
                  <TableCell>
                    <StatusBadge meta={task.statusMeta} />
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDate(task.dueDate)}</TableCell>
                  <TableCell className="text-text-muted">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-control-selected text-xs font-semibold text-text-secondary">
                        {task.assigneeName.slice(0, 1)}
                      </span>
                      {task.assigneeName}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      ) : (
        <EmptyState>No active client-visible tasks right now.</EmptyState>
      )}
    </SectionCard>
  )
}

export function DashboardOverviewBlock({ clientId, dashboard }) {
  return (
    <SectionCard
      description="Live performance data from the agency dashboard."
      iconName="layoutDashboard"
      title="Analytics dashboard"
    >
      {dashboard ? (
        <div className="grid gap-4">
          <div className="rounded-control border border-control-border bg-block-subtle p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-text-primary">{dashboard.name}</h3>
                <p className="mt-1 text-xs text-text-muted">
                  {dashboard.isAvailable ? 'Ready to view' : 'Temporarily unavailable'}
                </p>
              </div>
              <StatusBadge meta={dashboard.statusMeta} />
            </div>
          </div>

          {!dashboard.isAvailable ? (
            <p className="rounded-control border border-warning/20 bg-warning-muted px-3 py-2 text-sm leading-6 text-warning-foreground">
              {dashboard.fallbackMessage || 'Dashboard is temporarily unavailable.'}
            </p>
          ) : null}

          <div className="grid gap-2">
            <Button asChild className="w-full" size="lg">
              <a href={`#client-dashboard?clientId=${clientId}&dashboardId=${dashboard.id}`}>
                View Dashboard
              </a>
            </Button>
            {dashboard.publicUrl ? (
              <Button asChild className="w-full" size="lg" variant="outline">
                <a href={dashboard.publicUrl} rel="noreferrer" target="_blank">
                  Open Full Dashboard
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <EmptyState iconName="layoutDashboard">
          Dashboard is being prepared. Expected availability will be shared by your agency manager.
        </EmptyState>
      )}
    </SectionCard>
  )
}

export function LatestMonthlySummaryBlock({ clientId, report }) {
  return (
    <SectionCard iconName="fileText" title="Latest report">
      {report ? (
        <article className="rounded-control border border-control-border bg-block-subtle p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-text-primary">{report.title}</h3>
              <p className="mt-2 text-xs text-text-muted">
                {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </p>
            </div>
            <Icon className="text-destructive" name="fileText" size={22} />
          </div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">{report.summary}</p>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <a href={`#client-reports?clientId=${clientId}&reportId=${report.id}`}>
                Read Report
              </a>
            </Button>
            {report.dashboardUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
                  Open Dashboard
                </a>
              </Button>
            ) : null}
            {report.pdfUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={report.pdfUrl} rel="noreferrer" target="_blank">
                  Open PDF
                </a>
              </Button>
            ) : null}
          </div>
        </article>
      ) : (
        <EmptyState>No published report yet.</EmptyState>
      )}
    </SectionCard>
  )
}
