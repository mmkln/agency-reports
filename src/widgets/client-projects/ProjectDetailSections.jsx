import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import { formatDate, getStatusMeta } from './projectDisplay'

function WorkItemCard({ item }) {
  const pendingAction = item.clientActions?.[0] ?? null

  return (
    <article className="rounded-control border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-ui text-text-primary">{item.title}</h3>
          {item.summary ? <p className="mt-2 text-body text-text-secondary">{item.summary}</p> : null}
        </div>
        <StatusBadge meta={item.statusMeta} />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-label font-normal text-text-muted">
        <span>Target {formatDate(item.targetDate)}</span>
        <span>Updated {formatDate(item.lastUpdatedAt)}</span>
      </div>
      {pendingAction ? (
        <div className="mt-3 rounded-control bg-warning-muted px-3 py-2 text-label font-normal text-warning-foreground">
          Action needed: {pendingAction.title}
        </div>
      ) : null}
    </article>
  )
}

function WaitingOnYouSection({ actions }) {
  if (!actions.length) {
    return null
  }

  return (
    <section className="rounded-block border border-warning/20 bg-warning-muted p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-warning-foreground">
          <Icon name="bell" size={16} />
        </span>
        <div>
          <h3 className="text-ui text-warning-foreground">Waiting on you</h3>
          <p className="mt-1 text-body text-warning-foreground">
            {actions.length} client action{actions.length === 1 ? '' : 's'} may affect this project.
          </p>
        </div>
      </div>
    </section>
  )
}

