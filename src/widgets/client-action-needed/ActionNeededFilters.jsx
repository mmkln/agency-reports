import { Button } from '@/shared/ui'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'

const filters = [
  { label: 'Open', value: 'open' },
  { label: 'Due soon', value: 'due_soon' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Answered', value: NEEDED_ACTION_STATUSES.ANSWERED },
  { label: 'Approved', value: NEEDED_ACTION_STATUSES.APPROVED },
  { label: 'Changes requested', value: NEEDED_ACTION_STATUSES.CHANGES_REQUESTED },
  { label: 'Completed', value: NEEDED_ACTION_STATUSES.RESOLVED },
  { label: 'All', value: 'all' },
]

function getFilterCount({ counts, value }) {
  return {
    all: counts.all,
    answered: counts.answered,
    approved: counts.approved,
    changes_requested: counts.changesRequested,
    completed: counts.completed,
    due_soon: counts.dueSoon,
    open: counts.open,
    overdue: counts.overdue,
    resolved: counts.completed,
  }[value]
}

export function ActionNeededFilters({ activeFilter, counts, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max items-center gap-tag">
        {filters.map((filter) => {
          const selected = activeFilter === filter.value
          const count = getFilterCount({
            counts,
            value: filter.value,
          })

          return (
            <Button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              size="sm"
              type="button"
              variant={selected ? 'primary' : 'ghost'}
            >
              {filter.label}
              <span className="ml-1 text-label font-normal opacity-75">{count ?? 0}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
