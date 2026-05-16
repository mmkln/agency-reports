import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  getHistoryEventLabel,
} from '../../widgets/admin-client-requests/requestFormatters'

export function RequestDetailDialog({
  action,
  onCancel,
  onClose,
  onEdit,
  onReopen,
  onResolve,
}) {
  if (!action) {
    return null
  }

  const meta = NEEDED_ACTION_STATUS_META[action.status]
  const priorityMeta = NEEDED_ACTION_PRIORITY_META[action.priority] ?? NEEDED_ACTION_PRIORITY_META[NEEDED_ACTION_PRIORITIES.MEDIUM]
  const canResolve = [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status)
  const canCancel = action.status !== NEEDED_ACTION_STATUSES.CANCELLED
    && action.status !== NEEDED_ACTION_STATUSES.RESOLVED
  const canReopen = action.status !== NEEDED_ACTION_STATUSES.PENDING
  const history = [...(action.responseHistory ?? [])].reverse()

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={Boolean(action)}>
      <DialogContent className="max-w-modal-lg">
        <DialogHeader>
          <DialogTitle>{action.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={meta} />
            <StatusBadge meta={priorityMeta} />
            <Badge className="bg-control text-text-secondary" variant="outline">
              Updated {formatDateTime(action.updatedAt)}
            </Badge>
          </div>

          <div className="grid gap-3 rounded-control border border-control-border bg-surface-subtle p-4 text-ui sm:grid-cols-2">
            <div>
              <p className="text-label text-text-muted">Client</p>
              <p className="mt-1 font-medium text-text-primary">{action.clientName}</p>
            </div>
            <div>
              <p className="text-label text-text-muted">Owner</p>
              <p className="mt-1 font-medium text-text-primary">{action.ownerName || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-label text-text-muted">Due date</p>
              <p className="mt-1 font-medium text-text-primary">{formatDate(action.dueDate)}</p>
            </div>
            <div>
              <p className="text-label text-text-muted">Related link</p>
              {action.relatedLink ? (
                <a
                  className="mt-1 inline-flex items-center gap-1 font-medium text-link no-underline hover:text-link-hover"
                  href={action.relatedLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open link
                  <Icon name="arrowUpRight" size={13} />
                </a>
              ) : (
                <p className="mt-1 font-medium text-text-primary">No link</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-ui text-text-primary">Client-facing description</h3>
            <p className="mt-2 rounded-control border border-control-border bg-block p-3 text-body text-text-secondary">
              {action.description || 'No description provided.'}
            </p>
          </div>

          {action.clientResponse ? (
            <div>
              <h3 className="text-ui text-text-primary">Client response</h3>
              <div className="mt-2 rounded-control border border-action/20 bg-action-muted p-3 text-ui text-action">
                <p className="text-body">{action.clientResponse}</p>
                <p className="mt-2 text-label">Sent {formatDateTime(action.respondedAt)}</p>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-ui text-text-primary">Internal notes</h3>
            <p className="mt-2 rounded-control border border-warning/20 bg-warning/10 p-3 text-body text-text-secondary">
              {action.internalNotes || 'No internal notes.'}
            </p>
          </div>

          <div>
            <h3 className="text-ui text-text-primary">Lifecycle history</h3>
            {history.length > 0 ? (
              <ol className="mt-3 grid gap-2">
                {history.map((event, index) => (
                  <li className="rounded-control border border-control-border bg-block p-3 text-ui" key={`${event.type}-${event.created_at}-${index}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{getHistoryEventLabel(event)}</p>
                      <p className="text-label font-normal text-text-muted">{formatDateTime(event.created_at)}</p>
                    </div>
                    <p className="mt-1 text-label font-normal text-text-muted">
                      Actor: {event.metadata?.actor_role ?? 'Unknown'}
                      {event.created_by ? ` - ${event.created_by}` : ''}
                    </p>
                    {event.metadata?.note ? (
                      <p className="mt-2 text-ui text-text-secondary">{event.metadata.note}</p>
                    ) : null}
                    {event.metadata?.response ? (
                      <p className="mt-2 text-ui text-text-secondary">{event.metadata.response}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 rounded-control border border-control-border bg-block p-3 text-ui text-text-muted">
                No lifecycle events recorded yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">Close</Button>
          <Button onClick={() => onEdit(action)} type="button" variant="outline">Edit</Button>
          {canResolve ? <Button onClick={() => onResolve(action)} type="button">Resolve</Button> : null}
          {canReopen ? <Button onClick={() => onReopen(action)} type="button" variant="outline">Reopen</Button> : null}
          {canCancel ? (
            <Button className="text-destructive hover:text-destructive" onClick={() => onCancel(action)} type="button" variant="ghost">
              Cancel
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
