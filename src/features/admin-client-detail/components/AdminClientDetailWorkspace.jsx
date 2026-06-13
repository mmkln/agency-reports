import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { CLIENT_STATUS_META } from '@/entities/client'
import { CLIENT_ROLE_META } from '@/entities/client-membership'
import { WORKSPACE_STATUS_META, WORKSPACE_TYPE_META } from '@/entities/workspace'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import {
  Badge,
  Button,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  StatusBadge,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  UnavailableState,
} from '@/shared/ui'

import { useAdminClientDetailWorkflow } from '../model/useAdminClientDetailWorkflow'

const UNKNOWN_STATUS_META = Object.freeze({
  label: 'Unknown',
  tone: 'neutral',
})

function formatDate(value) {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getStatusMeta(metaMap, status) {
  return metaMap[status] ?? {
    ...UNKNOWN_STATUS_META,
    label: status || UNKNOWN_STATUS_META.label,
  }
}

function ClientSummaryPanel({ client }) {
  const statusMeta = getStatusMeta(CLIENT_STATUS_META, client.status)

  return (
    <Panel>
      <PanelHeader
        action={(
          <div className="flex flex-wrap items-center justify-end gap-item">
            <StatusBadge meta={statusMeta} />
            <Button asChild size="sm" variant="outline">
              <Link to={ROUTE_PATHS.agencyClients}>Back to clients</Link>
            </Button>
          </div>
        )}
        divided
        iconName="users"
        title={client.name}
      />
      <PanelBody>
        <PropertyGrid
          items={[
            { label: 'Status', value: statusMeta.label },
            { label: 'Created', value: formatDate(client.createdAt) },
            { label: 'Updated', value: formatDate(client.updatedAt) },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

function ClientWorkspacesPanel({ workspaces }) {
  return (
    <Panel>
      <PanelHeader divided iconName="grid" title="Workspaces" />
      <PanelBody className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.map((workspace) => {
              const typeMeta = WORKSPACE_TYPE_META[workspace.type]

              return (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>
                    <Badge tone={typeMeta?.tone ?? 'neutral'}>
                      {typeMeta?.label ?? workspace.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge meta={getStatusMeta(WORKSPACE_STATUS_META, workspace.status)} />
                  </TableCell>
                  <TableActionCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to={getDefaultWorkspaceAdminPath(workspace)}>Open workspace</Link>
                    </Button>
                  </TableActionCell>
                </TableRow>
              )
            })}
            {workspaces.length === 0 ? (
              <TableRow>
                <TableCell className="text-text-muted" colSpan={4}>
                  No workspaces yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  )
}

function ClientUsersPanel({ memberships }) {
  return (
    <Panel>
      <PanelHeader divided iconName="shieldCheck" title="Client users" />
      <PanelBody className="overflow-x-auto p-0">
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
            {memberships.map((membership) => {
              const roleMeta = CLIENT_ROLE_META[membership.role]

              return (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">{membership.name || 'Unnamed user'}</TableCell>
                  <TableCell>{membership.email}</TableCell>
                  <TableCell>
                    <Badge tone={roleMeta?.tone ?? 'neutral'}>
                      {roleMeta?.label ?? membership.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      meta={{
                        icon: membership.status === 'active' ? 'checkCircle2' : 'circleX',
                        label: membership.status || 'Unknown',
                        tone: membership.status === 'active' ? 'green' : 'neutral',
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {memberships.length === 0 ? (
              <TableRow>
                <TableCell className="text-text-muted" colSpan={4}>
                  No client users yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  )
}

export function AdminClientDetailWorkspace({ routeParams = {}, runtime }) {
  const {
    client,
    clientId,
    error,
    memberships,
    status,
  } = useAdminClientDetailWorkflow({ routeParams, runtime })

  if (!clientId) {
    return (
      <UnavailableState
        iconName="users"
        title="Client was not selected"
      />
    )
  }

  if (status === 'loading') {
    return (
      <Panel>
        <PanelHeader divided title="Client" />
        <PanelBody>
          <div className="min-h-[220px] animate-pulse rounded-block bg-fill" />
        </PanelBody>
      </Panel>
    )
  }

  if (status === 'error') {
    return (
      <ErrorBlock title="Client could not be loaded">
        {error}
      </ErrorBlock>
    )
  }

  if (!client) {
    return (
      <UnavailableState
        iconName="users"
        title="Client was not found"
      />
    )
  }

  return (
    <div className="flex flex-col gap-component">
      <ClientSummaryPanel client={client} />
      <ClientWorkspacesPanel workspaces={client.workspaces} />
      <ClientUsersPanel memberships={memberships} />
    </div>
  )
}
