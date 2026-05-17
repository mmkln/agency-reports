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

import { formatDate, getStatusMeta } from './projectDisplay'

const projectFilters = [
  { countKey: 'active', label: 'Active', value: 'active' },
  { countKey: 'waitingOnMe', label: 'Waiting on me', value: 'waiting_on_me' },
  { countKey: 'completed', label: 'Completed', value: 'completed' },
  { countKey: 'archived', label: 'Archived', value: 'archived' },
  { countKey: 'all', label: 'All', value: 'all' },
]

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
          <Link to={`/client/projects?clientId=${clientId}&projectId=${project.id}&filter=all`}>
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

function ProjectFilters({ clientId, counts, filter }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max items-center gap-tag">
        {projectFilters.map((item) => (
          <Button
            asChild
            key={item.value}
            size="sm"
            variant={filter === item.value ? 'primary' : 'ghost'}
          >
            <Link to={`/client/projects?clientId=${clientId}&filter=${item.value}`}>
              {item.label}
              <span className="ml-1 text-label font-normal opacity-75">{counts[item.countKey] ?? 0}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}

export function ProjectsListSection({ clientId, counts, filter, projects, selectedProject }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="Client-visible workstreams, not the agency's internal task system."
        title="Projects"
      />
      <PanelBody className="grid gap-3">
        <ProjectFilters clientId={clientId} counts={counts} filter={filter} />
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
