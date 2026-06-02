import { useCallback, useEffect, useState } from 'react'

import { normalizeResourceError } from '@/shared/data/resourceError'
import {
  Button,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  ResourceState,
  UnavailableState,
} from '@/shared/ui'

function createWorkspaceForm(workspace) {
  return {
    name: workspace?.name ?? '',
    slug: workspace?.slug ?? '',
  }
}

export function ClientSettingsPage({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const workspaceId = routeParams.workspaceId ?? routeParams.clientId ?? runtime.defaultClientId
  const [workspace, setWorkspace] = useState(null)
  const [form, setForm] = useState(() => createWorkspaceForm(null))
  const [error, setError] = useState('')
  const [errorInfo, setErrorInfo] = useState(null)
  const [status, setStatus] = useState('loading')

  const loadWorkspaceSettings = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve()
    }

    setStatus('loading')
    setError('')
    setErrorInfo(null)

    return apiClient.get(`/api/workspaces/${workspaceId}/settings/`)
      .then((payload) => {
        setWorkspace(payload.workspace)
        setForm(createWorkspaceForm(payload.workspace))
        setStatus('ready')
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setErrorInfo(normalizeResourceError(caughtError))
        setStatus('error')
      })
  }, [apiClient, workspaceId])

  useEffect(() => {
    void Promise.resolve().then(loadWorkspaceSettings)
  }, [loadWorkspaceSettings])

  const hasChanges = Boolean(workspace) && (
    form.name.trim() !== String(workspace.name ?? '')
    || form.slug.trim() !== String(workspace.slug ?? '')
  )
  const canSave = status !== 'saving' && hasChanges && Boolean(form.name.trim() && form.slug.trim())

  function saveWorkspace(event) {
    event.preventDefault()

    if (!canSave) {
      return
    }

    setStatus('saving')
    setError('')
    setErrorInfo(null)
    apiClient.request(`/api/workspaces/${workspaceId}/settings/`, {
      body: {
        name: form.name.trim(),
        slug: form.slug.trim(),
      },
      method: 'PATCH',
    }).then((payload) => {
      setWorkspace(payload.workspace)
      setForm(createWorkspaceForm(payload.workspace))
      setStatus('ready')
    }).catch((caughtError) => {
      setError(caughtError.message)
      setErrorInfo(normalizeResourceError(caughtError))
      setStatus('ready')
    })
  }

  if (!workspaceId) {
    return (
      <UnavailableState
        description="Choose a workspace before opening settings."
        iconName="settings"
        title="Workspace missing"
      />
    )
  }

  if (status === 'loading') {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (status === 'error') {
    return (
      <ResourceState
        errorInfo={errorInfo}
        labels={{
          failureDescription: 'We could not load settings right now.',
          failureTitle: 'Workspace settings are unavailable',
          networkDescription: 'Check the backend connection and try again.',
          networkTitle: 'Workspace settings are unavailable',
          notFoundDescription: 'Add workspace details before this setup can be managed.',
          notFoundTitle: 'Workspace settings are not configured yet',
          permissionDescription: 'Ask an admin to update your workspace permissions.',
          permissionTitle: 'You do not have access to workspace settings',
        }}
        onRetry={loadWorkspaceSettings}
      />
    )
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Workspace settings are loaded from the backend and scoped by membership."
        title={workspace?.name ?? 'Workspace settings'}
      />
      <PanelBody>
        <form className="grid gap-component" onSubmit={saveWorkspace}>
          <div className="grid gap-control sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Workspace name</span>
              <Input
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                value={form.name}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Slug</span>
              <Input
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
                value={form.slug}
              />
            </label>
          </div>
          <div className="grid gap-tag text-body text-text-muted sm:grid-cols-2">
            <p>Type: {workspace?.type}</p>
            <p>Status: {workspace?.status}</p>
          </div>
          {error ? (
            <p className="text-label text-destructive">{error}</p>
          ) : null}
          <div className="flex justify-end gap-control">
            <Button
              disabled={!hasChanges || status === 'saving'}
              onClick={() => setForm(createWorkspaceForm(workspace))}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
            <Button disabled={!canSave} type="submit">
              {status === 'saving' ? 'Saving...' : 'Save workspace'}
            </Button>
          </div>
        </form>
      </PanelBody>
    </Panel>
  )
}
