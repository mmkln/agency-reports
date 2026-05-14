import {
  Button,
  Input,
  PrimitiveCard as Card,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'

export const REPORT_FILTER_ALL = 'all'

export function ReportsFilters({
  clients,
  filters,
  onReset,
  onUpdateFilter,
  resultCount,
  totalCount,
}) {
  const hasActiveFilters = Boolean(
    filters.search
    || filters.clientId !== REPORT_FILTER_ALL
    || filters.status !== REPORT_FILTER_ALL
    || filters.period,
  )

  return (
    <Card className="border-control-border bg-block p-4 shadow-none">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_180px_170px_auto] lg:items-end">
        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase" htmlFor="report-search">
            Search
          </label>
          <div className="relative">
            <Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-quaternary" name="search" size={16} />
            <Input
              className="pl-9"
              id="report-search"
              onChange={(event) => onUpdateFilter('search', event.target.value)}
              placeholder="Search title, summary, results..."
              value={filters.search}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase" htmlFor="report-client-filter">
            Client
          </label>
          <Select onValueChange={(value) => onUpdateFilter('clientId', value)} value={filters.clientId}>
            <SelectTrigger id="report-client-filter">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={REPORT_FILTER_ALL}>All clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase" htmlFor="report-status-filter">
            Status
          </label>
          <Select onValueChange={(value) => onUpdateFilter('status', value)} value={filters.status}>
            <SelectTrigger id="report-status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={REPORT_FILTER_ALL}>All statuses</SelectItem>
              {Object.values(REPORT_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>
                  {REPORT_STATUS_META[status]?.label ?? status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase" htmlFor="report-period-filter">
            Period
          </label>
          <Input
            id="report-period-filter"
            onChange={(event) => onUpdateFilter('period', event.target.value)}
            type="month"
            value={filters.period}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Button disabled={!hasActiveFilters} onClick={onReset} type="button" variant="outline">
            Reset
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs text-text-muted">
        Showing {resultCount} of {totalCount} reports.
      </p>
    </Card>
  )
}
