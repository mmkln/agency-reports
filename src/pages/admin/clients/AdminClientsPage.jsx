import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { normalizeBackendClientsPayload } from '../../../entities/client'
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

function createClientForm() {
  return {
    name: '',
  }
}

function CreateClientDialog({
  createStatus,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateName,
}) {
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
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            Create the parent client record. Workspaces are managed separately.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-component" id="create-client-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateName(event.target.value)}
              placeholder="Green Dental Group"
              required
              value={form.name}
            />
          </label>
          {error ? (
            <ErrorBlock title="Client could not be created">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={createStatus === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={createStatus === 'creating'} form="create-client-form" type="submit">
            {createStatus === 'creating' ? 'Creating...' : 'Add client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminClientsPage({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const isCreateDialogOpen = routeParams.createClient === 'true'
  const [clients, setClients] = useState([])
  const [form, setForm] = useState(() => createClientForm())
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  function applyClientsPayload(payload) {
    setClients(normalizeBackendClientsPayload(payload).clients)
    setStatus('ready')
  }

  function reloadClients() {
    return apiClient.get('/api/clients/')
      .then((payload) => {
        applyClientsPayload(payload)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    let isActive = true

    apiClient.get('/api/clients/')
      .then((payload) => {
        if (!isActive) {
          return
        }

        applyClientsPayload(payload)
      })
      .catch((caughtError) => {
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

  function createClient(event) {
    event.preventDefault()

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const name = form.name.trim()

    if (!agencyId || !name) {
      setCreateError('Agency and client name are required.')
      return
    }

    setCreateStatus('creating')
    setCreateError('')
    apiClient.post('/api/clients/', {
      agency_id: agencyId,
      name,
    }).then(() => {
      setForm(createClientForm())
      setCreateStatus('idle')
      void reloadClients()
      navigate('/admin/clients', { replace: true })
    }).catch((caughtError) => {
      setCreateError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  function closeCreateDialog() {
    if (createStatus === 'creating') {
      return
    }

    setForm(createClientForm())
    setCreateError('')
    navigate('/admin/clients', { replace: true })
  }

  return (
    <div className="grid gap-card">
      <CreateClientDialog
        createStatus={createStatus}
        error={createError}
        form={form}
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={createClient}
        onUpdateName={(name) => {
          setCreateError('')
          setForm((current) => ({ ...current, name }))
        }}
      />

      {error ? (
        <ErrorBlock title="Clients request failed">
          {error}
        </ErrorBlock>
      ) : null}

      <Panel>
        <PanelHeader divided title="Clients" />
        <PanelBody className="overflow-x-auto p-0">
          {status === 'loading' ? (
            <div className="min-h-[220px] animate-pulse" />
          ) : status === 'error' ? (
            <div className="p-card">
              <ErrorBlock title="Clients could not be loaded">
                {error}
              </ErrorBlock>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workspaces</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.status}</TableCell>
                    <TableCell>{client.workspace_count}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-tag">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/workspaces?clientAccountId=${client.id}`}>Workspaces</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/admin/workspaces?clientAccountId=${client.id}&createWorkspace=true`}>Add workspace</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-muted" colSpan={4}>
                      No clients yet.
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
