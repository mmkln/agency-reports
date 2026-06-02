import { useCallback, useEffect, useState } from 'react'

import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'
import { normalizeResourceError } from '@/shared/data/resourceError'
import {
  Button,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  ResourceState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

function createConnectionForm() {
  return {
    external_account_id: '',
    provider: 'ghl',
  }
}

export function AdminClinicDataSourcesPage({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const workspaceId = routeParams.workspaceId ?? routeParams.clientId ?? runtime.defaultClientId
  const [connections, setConnections] = useState([])
  const [form, setForm] = useState(() => createConnectionForm())
  const [createError, setCreateError] = useState('')
  const [loadErrorInfo, setLoadErrorInfo] = useState(null)
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  const loadConnections = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve()
    }

    setStatus('loading')
    setLoadErrorInfo(null)

    return apiClient.get(`/api/workspaces/${workspaceId}/source-connections/`)
      .then((payload) => {
        setConnections(payload.source_connections ?? [])
        setStatus('ready')
      })
      .catch((caughtError) => {
        setLoadErrorInfo(normalizeResourceError(caughtError))
        setStatus('error')
      })
  }, [apiClient, workspaceId])

  useEffect(() => {
    void Promise.resolve().then(loadConnections)
  }, [loadConnections])

  function createConnection(event) {
    event.preventDefault()

    if (!form.external_account_id.trim()) {
      setCreateError('GHL location ID is required.')
      return
    }

    setCreateStatus('creating')
    setCreateError('')
    apiClient.post(`/api/workspaces/${workspaceId}/source-connections/`, {
      external_account_id: form.external_account_id.trim(),
      provider: form.provider,
    }).then(() => {
      setForm(createConnectionForm())
      setCreateStatus('idle')
      void loadConnections()
    }).catch((caughtError) => {
      setCreateError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  return (
    <AdminClientWorkspaceFrame
      currentPage="clinic-data-sources"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      <div className="grid gap-card">
        <Panel>
          <PanelHeader
            divided
            subtitle="Connections are workspace-scoped and managed by the backend."
            title="Add GHL connection"
          />
          <PanelBody>
            <form className="flex flex-col gap-control sm:flex-row" onSubmit={createConnection}>
              <Input
                aria-label="GHL location ID"
                className="min-w-0 flex-1"
                onChange={(event) => setForm((current) => ({
                  ...current,
                  external_account_id: event.target.value,
                }))}
                placeholder="ghl_location_123"
                required
                value={form.external_account_id}
              />
              <Button disabled={createStatus === 'creating'} type="submit">
                {createStatus === 'creating' ? 'Adding...' : 'Add connection'}
              </Button>
            </form>
            {createError ? (
              <p className="mt-control text-label text-destructive" role="alert">
                {createError}
              </p>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader divided title="Source connections" />
          <PanelBody className="overflow-x-auto p-0">
            {status === 'loading' ? (
              <div className="min-h-[220px] animate-pulse" />
            ) : status === 'error' ? (
              <div className="p-card">
                <ResourceState
                  errorInfo={loadErrorInfo}
                  labels={{
                    failureDescription: 'We could not load connected data sources right now.',
                    failureTitle: 'Source connections are unavailable',
                    networkDescription: 'Check the backend connection and try again.',
                    networkTitle: 'Source connections are unavailable',
                    notFoundDescription: 'Connect a GHL location to start syncing workspace data.',
                    notFoundTitle: 'No source connections yet',
                    permissionDescription: 'Ask an admin to update your workspace permissions.',
                    permissionTitle: 'You do not have access to source connections',
                  }}
                  onRetry={loadConnections}
                />
              </div>
            ) : connections.length === 0 ? (
              <div className="p-card">
                <ResourceState
                  errorInfo={{ kind: 'not-found' }}
                  labels={{
                    notFoundDescription: 'Connect a GHL location to start syncing workspace data.',
                    notFoundTitle: 'No source connections yet',
                  }}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>External account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credential</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>{connection.provider}</TableCell>
                      <TableCell>{connection.external_account_id || 'Not set'}</TableCell>
                      <TableCell>{connection.status}</TableCell>
                      <TableCell>{connection.credential?.has_token ? 'Token stored' : 'No token'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </PanelBody>
        </Panel>
      </div>
    </AdminClientWorkspaceFrame>
  )
}
