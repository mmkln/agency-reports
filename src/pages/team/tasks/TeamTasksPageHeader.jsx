import {
  getTaskCreatePath,
  getTeamTaskFilterPath,
  loadTeamTasks,
  normalizeTeamTaskFilters,
} from './teamTaskFilterState'
import { TaskFilters } from './teamTaskFilters'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/ui'
import { Icon } from '../../../shared/icons'
import { USER_ROLES } from '../../../entities/profile'

function getTaskWorkspacePath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/tasks' : '/team/tasks'
}

export function TeamTasksPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const navigate = useNavigate()
  const filters = normalizeTeamTaskFilters(routeParams)
  const taskData = loadTeamTasks(filters, runtime)
  const basePath = activeRoute?.path ?? getTaskWorkspacePath(runtime.viewer)

  return (
    <header className="border-b border-control-border bg-block">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="sr-only">{activeRoute?.pageTitle ?? 'Tasks'}</h1>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <TaskFilters
            filters={filters}
            onChange={(nextFilters) => navigate(getTeamTaskFilterPath(nextFilters, basePath))}
            taskData={taskData}
          />
          <Button asChild className="shrink-0 bg-action text-action-foreground hover:bg-action-hover">
            <Link to={getTaskCreatePath(filters, basePath)}>
              <Icon name="plus" size={16} />
              New Task
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
