import { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  ConfirmationDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  PageShell,
  PrimitiveCard as Card,
  CardContent,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
  Textarea,
} from '@/shared/ui'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_STATUS_META,
} from '../../../entities/needed-from-client'
import {
  cancelNeededAction,
  createNeededAction,
  listNeededActionsWorkspace,
  reopenNeededAction,
  resolveNeededAction,
  updateNeededAction,
} from '../../../domain/services/neededFromClientService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

const statusFilters = [
  { label: 'Open', value: 'open' },
  { label: 'Answered', value: NEEDED_ACTION_STATUSES.ANSWERED },
  { label: 'Resolved', value: NEEDED_ACTION_STATUSES.RESOLVED },
  { label: 'Cancelled', value: NEEDED_ACTION_STATUSES.CANCELLED },
  { label: 'All', value: 'all' },
]

function createUuid() {
  return crypto.randomUUID()
}

function createInitialRequestDraft(clientId = '') {
  return {
    clientId,
    description: '',
    dueDate: '',
    internalNotes: '',
    ownerName: '',
    priority: NEEDED_ACTION_PRIORITIES.MEDIUM,
    relatedLink: '',
    title: '',
  }
}

function createRequestDraftFromAction(action) {
  return {
    clientId: action.clientId,
    description: action.description ?? '',
    dueDate: action.dueDate ?? '',
    internalNotes: action.internalNotes ?? '',
    ownerName: action.ownerName ?? '',
    priority: action.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
    relatedLink: action.relatedLink ?? '',
    title: action.title ?? '',
  }
}

