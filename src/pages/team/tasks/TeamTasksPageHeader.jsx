import {
  loadTeamTasks,
  normalizeTeamTaskFilters,
  updateTeamTaskFilters,
} from './teamTaskFilterState'
import { TaskFilters } from './teamTaskFilters'

export function TeamTasksPageHeader({ routeParams = {}, runtime }) {
  const filters = normalizeTeamTaskFilters(routeParams)
  const taskData = loadTeamTasks(filters, runtime)

  return (
    <header className="border-b border-control-border bg-block">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="sr-only">Team Tasks</h1>
        <TaskFilters
          filters={filters}
          onChange={updateTeamTaskFilters}
          taskData={taskData}
        />
      </div>
    </header>
  )
}
