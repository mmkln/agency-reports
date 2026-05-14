import {
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/shared/ui'

import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'

function ScopeToggle({ filters, onChange }) {
  const isMine = filters.scope === 'mine'

  return (
    <div className="flex items-center justify-end gap-3 py-2">
      <span className="text-sm font-medium text-text-secondary">
        My tasks
      </span>
      <Switch
        aria-label="Show only my tasks"
        checked={isMine}
        onCheckedChange={(checked) => onChange({ ...filters, scope: checked ? 'mine' : 'all' })}
      />
    </div>
  )
}

export function TaskFilters({ filters, onChange, taskData }) {
  const projectOptions = taskData.projects
    .filter((project) => filters.clientId === 'all' || project.client_id === filters.clientId)

  return (
    <div className="grid gap-component">
      <label className="grid gap-2 text-sm font-medium text-text-secondary" htmlFor="task-search">
        <span className="sr-only">Search tasks</span>
        <span className="relative">
          <Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" name="search" size={16} />
          <Input
            className="bg-control pl-10"
            id="task-search"
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search tasks, clients..."
            type="text"
            value={filters.search}
          />
        </span>
      </label>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-4 sm:grid-cols-[220px_200px_170px_170px]">
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          <span>Client</span>
          <Select
            onValueChange={(value) => onChange({ ...filters, clientId: value, projectId: 'all' })}
            value={filters.clientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {taskData.clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          <span>Project</span>
          <Select
            onValueChange={(value) => onChange({ ...filters, projectId: value })}
            value={filters.projectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projectOptions.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          <span>Status</span>
          <Select
            onValueChange={(value) => onChange({ ...filters, status: value })}
            value={filters.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.values(TASK_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>{TASK_STATUS_META[status].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          <span>Visibility</span>
          <Select
            onValueChange={(value) => onChange({ ...filters, visibility: value })}
            value={filters.visibility}
          >
            <SelectTrigger>
              <SelectValue placeholder="All visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client visible</SelectItem>
              <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
            </SelectContent>
          </Select>
        </label>
        </div>
        {taskData.canUseMineFilter ? (
          <div className="lg:min-w-[160px]">
            <ScopeToggle filters={filters} onChange={onChange} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