function formatDate(date) {
  if (!date) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date) {
  if (!date) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getHistoryEventLabel(event) {
  const labels = {
    admin_cancelled: 'Request cancelled',
    admin_created: 'Request created',
    admin_reopened: 'Request reopened',
    admin_resolved: 'Request resolved',
    admin_updated: 'Request updated',
    client_answered: 'Client responded',
  }

  return labels[event?.type] ?? 'Request activity'
}

function filterActions(actions, statusFilter) {
  if (statusFilter === 'all') {
    return actions
  }

  if (statusFilter === 'open') {
    return actions.filter((action) => [
      NEEDED_ACTION_STATUSES.PENDING,
      NEEDED_ACTION_STATUSES.ANSWERED,
    ].includes(action.status))
  }

  return actions.filter((action) => action.status === statusFilter)
}

function RequestDialog({
  client,
  clients,
  draft,
  editingAction,
  error,
  isOpen,
  onChange,
  onClose,
  onSubmit,
  saveState,
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-modal-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editingAction ? 'Edit client request' : 'New client request'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="request-client">Client</Label>
              <Select
                onValueChange={(value) => onChange({ ...draft, clientId: value })}
                value={draft.clientId}
              >
                <SelectTrigger id="request-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="request-title">Title</Label>
              <Input
                id="request-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                placeholder="Approve creative batch"
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="request-description">Details</Label>
              <Textarea
                className="resize-none"
                id="request-description"
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                placeholder="What exactly do we need from the client?"
                value={draft.description}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="request-due-date">Due date</Label>
                <Input
                  id="request-due-date"
                  onChange={(event) => onChange({ ...draft, dueDate: event.target.value })}
                  type="date"
                  value={draft.dueDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-priority">Priority</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, priority: value })}
                  value={draft.priority}
                >
                  <SelectTrigger id="request-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(NEEDED_ACTION_PRIORITIES).map((priority) => (
                      <SelectItem key={priority} value={priority}>{NEEDED_ACTION_PRIORITY_META[priority].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-link">Related link</Label>
                <Input
                  id="request-link"
                  onChange={(event) => onChange({ ...draft, relatedLink: event.target.value })}
                  placeholder="https://..."
                  value={draft.relatedLink}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="request-owner">Owner</Label>
                <Input
                  id="request-owner"
                  onChange={(event) => onChange({ ...draft, ownerName: event.target.value })}
                  placeholder="Sarah Johnson"
                  value={draft.ownerName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-internal-notes">Internal notes</Label>
                <Textarea
                  className="resize-none"
                  id="request-internal-notes"
                  onChange={(event) => onChange({ ...draft, internalNotes: event.target.value })}
                  placeholder="Internal context. Never shown to the client."
                  value={draft.internalNotes}
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={!client || Boolean(saveState)} type="submit">
              {saveState || (editingAction ? 'Save changes' : 'Create request')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RequestDetailDialog({
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

          <div className="grid gap-3 rounded-control border border-control-border bg-surface-subtle p-4 text-sm sm:grid-cols-2">
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
            <h3 className="text-sm font-semibold text-text-primary">Client-facing description</h3>
            <p className="mt-2 rounded-control border border-control-border bg-block p-3 text-sm leading-6 text-text-secondary">
              {action.description || 'No description provided.'}
            </p>
          </div>

          {action.clientResponse ? (
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Client response</h3>
              <div className="mt-2 rounded-control border border-action/20 bg-action-muted p-3 text-sm text-action">
                <p className="leading-6">{action.clientResponse}</p>
                <p className="mt-2 text-xs">Sent {formatDateTime(action.respondedAt)}</p>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Internal notes</h3>
            <p className="mt-2 rounded-control border border-warning/20 bg-warning/10 p-3 text-sm leading-6 text-text-secondary">
              {action.internalNotes || 'No internal notes.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Lifecycle history</h3>
            {history.length > 0 ? (
              <ol className="mt-3 grid gap-2">
                {history.map((event, index) => (
                  <li className="rounded-control border border-control-border bg-block p-3 text-sm" key={`${event.type}-${event.created_at}-${index}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{getHistoryEventLabel(event)}</p>
                      <p className="text-xs text-text-muted">{formatDateTime(event.created_at)}</p>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Actor: {event.metadata?.actor_role ?? 'Unknown'}
                      {event.created_by ? ` · ${event.created_by}` : ''}
                    </p>
                    {event.metadata?.note ? (
                      <p className="mt-2 text-sm leading-5 text-text-secondary">{event.metadata.note}</p>
                    ) : null}
                    {event.metadata?.response ? (
                      <p className="mt-2 text-sm leading-5 text-text-secondary">{event.metadata.response}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 rounded-control border border-control-border bg-block p-3 text-sm text-text-muted">
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

function RequestCard({ action, onCancel, onEdit, onOpenDetail, onReopen, onResolve }) {
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
    <Card className="bg-block py-0 shadow-none" data-testid={`request-card-${action.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">{action.title}</h2>
              <StatusBadge meta={meta} />
              <StatusBadge meta={priorityMeta} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
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
              <p className="mt-3 max-w-readable text-sm leading-6 text-text-secondary">{action.description}</p>
            ) : null}
            {action.clientResponse ? (
              <div className="mt-3 rounded-control bg-action-muted px-3 py-2 text-sm text-action">
                <p className="font-medium">Client response</p>
                <p className="mt-1 leading-5">{action.clientResponse}</p>
              </div>
            ) : null}
            {action.internalNotes ? (
              <div className="mt-3 rounded-control border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">Internal notes</p>
                <p className="mt-1 leading-5">{action.internalNotes}</p>
              </div>
            ) : null}
            {action.relatedLink ? (
              <a
                className="mt-3 inline-flex items-center gap-1 text-sm text-link no-underline hover:text-link-hover"
                href={action.relatedLink}
                rel="noreferrer"
                target="_blank"
              >
                Open related link
                <Icon name="arrowUpRight" size={13} />
              </a>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
      </CardContent>
    </Card>
  )
}

export function AdminClientRequestsPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const routeClientId = routeParams.clientId
  const [statusFilter, setStatusFilter] = useState('open')
  const [isCreateOpen, setIsCreateOpen] = useState(routeParams.newRequest === 'true')
  const [requestDraft, setRequestDraft] = useState(() => createInitialRequestDraft(routeClientId))
  const [requestError, setRequestError] = useState('')
  const [requestSaveState, setRequestSaveState] = useState('')
  const [editingAction, setEditingAction] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [pendingCancel, setPendingCancel] = useState(null)
  const requestsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-requests:${routeClientId ?? ''}`,
    initialData: {
      actions: [],
      clients: [],
    },
    load: () => runtime.dataClient.read((repositories) => listNeededActionsWorkspace({
      filters: {
        clientId: routeClientId || 'all',
      },
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const requestData = requestsResource.data ?? { actions: [], clients: [] }
  const clients = requestData.clients
  const client = clients.find((item) => item.id === routeClientId) ?? clients[0] ?? null
  const actions = requestData.actions
  const filteredActions = useMemo(() => filterActions(actions, statusFilter), [actions, statusFilter])
  const openCount = actions.filter((action) => [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status)).length

  function openCreateDialog() {
    setEditingAction(null)
    setRequestDraft(createInitialRequestDraft(client?.id ?? routeClientId))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function openEditDialog(action) {
    setSelectedAction(null)
    setEditingAction(action)
    setRequestDraft(createRequestDraftFromAction(action))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function closeCreateDialog() {
    setIsCreateOpen(false)
    setEditingAction(null)
    setRequestError('')
    setRequestSaveState('')
  }

  function reloadRequests() {
    void requestsResource.reload()
  }

  function submitRequest(event) {
    event.preventDefault()
    setRequestError('')
    setRequestSaveState(editingAction ? 'Saving...' : 'Creating...')

    const operation = editingAction
      ? (repositories) => updateNeededAction({
          actionId: editingAction.id,
          input: requestDraft,
          repositories,
          viewer: runtime.viewer,
        })
      : (repositories) => createNeededAction({
          idGenerator: createUuid,
          input: requestDraft,
          repositories,
          viewer: runtime.viewer,
        })

    runtime.dataClient.write(operation)
      .then((savedAction) => {
        setRequestSaveState('')
        setEditingAction(null)
        setSelectedAction(null)
        setIsCreateOpen(false)
        reloadRequests()
        toast.success(editingAction ? 'Request updated' : 'Request created', `${savedAction.title} was saved.`)
      })
      .catch((caughtError) => {
        setRequestError(caughtError.message)
        setRequestSaveState('')
        toast.error('Request was not created', caughtError.message)
      })
  }

  function reopenRequest(action) {
    void runtime.dataClient.write((repositories) => reopenNeededAction({
      actionId: action.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request reopened', `${action.title} is pending again.`)
      })
      .catch((caughtError) => {
        toast.error('Request was not reopened', caughtError.message)
      })
  }

  function resolveRequest(action) {
    void runtime.dataClient.write((repositories) => resolveNeededAction({
      actionId: action.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request resolved', `${action.title} was marked resolved.`)
      })
      .catch((caughtError) => {
        toast.error('Request was not resolved', caughtError.message)
      })
  }

  function cancelRequest() {
    if (!pendingCancel) {
      return
    }

    void runtime.dataClient.write((repositories) => cancelNeededAction({
      actionId: pendingCancel.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request cancelled', `${pendingCancel.title} was cancelled.`)
        setPendingCancel(null)
      })
      .catch((caughtError) => {
        toast.error('Request was not cancelled', caughtError.message)
        setPendingCancel(null)
      })
  }

  if (requestsResource.status === 'loading') {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <Card className="bg-block shadow-none">
          <CardContent className="min-h-[260px] animate-pulse" />
        </Card>
      </PageShell>
    )
  }

  if (requestsResource.status === 'error' || !client) {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <Card className="bg-block shadow-none">
          <CardContent className="flex min-h-[260px] items-center justify-center text-sm text-destructive">
            {requestsResource.error || 'Client was not found.'}
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button onClick={openCreateDialog} size="sm" type="button">
            <Icon name="plus" size={14} />
            New Request
          </Button>
        )}
        client={client}
        currentPage="requests"
        eyebrow="Client requests"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <div className="grid gap-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit rounded-full bg-control p-micro">
              {statusFilters.map((filter) => (
                <button
                  className={`h-control-small rounded-full px-control text-label transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-control-selected text-text-primary'
                      : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
                  }`}
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <Badge className="w-fit bg-control text-text-secondary" variant="outline">
              {openCount} open
            </Badge>
          </div>

          {filteredActions.length > 0 ? (
            <div className="grid gap-2">
              {filteredActions.map((action) => (
                <RequestCard
                  action={action}
                  key={action.id}
                  onCancel={setPendingCancel}
                  onEdit={openEditDialog}
                  onOpenDetail={setSelectedAction}
                  onReopen={reopenRequest}
                  onResolve={resolveRequest}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-block py-0 shadow-none">
              <CardContent className="flex min-h-[180px] items-center justify-center text-sm text-text-muted">
                No requests in this view.
              </CardContent>
            </Card>
          )}
        </div>
      </PageShell>

      <RequestDialog
        client={client}
        clients={clients}
        draft={requestDraft}
        editingAction={editingAction}
        error={requestError}
        isOpen={isCreateOpen}
        onChange={setRequestDraft}
        onClose={closeCreateDialog}
        onSubmit={submitRequest}
        saveState={requestSaveState}
      />

      <RequestDetailDialog
        action={selectedAction}
        onCancel={setPendingCancel}
        onClose={() => setSelectedAction(null)}
        onEdit={openEditDialog}
        onReopen={reopenRequest}
        onResolve={resolveRequest}
      />

      <ConfirmationDialog
        confirmLabel="Cancel request"
        description={
          pendingCancel
            ? `${pendingCancel.title} will no longer appear as an active client request.`
            : ''
        }
        onConfirm={cancelRequest}
        onOpenChange={(open) => {
          if (!open) {
            setPendingCancel(null)
          }
        }}
        open={Boolean(pendingCancel)}
        title="Cancel client request?"
        tone="destructive"
      />
    </>
  )
}
