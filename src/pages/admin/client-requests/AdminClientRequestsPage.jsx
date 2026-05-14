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

import { NEEDED_ACTION_STATUSES, NEEDED_ACTION_STATUS_META } from '../../../entities/needed-from-client'
import {
  cancelNeededAction,
  createNeededAction,
  listNeededActionsWorkspace,
  resolveNeededAction,
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
    relatedLink: '',
    title: '',
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
            <DialogTitle>New client request</DialogTitle>
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

            <div className="grid gap-3 sm:grid-cols-2">
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
                <Label htmlFor="request-link">Related link</Label>
                <Input
                  id="request-link"
                  onChange={(event) => onChange({ ...draft, relatedLink: event.target.value })}
                  placeholder="https://..."
                  value={draft.relatedLink}
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={!client || Boolean(saveState)} type="submit">
              {saveState || 'Create request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RequestCard({ action, onCancel, onResolve }) {
  const meta = NEEDED_ACTION_STATUS_META[action.status]
  const canResolve = [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status)
  const canCancel = action.status !== NEEDED_ACTION_STATUSES.CANCELLED
    && action.status !== NEEDED_ACTION_STATUSES.RESOLVED

  return (
    <Card className="bg-block py-0 shadow-none" data-testid={`request-card-${action.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">{action.title}</h2>
              <StatusBadge meta={meta} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
              <span>{formatDate(action.dueDate)}</span>
              <span aria-hidden="true">-</span>
              <span>{action.clientName}</span>
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
            {canResolve ? (
              <Button onClick={() => onResolve(action)} size="sm" type="button" variant="ghost">
                Resolve
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
    setRequestDraft(createInitialRequestDraft(client?.id ?? routeClientId))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function closeCreateDialog() {
    setIsCreateOpen(false)
    setRequestError('')
    setRequestSaveState('')
  }

  function reloadRequests() {
    void requestsResource.reload()
  }

  function submitRequest(event) {
    event.preventDefault()
    setRequestError('')
    setRequestSaveState('Creating...')

    runtime.dataClient.write((repositories) => createNeededAction({
      idGenerator: createUuid,
      input: requestDraft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdAction) => {
        setRequestSaveState('')
        setIsCreateOpen(false)
        reloadRequests()
        toast.success('Request created', `${createdAction.title} was added.`)
      })
      .catch((caughtError) => {
        setRequestError(caughtError.message)
        setRequestSaveState('')
        toast.error('Request was not created', caughtError.message)
      })
  }

  function resolveRequest(action) {
    void runtime.dataClient.write((repositories) => resolveNeededAction({
      actionId: action.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
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
      <PageShell className="px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-block shadow-none">
          <CardContent className="min-h-[260px] animate-pulse" />
        </Card>
      </PageShell>
    )
  }

  if (requestsResource.status === 'error' || !client) {
    return (
      <PageShell className="px-4 py-8 sm:px-6 lg:px-8">
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

      <PageShell className="px-4 py-6 sm:px-6 lg:px-8">
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
        error={requestError}
        isOpen={isCreateOpen}
        onChange={setRequestDraft}
        onClose={closeCreateDialog}
        onSubmit={submitRequest}
        saveState={requestSaveState}
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
