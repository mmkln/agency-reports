import { useMemo, useState } from 'react'

import {
  Badge,
  EmptyState,
} from '@/shared/ui'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { ActionNeededCard } from './ActionNeededCard'
import { ActionNeededDetailDialog } from './ActionNeededDetailDialog'
import { ActionNeededFilters } from './ActionNeededFilters'

function filterActions(actions, activeFilter) {
  if (activeFilter === 'all') {
    return actions
  }

  if (activeFilter === 'open') {
    return actions.filter((action) => action.status === NEEDED_ACTION_STATUSES.PENDING)
  }

  if (activeFilter === 'due_soon') {
    return actions.filter((action) => action.isDueSoon)
  }

  if (activeFilter === 'overdue') {
    return actions.filter((action) => action.isOverdue)
  }

  if (activeFilter === 'clinic') {
    return actions.filter((action) => action.clinicAction)
  }

  return actions.filter((action) => action.status === activeFilter)
}

export function ActionNeededInbox({ actions, counts, onAnswer }) {
  const [activeFilter, setActiveFilter] = useState('open')
  const [selectedActionId, setSelectedActionId] = useState(null)
  const filteredActions = useMemo(
    () => filterActions(actions, activeFilter),
    [actions, activeFilter],
  )
  const selectedAction = actions.find((action) => action.id === selectedActionId) ?? null

  return (
    <section className="grid gap-card">
      <div className="flex flex-col gap-component sm:flex-row sm:items-center sm:justify-between">
        <ActionNeededFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />
        <Badge className="w-fit" tone="neutral">{actions.length} action{actions.length === 1 ? '' : 's'}</Badge>
      </div>

      {filteredActions.length ? (
        <div className="grid gap-card">
          {filteredActions.map((action) => (
            <ActionNeededCard
              action={action}
              key={action.id}
              onViewDetails={(nextAction) => setSelectedActionId(nextAction.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="bg-block-subtle"
          description="No client actions match this view."
          iconName="checkCircle2"
          title="Nothing waiting here"
        />
      )}

      <ActionNeededDetailDialog
        action={selectedAction}
        isOpen={Boolean(selectedAction)}
        onAnswer={onAnswer}
        onClose={() => setSelectedActionId(null)}
      />
    </section>
  )
}
