import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

function createWorkspaceForm(clientId = '') {
  return {
    clientId,
    name: '',
    type: 'clinic',
  }
}

function CreateWorkspaceDialog({
  clients,
  createStatus,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateClientId,
  onUpdateName,
  onUpdateType,
}) {
  const hasClients = clients.length > 0

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create an operational workspace under a client when the work needs its own portal, data, or access scope.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-component" id="create-workspace-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client</span>
            <Select
              disabled={!hasClients}
              onChange={(event) => onUpdateClientId(event.target.value)}
              required
              value={form.clientId}
            >
              <option disabled={hasClients} value="">
                {hasClients ? 'Select client' : 'Create a client first'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateName(event.target.value)}
              placeholder="Green Dental - Main Clinic"
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace type</span>
            <Select onChange={(event) => onUpdateType(event.target.value)} value={form.type}>
              <option value="clinic">Clinic</option>
              <option value="generic">Generic</option>
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Workspace could not be created">
              {error}
            </ErrorBlock>
          ) : null}
          {!hasClients ? (
            <ErrorBlock title="Client is required">
              Add a client before creating a workspace.
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={createStatus === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!hasClients || createStatus === 'creating'} form="create-workspace-form" type="submit">
            {createStatus === 'creating' ? 'Creating...' : 'Create workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminWorkspacesPage({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const selectedClientAccountId = routeParams.clientAccountId ?? ''
  const isCreateDialogOpen = routeParams.createWorkspace === 'true'
  const [clients, setClients] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [form, setForm] = useState(() => createWorkspaceForm(selectedClientAccountId))
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  const filteredWorkspaces = useMemo(() => (
    selectedClientAccountId
      ? workspaces.filter((workspace) => workspace.client_id === selectedClientAccountId)
      : workspaces
  ), [selectedClientAccountId, workspaces])
  const selectedClient = clients.find((client) => client.id === selectedClientAccountId) ?? null

  function applyPayloads(workspacesPayload, clientsPayload) {
    setWorkspaces(workspacesPayload.workspaces ?? [])
    setClients(clientsPayload.clients ?? [])
    setStatus('ready')
  }

  function reloadPageData() {
    return Promise.all([
      apiClient.get('/api/workspaces/'),
      apiClient.get('/api/clients/'),
    ]).then(([workspacesPayload, clientsPayload]) => {
      applyPayloads(workspacesPayload, clientsPayload)
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('error')
    })
  }

  useEffect(() => {
    let isActive = true

    Promise.all([
      apiClient.get('/api/workspaces/'),
      apiClient.get('/api/clients/'),
    ]).then(([workspacesPayload, clientsPayload]) => {
      if (!isActive) {
        return
      }

      applyPayloads(workspacesPayload, clientsPayload)
    }).catch((caughtError) => {
      if (!isActive) {
        return
      }

      setError(caughtError.message)
      setStatus('error')
    })

    return () => {
      isActive = false
    }
  }, [apiClient])

  function createWorkspace(event) {
    event.preventDefault()

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const clientId = form.clientId || selectedClientAccountId
    const name = form.name.trim()

    if (!agencyId || !clientId || !name) {
      setCreateError('Agency, client, and workspace name are required.')
      return
    }

    setCreateStatus('creating')
    setCreateError('')
      apiClient.post('/api/workspaces/', {
        agency_id: agencyId,
      client_id: clientId,
      name,
      type: form.type,
    }).then((payload) => {
      const workspace = payload.workspace
      setForm(createWorkspaceForm(selectedClientAccountId))
      setCreateStatus('idle')
      void reloadPageData()
      if (workspace?.id) {
        navigate(`/admin/clinic-setup?clientId=${workspace.id}`)
      }
    }).catch((caughtError) => {
      setCreateError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  function closeCreateDialog() {
    if (createStatus === 'creating') {
      return
    }

    setForm(createWorkspaceForm(selectedClientAccountId))
    setCreateError('')
    navigate(
      selectedClientAccountId ? `/admin/workspaces?clientAccountId=${selectedClientAccountId}` : '/admin/workspaces',
      { replace: true },
    )
  }

  return (
    <div className="grid gap-card">
      <CreateWorkspaceDialog
        clients={clients}
        createStatus={createStatus}
        error={createError}
        form={{ ...form, clientId: form.clientId || selectedClientAccountId }}
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={createWorkspace}
        onUpdateClientId={(clientId) => {
          setCreateError('')
          setForm((current) => ({ ...current, clientId }))
        }}
        onUpdateName={(name) => {
          setCreateError('')
          setForm((current) => ({ ...current, name }))
        }}
        onUpdateType={(type) => {
          setCreateError('')
          setForm((current) => ({ ...current, type }))
        }}
      />

      {error ? (
        <ErrorBlock title="Workspaces request failed">
          {error}
        </ErrorBlock>
      ) : null}

      <Panel>
        <PanelHeader
          action={selectedClient ? (
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/workspaces">Show all</Link>
            </Button>
          ) : null}
          divided
          title={selectedClient ? `${selectedClient.name} workspaces` : 'Workspaces'}
        />
        <PanelBody className="overflow-x-auto p-0">
          {status === 'loading' ? (
            <div className="min-h-[220px] animate-pulse" />
          ) : status === 'error' ? (
            <div className="p-card">
              <ErrorBlock title="Workspaces could not be loaded">
                {error}
              </ErrorBlock>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">{workspace.name}</TableCell>
                    <TableCell>{workspace.client_name || 'Unassigned'}</TableCell>
                    <TableCell>{workspace.type}</TableCell>
                    <TableCell>{workspace.status}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-tag">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/clinic-setup?clientId=${workspace.id}`}>Setup</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/clinic-data-sources?clientId=${workspace.id}`}>Data</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/client/growth-review?clientId=${workspace.id}`}>Review</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWorkspaces.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-muted" colSpan={5}>
                      No workspaces yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
