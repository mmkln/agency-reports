import {
  Badge,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_STATUS_META,
} from '../../entities/needed-from-client'
import { Icon } from '../../shared/icons'
import {
  formatDate,
  formatDateTime,
  statusFilters,
} from './requestFormatters'

function RequestCard({
  action,
  onCancel,
  onEdit,
  onOpenDetail,
  onReopen,
  onResolve,
}) {
  const meta = NEEDED_ACTION_STATUS_META[action.status]
  const priorityMeta = NEEDED_ACTION_PRIORITY_META[action.priority] ?? NEEDED_ACTION_PRIORITY_META[NEEDED_ACTION_PRIORITIES.MEDIUM]
  const canResolve = [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status)
  const canCancel = action.status !== NEEDED_ACTION_STATUSES.CANCELLED
    && action.status !== NEEDED_ACTION_STATUSES.RESOLVED
  const canReopen = action.status !== NEEDED_ACTION_STATUSES.PENDING

  return (
    <Panel data-testid={`request-card-${action.id}`}>
      <PanelBody>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-ui text-text-primary">{action.title}</h2>
              <StatusBadge meta={meta} />
              <StatusBadge meta={priorityMeta} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-normal text-text-muted">
              <span>{formatDate(action.dueDate)}</span>
              <span aria-hidden="true">-</span>
              <span>{action.clientName}</span>
              <span aria-hidden="true">-</span>
              <span>Updated {formatDateTime(action.updatedAt)}</span>
              {action.ownerName ? (
                <>
                  <span aria-hidden="true">-</span>
                  <span>Owner: {action.ownerName}</span>
                </>
              ) : null}
            </div>
            {action.description ? (
              <p className="mt-3 max-w-readable text-body text-text-secondary">{action.description}</p>
            ) : null}
            {action.clientResponse ? (
              <div className="mt-3 rounded-control bg-action-muted px-3 py-2 text-ui text-action">
                <p className="font-medium">Client response</p>
                <p className="mt-1 text-ui">{action.clientResponse}</p>
              </div>
            ) : null}
            {action.internalNotes ? (
              <div className="mt-3 rounded-control border border-warning/20 bg-warning/10 px-3 py-2 text-ui text-text-secondary">
                <p className="font-medium text-text-primary">Internal notes</p>
                <p className="mt-1 text-ui">{action.internalNotes}</p>
              </div>
            ) : null}
            {action.relatedLink ? (
              <a
                className="mt-3 inline-flex items-center gap-1 text-ui text-link no-underline hover:text-link-hover"
                href={action.relatedLink}
                rel="noreferrer"
                target="_blank"
              >
                Open related link
                <Icon name="arrowUpRight" size={13} />
              </a>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
            <Button onClick={() => onOpenDetail(action)} size="sm" type="button" variant="outline">
              Details
            </Button>
            <Button onClick={() => onEdit(action)} size="sm" type="button" variant="ghost">
              Edit
            </Button>
            {canResolve ? (
              <Button onClick={() => onResolve(action)} size="sm" type="button" variant="ghost">
                Resolve
              </Button>
            ) : null}
            {canReopen ? (
              <Button onClick={() => onReopen(action)} size="sm" type="button" variant="ghost">
                Reopen
              </Button>
            ) : null}
            {canCancel ? (
              <Button className="text-destructive hover:text-destructive" onClick={() => onCancel(action)} size="sm" type="button" variant="ghost">
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function AdminClientRequestsWorkspace({
  filteredActions,
  onCancel,
  onEdit,
  onOpenDetail,
  onReopen,
  onResolve,
  onStatusFilterChange,
  openCount,
  statusFilter,
}) {
  return (
    <div className="grid grid-cols-1 gap-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-micro">
          {statusFilters.map((filter) => (
            <Button
              aria-pressed={statusFilter === filter.value}
              className={statusFilter === filter.value ? 'bg-control-selected text-text-primary' : 'text-text-secondary'}
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <Badge className="w-fit bg-control text-text-secondary" variant="outline">
          {openCount} open
        </Badge>
      </div>

      {filteredActions.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {filteredActions.map((action) => (
            <RequestCard
              action={action}
              key={action.id}
              onCancel={onCancel}
              onEdit={onEdit}
              onOpenDetail={onOpenDetail}
              onReopen={onReopen}
              onResolve={onResolve}
            />
          ))}
        </div>
      ) : (
        <Panel>
          <PanelBody>
            <EmptyState
              description="Client action items that match the selected view will appear here."
              iconName="bell"
              title="No requests in this view"
            />
          </PanelBody>
        </Panel>
      )}
    </div>
  )
}
