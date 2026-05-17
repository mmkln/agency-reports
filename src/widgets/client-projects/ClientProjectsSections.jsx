import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  Progress,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_WORK_ITEM_STATUS_META } from '../../entities/client-work-item'
import { Icon } from '../../shared/icons'

function formatDate(date) {
  if (!date) {
    return 'No target date'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No target date'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function getStatusMeta(status) {
  return CLIENT_WORK_ITEM_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function ProjectCard({ clientId, isSelected, project }) {
  return (
    <article className={isSelected
      ? 'rounded-block border border-action/25 bg-action-muted p-4'
      : 'rounded-block border border-control-border bg-block p-4'}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-ui text-text-primary">{project.name}</h3>
            <StatusBadge meta={getStatusMeta(project.status)} />
          </div>
          <p className="mt-2 line-clamp-2 text-body text-text-secondary">{project.objective}</p>
        </div>
        <Button asChild className="shrink-0" size="sm" variant={isSelected ? 'primary' : 'outline'}>
          <Link to={`/client/projects?clientId=${clientId}&projectId=${project.id}`}>
            View project
          </Link>
        </Button>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label text-text-muted">Progress</span>
          <span className="text-label text-text-primary">{project.progressPercent}%</span>
        </div>
        <Progress aria-label={`${project.name} progress`} value={project.progressPercent} />
      </div>

      <div className="mt-4 grid gap-2 text-label font-normal text-text-muted sm:grid-cols-3">
        <span>{project.workItems.length} work item{project.workItems.length === 1 ? '' : 's'}</span>
        <span>{project.clientActions.length} open action{project.clientActions.length === 1 ? '' : 's'}</span>
        <span>Target {formatDate(project.targetDate)}</span>
      </div>
    </article>
  )
}

export function ProjectsListSection({ clientId, projects, selectedProject }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="Client-visible workstreams, not the agency's internal task system."
        title="Projects"
      />
      <PanelBody className="grid gap-3">
        {projects.length ? (
          projects.map((project) => (
            <ProjectCard
              clientId={clientId}
              isSelected={selectedProject?.id === project.id}
              key={project.id}
              project={project}
            />
          ))
        ) : (
          <EmptyState
            description="Published client-visible work will appear here after agency review."
            iconName="checkCircle2"
            title="No visible projects yet"
          />
        )}
      </PanelBody>
    </Panel>
  )
}

function WorkItemCard({ item }) {
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
        <ProjectFilesSection fileLinks={project.fileLinks} />

        <section className="grid gap-3">
          <div>
            <p className="text-label text-text-muted">Active Work</p>
            <h3 className="mt-1 text-heading text-text-primary">Client-visible work items</h3>
          </div>
          {project.workItems.length ? (
            project.workItems.map((item) => <WorkItemCard item={item} key={item.id} />)
          ) : (
            <EmptyState
              description="No client-visible work items are published for this project yet."
              iconName="checkCircle2"
              title="No work items"
            />
          )}
        </section>
      </PanelBody>
    </Panel>
  )
}
