import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createBackendApiClient } from '@/shared/api/backendApiClient'
import {
  Button,
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
    type: 'clinic',
  }
}

export function AdminClientsPage({ runtime }) {
  const apiClient = useMemo(() => createBackendApiClient(), [])
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [form, setForm] = useState(() => createClientForm())
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  function applyWorkspacesPayload(payload) {
    setWorkspaces(payload.workspaces ?? [])
    setStatus('ready')
  }

  function reloadWorkspaces() {
    return apiClient.get('/api/workspaces/')
      .then((payload) => {
        applyWorkspacesPayload(payload)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    let isActive = true

    apiClient.get('/api/workspaces/')
      .then((payload) => {
        if (!isActive) {
          return
        }

        applyWorkspacesPayload(payload)
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

  function createWorkspace(event) {
    event.preventDefault()

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const name = form.name.trim()

    if (!agencyId || !name) {
      setError('Agency and workspace name are required.')
      return
    }

    setCreateStatus('creating')
    setError('')
    apiClient.post('/api/workspaces/', {
      agency_id: agencyId,
      name,
      type: form.type,
    }).then((payload) => {
      const workspace = payload.workspace
      setForm(createClientForm())
      setCreateStatus('idle')
      void reloadWorkspaces()
      if (workspace?.id) {
        navigate(`/admin/clinic-setup?clientId=${workspace.id}`)
      }
    }).catch((caughtError) => {
      setError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  return (
    <div className="grid gap-card">
      <Panel>
        <PanelHeader
          divided
          subtitle="Backend workspaces managed through active agency relationships."
          title="Create clinic workspace"
        />
        <PanelBody>
          <form className="flex flex-col gap-control sm:flex-row" onSubmit={createWorkspace}>
            <Input
              aria-label="Workspace name"
              className="min-w-0 flex-1"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Green Dental"
              required
              value={form.name}
            />
            <Button disabled={createStatus === 'creating'} type="submit">
              {createStatus === 'creating' ? 'Creating...' : 'Create workspace'}
            </Button>
          </form>
        </PanelBody>
      </Panel>

      {error ? (
        <ErrorBlock title="Clients request failed">
          {error}
        </ErrorBlock>
      ) : null}

      <Panel>
        <PanelHeader divided title="Client workspaces" />
        <PanelBody className="overflow-x-auto p-0">
          {status === 'loading' ? (
            <div className="min-h-[220px] animate-pulse" />
          ) : status === 'error' ? (
            <div className="p-card">
              <ErrorBlock title="Client workspaces could not be loaded">
                {error}
              </ErrorBlock>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">{workspace.name}</TableCell>
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
                {workspaces.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-muted" colSpan={4}>
                      No managed workspaces yet.
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