function ProjectTimelineSection({ timeline }) {
  if (!timeline?.length) {
    return null
  }

  const statusMeta = {
    completed: {
      className: 'bg-success text-success-foreground',
      iconName: 'checkCircle2',
    },
    in_progress: {
      className: 'bg-action text-action',
      iconName: 'clock',
    },
    planned: {
      className: 'bg-control text-text-muted',
      iconName: 'circle',
    },
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Timeline</p>
        <h3 className="mt-1 text-heading text-text-primary">Milestones</h3>
      </div>
      <div className="grid gap-2">
        {timeline.map((milestone) => {
          const meta = statusMeta[milestone.status] ?? statusMeta.planned

          return (
            <article className="flex items-center justify-between gap-3 rounded-control bg-block-subtle px-3 py-2" key={milestone.id}>
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
                  <Icon name={meta.iconName} size={14} />
                </span>
                <span className="truncate text-ui text-text-primary">{milestone.label}</span>
              </div>
              <span className="shrink-0 text-label font-normal text-text-muted">
                {milestone.date ? formatDate(milestone.date) : milestone.status.replace('_', ' ')}
              </span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ProjectBlockersSection({ blockers }) {
  if (!blockers.length) {
    return null
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Blockers</p>
        <h3 className="mt-1 text-heading text-text-primary">Client-relevant blockers</h3>
      </div>
      <div className="grid gap-3">
        {blockers.map((blocker) => (
          <article className="rounded-control bg-warning-muted p-4 text-warning-foreground" key={blocker.id}>
            <h4 className="text-ui">{blocker.title}</h4>
            {blocker.whyNeeded ? <p className="mt-2 text-body">{blocker.whyNeeded}</p> : null}
            <p className="mt-2 text-label font-normal">{blocker.impactIfDelayed}</p>
            <p className="mt-1 text-label font-normal">Due {formatDate(blocker.dueDate)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function RelatedResultsSection({ links }) {
  if (!links.length) {
    return null
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Reports & Dashboards</p>
        <h3 className="mt-1 text-heading text-text-primary">Related results</h3>
      </div>
      <div className="grid gap-2">
        {links.map((link) => (
          <Button asChild className="justify-start" key={link.id} variant="outline">
            <Link to={link.href}>
              <Icon name={link.type === 'Latest report' ? 'fileText' : 'layoutDashboard'} size={15} />
              <span className="min-w-0 truncate">{link.label}</span>
              <span className="ml-auto text-label font-normal text-text-muted">{link.type}</span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  )
}

function ProjectUpdatesSection({ updates }) {
  if (!updates.length) {
    return null
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Updates</p>
        <h3 className="mt-1 text-heading text-text-primary">Project update history</h3>
      </div>
      <div className="grid gap-3">
        {updates.slice(0, 4).map((update) => (
          <article className="rounded-control bg-block-subtle p-4" key={update.id}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge meta={update.typeMeta} />
              <span className="text-label font-normal text-text-muted">{formatDate(update.publishedAt)}</span>
            </div>
            <h4 className="mt-3 text-ui text-text-primary">{update.title}</h4>
            {update.whatChanged ? <p className="mt-2 text-body text-text-secondary">{update.whatChanged}</p> : null}
            {update.whatNext ? <p className="mt-2 text-label font-normal text-text-muted">Next: {update.whatNext}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectFilesSection({ fileLinks }) {
  if (!fileLinks.length) {
    return null
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Deliverables</p>
        <h3 className="mt-1 text-heading text-text-primary">Related files and links</h3>
      </div>
      <div className="grid gap-3">
        {fileLinks.map((fileLink) => (
          <article className="rounded-control border border-control-border bg-block-subtle p-4" key={fileLink.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge meta={fileLink.typeMeta} />
                  <StatusBadge meta={fileLink.statusMeta} />
                </div>
                <h4 className="mt-3 text-ui text-text-primary">{fileLink.title}</h4>
                {fileLink.description ? (
                  <p className="mt-2 line-clamp-2 text-body text-text-secondary">{fileLink.description}</p>
                ) : null}
              </div>
              {fileLink.url ? (
                <Button asChild className="shrink-0" size="sm" variant="outline">
                  <a href={fileLink.url} rel="noreferrer" target="_blank">
                    Open
                    <Icon name="arrowUpRight" size={13} />
                  </a>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectWorkItemsSection({ workItems }) {
  return (
    <section className="grid gap-3">
      <div>
        <p className="text-label text-text-muted">Active Work</p>
        <h3 className="mt-1 text-heading text-text-primary">Client-visible work items</h3>
      </div>
      {workItems.length ? (
        workItems.map((item) => <WorkItemCard item={item} key={item.id} />)
      ) : (
        <EmptyState
          description="No client-visible work items are published for this project yet."
          iconName="checkCircle2"
          title="No work items"
        />
      )}
    </section>
  )
}

export function ProjectDetailSection({ project }) {
  if (!project) {
    return (
      <Panel>
        <PanelBody>
          <EmptyState
            description="Choose a project from the list to view client-visible work."
            iconName="checkCircle2"
            title="Select a project"
          />
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader
        action={<StatusBadge meta={getStatusMeta(project.status)} />}
        subtitle={project.objective}
        title={project.name}
      />
      <PanelBody className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-label text-text-muted">Progress</p>
            <p className="mt-1 text-data text-text-primary">{project.progressPercent}%</p>
          </div>
          <div>
            <p className="text-label text-text-muted">Target</p>
            <p className="mt-1 text-ui text-text-primary">{formatDate(project.targetDate)}</p>
          </div>
          <div>
            <p className="text-label text-text-muted">Last updated</p>
            <p className="mt-1 text-ui text-text-primary">{formatDate(project.lastUpdatedAt)}</p>
          </div>
        </div>

        <WaitingOnYouSection actions={project.clientActions} />
        <ProjectTimelineSection timeline={project.timeline} />
        <ProjectBlockersSection blockers={project.blockers} />
        <ProjectFilesSection fileLinks={project.fileLinks} />
        <RelatedResultsSection links={project.relatedResultLinks} />
        <ProjectWorkItemsSection workItems={project.workItems} />
        <ProjectUpdatesSection updates={project.updates} />
      </PanelBody>
    </Panel>
  )
}
