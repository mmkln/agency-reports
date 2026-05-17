import { Link } from 'react-router-dom'

import {
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import {
  formatDate,
  formatMetricLabel,
  getInsightTone,
} from './formatters'

function WorkTaskRow({ task }) {
  return (
    <article className="flex items-start justify-between gap-4 rounded-control border border-control-border bg-block-subtle p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-ui text-text-primary">{task.title}</h3>
          <StatusBadge meta={task.statusMeta} />
        </div>
        <p className="mt-2 text-label font-normal text-text-muted">
          {task.assigneeName ? `Owner: ${task.assigneeName}` : 'Owner not set'}
          {task.dueDate ? ` - Due ${formatDate(task.dueDate)}` : ''}
        </p>
      </div>
    </article>
  )
}

function WorkTextRow({ text }) {
  return (
    <article className="flex items-start gap-3 rounded-control border border-control-border bg-block-subtle p-4">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name="checkCircle2" size={13} />
      </span>
      <p className="text-body text-text-primary">{text}</p>
    </article>
  )
}

function UpdateSummaryRow({ update }) {
  return (
    <article className="rounded-control border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-ui text-text-primary">{update.title}</h3>
        <span className="shrink-0 text-label font-normal text-text-muted">{formatDate(update.updatedAt)}</span>
      </div>
      <p className="mt-2 text-body text-text-secondary">{update.body}</p>
    </article>
  )
}

export function WhatWeDidSection({ agencyWork, workSummary }) {
  const manualCompleted = agencyWork?.completed ?? []
  const manualActive = agencyWork?.active ?? []
  const manualNext = agencyWork?.next ?? []
  const recentUpdates = workSummary?.recentUpdates ?? []
  const completedTasks = workSummary?.completedTasks ?? []
  const activeTasks = workSummary?.activeTasks ?? []
  const hasWork = recentUpdates.length
    || completedTasks.length
    || activeTasks.length
    || manualCompleted.length
    || manualActive.length
    || manualNext.length

  if (!hasWork) {
    return (
      <Panel>
        <PanelHeader
          subtitle="Client-visible agency execution will appear here once the team publishes updates or completed work."
          title="What We Did"
        />
        <PanelBody>
          <p className="text-ui text-text-muted">No client-visible work summary has been published yet.</p>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Client-visible execution context from the status hub, shown beside performance outcomes."
        title="What We Did"
      />
      <PanelBody className="grid gap-6">
        {recentUpdates.length ? (
          <div className="grid gap-3">
            <h3 className="text-label text-text-muted">Latest client-visible portal updates</h3>
            {recentUpdates.map((update) => (
              <UpdateSummaryRow key={update.id} update={update} />
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-3">
            <h3 className="text-label text-text-muted">Completed this period</h3>
            {manualCompleted.map((item) => (
              <WorkTextRow key={item} text={item} />
            ))}
            {completedTasks.map((task) => (
              <WorkTaskRow key={task.id} task={task} />
            ))}
            {!manualCompleted.length && !completedTasks.length ? (
              <p className="rounded-control border border-control-border bg-block-subtle p-4 text-ui text-text-muted">
                No completed client-visible tasks are available for this period.
              </p>
            ) : null}
          </div>
          <div className="grid content-start gap-3">
            <h3 className="text-label text-text-muted">Active now</h3>
            {manualActive.map((item) => (
              <WorkTextRow key={item} text={item} />
            ))}
            {activeTasks.map((task) => (
              <WorkTaskRow key={task.id} task={task} />
            ))}
            {!manualActive.length && !activeTasks.length ? (
              <p className="rounded-control border border-control-border bg-block-subtle p-4 text-ui text-text-muted">
                No active client-visible tasks are open right now.
              </p>
            ) : null}
          </div>
        </div>

        {manualNext.length ? (
          <div className="grid gap-3">
            <h3 className="text-label text-text-muted">Planned next</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {manualNext.map((item) => (
                <WorkTextRow key={item} text={item} />
              ))}
            </div>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function BulletPanel({ items, title, emptyText, renderItem }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        {items?.length ? (
          <div className="grid gap-component">
            {items.map(renderItem)}
          </div>
        ) : (
          <p className="text-ui text-text-muted">{emptyText}</p>
        )}
      </PanelBody>
    </Panel>
  )
}

export function InsightCard({ insight, index }) {
  return (
    <div className="rounded-control border border-control-border bg-block-subtle p-4" key={insight.id || `${insight.title}-${index}`}>
      <div className="flex items-center gap-2">
        <StatusBadge label={formatMetricLabel(insight.severity ?? 'info')} tone={getInsightTone(insight.severity)} />
        <h3 className="text-ui text-text-primary">{insight.title || 'Insight'}</h3>
      </div>
      <p className="mt-2 text-body text-text-secondary">{insight.body}</p>
      {insight.chart_ref ? <p className="mt-3 text-label font-normal text-text-muted">Related: {insight.chart_ref}</p> : null}
    </div>
  )
}

export function NextStepCard({ step, index }) {
  return (
    <div className="rounded-control border border-control-border bg-block-subtle p-4" key={step.id || `${step.title}-${index}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-ui text-text-primary">{step.title || 'Next action'}</h3>
        <StatusBadge label={formatMetricLabel(step.priority ?? 'medium')} tone={step.priority === 'high' ? 'amber' : 'neutral'} />
      </div>
      {step.description ? <p className="mt-2 text-body text-text-secondary">{step.description}</p> : null}
      <p className="mt-3 text-label font-normal text-text-muted">
        {step.owner ? `Owner: ${step.owner}` : 'Owner not set'}
        {step.due_date ? ` - Due ${formatDate(step.due_date)}` : ''}
      </p>
    </div>
  )
}

export function ClientActionCard({ action, requestsHref }) {
  return (
    <div className="rounded-control border border-warning/20 bg-warning/10 p-4" key={action.id}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-control bg-warning/20 text-warning-foreground">
          <Icon name="warning" size={15} />
        </span>
        <div className="min-w-0">
          <h3 className="text-ui text-text-primary">{action.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge meta={action.priorityMeta} />
            <StatusBadge meta={action.statusMeta} />
          </div>
          {action.description ? <p className="mt-2 text-body text-text-secondary">{action.description}</p> : null}
          <p className="mt-3 text-label text-warning-foreground">Due {formatDate(action.dueDate)}</p>
          <Button asChild className="mt-3" size="sm" variant="outline">
            <Link to={requestsHref}>
              View action
              <Icon name="arrowUpRight" size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
