import { useCallback, useEffect, useState } from 'react'

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
  UnavailableState,
} from '@/shared/ui'

function createConnectionForm() {
  return {
    external_account_id: '',
    provider: 'ghl',
  }
}

export function AdminClinicDataSourcesPage({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const workspaceId = routeParams.clientId ?? runtime.defaultClientId
  const [connections, setConnections] = useState([])
  const [form, setForm] = useState(() => createConnectionForm())
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  const loadConnections = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve()
    }

    setStatus('loading')
    setError('')

    return apiClient.get(`/api/workspaces/${workspaceId}/source-connections/`)
      .then((payload) => {
        setConnections(payload.source_connections ?? [])
        setStatus('ready')
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }, [apiClient, workspaceId])

  useEffect(() => {
    void Promise.resolve().then(loadConnections)
  }, [loadConnections])

  function createConnection(event) {
    event.preventDefault()

    if (!form.external_account_id.trim()) {
      setError('GHL location ID is required.')
      return
    }

    setCreateStatus('creating')
    setError('')
    apiClient.post(`/api/workspaces/${workspaceId}/source-connections/`, {
      external_account_id: form.external_account_id.trim(),
      provider: form.provider,
    }).then(() => {
      setForm(createConnectionForm())
      setCreateStatus('idle')
      void loadConnections()
    }).catch((caughtError) => {
      setError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  if (!workspaceId) {
    return (
      <UnavailableState
        description="Choose a workspace before managing data sources."
        iconName="database"
        title="Workspace missing"
      />
    )
  }

  return (
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
        </PanelBody>
      </Panel>

      {error ? (
        <ErrorBlock title="Data source request failed">
          {error}
        </ErrorBlock>
      ) : null}

      <Panel>
        <PanelHeader divided title="Source connections" />
        <PanelBody className="overflow-x-auto p-0">
          {status === 'loading' ? (
            <div className="min-h-[220px] animate-pulse" />
          ) : status === 'error' ? (
            <div className="p-card">
              <ErrorBlock title="Connections could not be loaded">
                {error}
              </ErrorBlock>
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
                {connections.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-muted" colSpan={4}>
                      No source connections yet.
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
