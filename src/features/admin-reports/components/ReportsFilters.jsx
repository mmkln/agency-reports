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
} from '@/shared/ui'

import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'

export const REPORT_FILTER_ALL = 'all'

function FilterField({ children, label }) {
  return (
    <label className="grid grid-cols-[minmax(4.5rem,0.75fr)_minmax(0,1fr)] items-center gap-control">
      <span className="text-label text-text-muted">{label}</span>
      {children}
    </label>
  )
}

const filterSelectTriggerClass = 'h-control-small border-transparent bg-control text-sm'

export function ReportsFilters({
  clients,
  filters,
  onReset,
  onUpdateFilter,
  reportingMonthOptions = [],
  resultCount,
  totalCount,
}) {
  const hasActiveFilters = Boolean(
    filters.search
    || filters.clientId !== REPORT_FILTER_ALL
    || filters.status !== REPORT_FILTER_ALL
    || filters.period,
  )
  const activeFilterCount = [
    filters.clientId !== REPORT_FILTER_ALL,
    filters.status !== REPORT_FILTER_ALL,
    Boolean(filters.period),
  ].filter(Boolean).length

  return (
    <div className="flex w-full flex-col gap-control sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-control sm:flex-row sm:items-center">
        <SearchField
          className="sm:max-w-search-compact"
          inputId="report-search"
          label="Search reports"
          onValueChange={(value) => onUpdateFilter('search', value)}
          value={filters.search}
        />
        <span className="text-label text-text-muted">
          Showing {resultCount} of {totalCount}
        </span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={activeFilterCount > 0 ? `${activeFilterCount} filters active` : 'Open report filters'}
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
              {hasActiveFilters ? (
                <Button onClick={onReset} size="xs" type="button" variant="ghost">
                  Clear
                </Button>
              ) : null}
            </div>
            <div className="grid gap-control">
              <FilterField label="Client">
                <Select onValueChange={(value) => onUpdateFilter('clientId', value)} value={filters.clientId}>
                  <SelectTrigger className={filterSelectTriggerClass} id="report-client-filter" size="sm">
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
              </FilterField>
              <FilterField label="Status">
                <Select onValueChange={(value) => onUpdateFilter('status', value)} value={filters.status}>
                  <SelectTrigger className={filterSelectTriggerClass} id="report-status-filter" size="sm">
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
              </FilterField>
              <FilterField label="Reporting month">
                <Select
                  onValueChange={(value) => onUpdateFilter('period', value === REPORT_FILTER_ALL ? '' : value)}
                  value={filters.period || REPORT_FILTER_ALL}
                >
                  <SelectTrigger className={filterSelectTriggerClass} id="report-period-filter" size="sm">
                    <SelectValue placeholder="All reporting months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={REPORT_FILTER_ALL}>All reporting months</SelectItem>
                    {reportingMonthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
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
