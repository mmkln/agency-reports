import { useMemo, useState } from 'react'

import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
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

  return actions.filter((action) => action.status === activeFilter)
}

export function ActionNeededSummary({ counts }) {
  return (
    <Panel>
      <PanelBody className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-label text-text-muted">Open</p>
          <p className="mt-1 text-data text-text-primary">{counts.open}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Due soon</p>
          <p className="mt-1 text-data text-text-primary">{counts.dueSoon}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Overdue</p>
          <p className="mt-1 text-data text-text-primary">{counts.overdue}</p>
        </div>
      </PanelBody>
    </Panel>
  )
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
    <Panel>
      <PanelHeader
        subtitle="Approvals, files, access, feedback, and questions waiting on the client."
        title="Action Needed"
      />
      <PanelBody className="grid gap-4">
        <ActionNeededFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        {filteredActions.length ? (
          <div className="grid gap-3">
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
      </PanelBody>
    </Panel>
  )
}
