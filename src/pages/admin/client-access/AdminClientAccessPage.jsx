import { useCallback, useEffect, useState } from 'react'

import { InvitationsPanel } from '@/features/admin-client-access'
import { listWorkspaceMemberships } from '@/features/workspace-access'
import {
  ErrorBlock,
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
  const apiClient = runtime.apiClient
  const workspaceId = routeParams.clientId ?? runtime.defaultClientId
  const [memberships, setMemberships] = useState([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')

  const loadMemberships = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve()
    }

    setStatus('loading')
    setError('')

    return listWorkspaceMemberships(apiClient, workspaceId)
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
      <InvitationsPanel runtime={runtime} workspaceId={workspaceId} />

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
