import { FilterTabs } from '@/shared/ui'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'

const filters = [
  { label: 'Open', value: 'open' },
  { label: 'Clinic', value: 'clinic' },
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
    clinic: counts.clinic,
    completed: counts.completed,
    due_soon: counts.dueSoon,
    open: counts.open,
    overdue: counts.overdue,
    resolved: counts.completed,
  }[value]
}

export function ActionNeededFilters({ activeFilter, counts, onChange }) {
  const items = filters
    .filter((filter) => filter.value !== 'clinic' || counts.clinic > 0)
    .map((filter) => ({
      count: getFilterCount({
        counts,
        value: filter.value,
      }) ?? 0,
      label: filter.label,
      value: filter.value,
    }))

  return (
    <FilterTabs
      ariaLabel="Action needed filters"
      items={items}
      onValueChange={onChange}
      value={activeFilter}
    />
  )
}
