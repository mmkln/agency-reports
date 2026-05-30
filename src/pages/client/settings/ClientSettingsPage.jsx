import { useEffect, useState } from 'react'

import {
  Button,
  ErrorBlock,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
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
  const workspaceId = routeParams.clientId ?? runtime.defaultClientId
  const [workspace, setWorkspace] = useState(null)
  const [form, setForm] = useState(() => createWorkspaceForm(null))
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!workspaceId) {
      return undefined
    }

    let isActive = true

    void Promise.resolve()
      .then(() => {
        setStatus('loading')
        setError('')
        return apiClient.get(`/api/workspaces/${workspaceId}/settings/`)
      })
      .then((payload) => {
        if (!isActive) {
          return
        }

        setWorkspace(payload.workspace)
        setForm(createWorkspaceForm(payload.workspace))
        setStatus('ready')
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
  }, [apiClient, workspaceId])

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
      <ErrorBlock title="Workspace settings could not be loaded">
        {error}
      </ErrorBlock>
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
