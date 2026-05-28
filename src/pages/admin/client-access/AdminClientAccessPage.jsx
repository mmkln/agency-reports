import { useCallback, useEffect, useMemo, useState } from 'react'

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
  UnavailableState,
} from '@/shared/ui'

export function AdminClientAccessPage({ routeParams = {}, runtime }) {
  const apiClient = useMemo(() => createBackendApiClient(), [])
  const workspaceId = routeParams.clientId ?? runtime.defaultClientId
  const [memberships, setMemberships] = useState([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  const loadMemberships = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve()
    }

    setStatus('loading')
    setError('')

    return apiClient.get(`/api/workspaces/${workspaceId}/memberships/`)
      .then((payload) => {
        setMemberships(payload.memberships ?? [])
        setStatus('ready')
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }, [apiClient, workspaceId])

  useEffect(() => {
    void Promise.resolve().then(loadMemberships)
  }, [loadMemberships])

  function addMember(event) {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    setCreateStatus('creating')
    setError('')
    apiClient.post(`/api/workspaces/${workspaceId}/memberships/`, {
      email: email.trim(),
    }).then(() => {
      setEmail('')
      setCreateStatus('idle')
      void loadMemberships()
    }).catch((caughtError) => {
      setError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  if (!workspaceId) {
    return (
      <UnavailableState
        description="Choose a workspace before managing access."
        iconName="users"
        title="Workspace missing"
      />
    )
  }

  return (
    <div className="grid gap-card">
      <Panel>
        <PanelHeader divided title="Add workspace member" />
        <PanelBody>
          <form className="flex flex-col gap-control sm:flex-row" onSubmit={addMember}>
            <Input
              aria-label="Member email"
              className="min-w-0 flex-1"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@clinic.com"
              required
              type="email"
              value={email}
            />
            <Button disabled={createStatus === 'creating'} type="submit">
              {createStatus === 'creating' ? 'Adding...' : 'Add member'}
            </Button>
          </form>
        </PanelBody>
      </Panel>

      {error ? (
        <ErrorBlock title="Workspace access request failed">
          {error}
        </ErrorBlock>
      ) : null}

      <Panel>
        <PanelHeader divided title="Workspace members" />
        <PanelBody className="overflow-x-auto p-0">
          {status === 'loading' ? (
            <div className="min-h-[220px] animate-pulse" />
          ) : status === 'error' ? (
            <div className="p-card">
              <ErrorBlock title="Members could not be loaded">
                {error}
              </ErrorBlock>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>{membership.name}</TableCell>
                    <TableCell>{membership.email}</TableCell>
                    <TableCell>{membership.role}</TableCell>
                    <TableCell>{membership.status}</TableCell>
                  </TableRow>
                ))}
                {memberships.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-muted" colSpan={4}>
                      No workspace members yet.
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
