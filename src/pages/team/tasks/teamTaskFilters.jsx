import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadixSelect as Select,
  SearchField,
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
    <div className="flex h-control-small shrink-0 items-center justify-end gap-3">
      <span className="text-label text-text-secondary">
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

function FilterField({ children, label }) {
  return (
    <label className="grid grid-cols-[minmax(4.5rem,0.75fr)_minmax(0,1fr)] items-center gap-control">
      <span className="text-label text-text-muted">{label}</span>
      {children}
    </label>
  )
}

const filterSelectTriggerClass = 'h-control-small border-transparent bg-control text-sm'

export function TaskFilters({ filters, onChange, taskData }) {
  const projectOptions = taskData.projects
    .filter((project) => filters.clientId === 'all' || project.client_id === filters.clientId)
  const activeFilterCount = [
    filters.clientId !== 'all',
    filters.projectId !== 'all',
    filters.status !== 'all',
    filters.visibility !== 'all',
  ].filter(Boolean).length

  function clearFilters() {
    onChange({
      ...filters,
      clientId: 'all',
      projectId: 'all',
      status: 'all',
      visibility: 'all',
    })
  }

  return (
    <div className="flex w-full flex-col gap-control sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-control sm:flex-row sm:items-center">
        {taskData.canUseMineFilter ? (
          <ScopeToggle filters={filters} onChange={onChange} />
        ) : null}
        <SearchField
          className="sm:max-w-search-compact"
          inputId="task-search"
          label="Search tasks"
          onValueChange={(value) => onChange({ ...filters, search: value })}
          value={filters.search}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={activeFilterCount > 0 ? `${activeFilterCount} filters active` : 'Open task filters'}
            className={`w-full justify-between sm:w-32 ${
              activeFilterCount > 0 ? 'bg-control-selected text-text-primary' : ''
            }`}
            size="sm"
            type="button"
            variant="secondary"
          >
            <span>Filters</span>
            {activeFilterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold leading-none text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : (
              <Icon className="text-text-muted" name="chevronDown" size={14} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-popover p-card">
          <div className="grid gap-component">
            <div className="flex items-center justify-between gap-component">
              <p className="text-sm font-semibold text-text-primary">Filters</p>
              {activeFilterCount > 0 ? (
                <Button onClick={clearFilters} size="xs" type="button" variant="ghost">
                  Clear
                </Button>
              ) : null}
            </div>
            <div className="grid gap-control">
              <FilterField label="Client">
                <Select
                  onValueChange={(value) => onChange({ ...filters, clientId: value, projectId: 'all' })}
                  value={filters.clientId}
                >
                  <SelectTrigger className={filterSelectTriggerClass} size="sm">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {taskData.clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Project">
                <Select
                  onValueChange={(value) => onChange({ ...filters, projectId: value })}
                  value={filters.projectId}
                >
                  <SelectTrigger className={filterSelectTriggerClass} size="sm">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projectOptions.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Status">
                <Select
                  onValueChange={(value) => onChange({ ...filters, status: value })}
                  value={filters.status}
                >
                  <SelectTrigger className={filterSelectTriggerClass} size="sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {Object.values(TASK_STATUSES).map((status) => (
                      <SelectItem key={status} value={status}>{TASK_STATUS_META[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Visibility">
                <Select
                  onValueChange={(value) => onChange({ ...filters, visibility: value })}
                  value={filters.visibility}
                >
                  <SelectTrigger className={filterSelectTriggerClass} size="sm">
                    <SelectValue placeholder="All visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All visibility</SelectItem>
                    <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client visible</SelectItem>
                    <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
