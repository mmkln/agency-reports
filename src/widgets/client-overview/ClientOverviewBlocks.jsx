import { useState } from 'react'

import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

import { Icon } from '../../shared/icons'

const toneClasses = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
}

function StatusBadge({ children, tone = 'neutral' }) {
  return (
    <ShadcnBadge className={toneClasses[tone]} variant="outline">
      {children}
    </ShadcnBadge>
  )
}

function SectionCard({ action, children, className, contentClassName, description, iconName, title }) {
  return (
    <Card className={cn('border-slate-200 bg-white py-0 shadow-xs', className)}>
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 bg-slate-50/50 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {iconName ? (
            <span className="flex shrink-0 text-slate-400">
              <Icon name={iconName} size={17} />
            </span>
          ) : null}
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold leading-6 text-slate-900">{title}</CardTitle>
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
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Icon name="shieldCheck" size={34} />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
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
    <Card className="border-dashed border-slate-300 bg-white shadow-xs">
      <CardContent className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <Icon name="database" size={28} />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-heading">Welcome, {client.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
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
        <Card className="border-slate-200 bg-white py-0 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white py-0 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
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
        <Card className="border-slate-200 bg-white py-0 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white py-0 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
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
    return action.status === 'answered' ? (
      <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
        <span className="font-semibold">Your response:</span> {action.clientResponse || 'Answered'}
      </div>
    ) : null
  }

  if (!isResponding) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {action.relatedLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">Open link</a>
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
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
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
        <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-4" key={action.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-500">Due: {formatDate(action.dueDate)}</p>
            </div>
            <StatusBadge tone={action.statusMeta.tone}>{action.statusMeta.label}</StatusBadge>
          </div>
          {action.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{action.description}</p> : null}
          <NeededActionResponse action={action} onAnswerAction={onAnswerAction} />
        </article>
      ))}
    </SectionCard>
  )
}

export function LatestUpdateBlock({ focusItems, update }) {
  return (
    <SectionCard iconName="target" title="Latest updates and focus">
      {update ? (
        <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-700">{update.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{update.body}</p>
          <p className="mt-3 text-xs font-medium text-slate-400">Updated {formatDate(update.updatedAt)}</p>
        </article>
      ) : (
        <EmptyState>No client-facing update has been published yet.</EmptyState>
      )}

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Current team focus</p>
        {focusItems.length > 0 ? (
          <ul className="mt-3 grid gap-3">
            {focusItems.map((item) => (
              <li className="flex gap-3 text-sm text-slate-700" key={item}>
                <Icon className="mt-0.5 text-indigo-600" name="arrowRight" size={16} />
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
                  <h3 className="text-sm font-medium text-slate-900">{project.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">Current stage: {project.description}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-indigo-600">{project.progressPercent}%</span>
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
                  <TableCell className="font-medium text-slate-900">{task.title}</TableCell>
                  <TableCell>
                    <StatusBadge tone={task.statusMeta.tone}>{task.statusMeta.label}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDate(task.dueDate)}</TableCell>
                  <TableCell className="text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
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
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{dashboard.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {dashboard.isAvailable ? 'Ready to view' : 'Temporarily unavailable'}
                </p>
              </div>
              <StatusBadge tone={dashboard.isAvailable ? 'green' : 'amber'}>
                {dashboard.status}
              </StatusBadge>
            </div>
          </div>

          {!dashboard.isAvailable ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-700">
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
        <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">{report.title}</h3>
              <p className="mt-2 text-xs text-slate-500">
                {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </p>
            </div>
            <Icon className="text-rose-500" name="fileText" size={22} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{report.summary}</p>
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
