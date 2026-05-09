import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'

function ScopeToggle({ filters, onChange }) {
  const isMine = filters.scope === 'mine'

  return (
    <div className="flex items-center justify-end gap-3 py-2">
      <span className="text-sm font-medium text-slate-600">
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
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-4 sm:grid-cols-[220px_170px_170px]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          <span>Client</span>
          <Select
            onValueChange={(value) => onChange({ ...filters, clientId: value })}
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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
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
      <div className="lg:min-w-[160px]">
        <ScopeToggle filters={filters} onChange={onChange} />
      </div>
    </div>
  )
}
