import { useMemo } from 'react'

import { CLIENT_ROLE_META } from '@/entities/client-membership'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  DataTable,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { formatDetailDate } from '../model/clientDetailPresentation'

function getMembershipStatusMeta(membership) {
  return {
    icon: membership.status === 'active' ? 'checkCircle2' : 'circleX',
    label: membership.status || 'Unknown',
    tone: membership.status === 'active' ? 'green' : 'neutral',
  }
}

export function ClientUsersPanel({
  memberships,
  onInviteUser,
  onRevokeAccess,
  revokeError,
}) {
  const inviteVariant = memberships.length === 0 ? 'primary' : 'outline'
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium">{row.original.name || 'Unnamed user'}</span>,
      header: 'Name',
    },
    {
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || 'Missing email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      cell: ({ row }) => {
        const roleMeta = CLIENT_ROLE_META[row.original.role]

        return (
          <Badge tone={roleMeta?.tone ?? 'neutral'}>
            {roleMeta?.label ?? row.original.role}
          </Badge>
        )
      },
      header: 'Role',
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge meta={getMembershipStatusMeta(row.original)} />,
      header: 'Access status',
    },
    {
      accessorKey: 'createdAt',
      cell: ({ row }) => formatDetailDate(row.original.createdAt),
      header: 'Added',
    },
    {
      cell: ({ row }) => (
        row.original.status === 'active' ? (
          <Button icon={<Icon name="circleX" size={16} />} onClick={() => onRevokeAccess(row.original)} size="sm" type="button" variant="outline">
            Revoke access
          </Button>
        ) : (
          <span className="text-text-muted">No actions</span>
        )
      ),
      enableSorting: false,
      header: 'Actions',
      id: 'actions',
      meta: {
        isAction: true,
        label: 'Actions',
        nowrap: true,
      },
    },
  ], [onRevokeAccess])

  return (
    <Panel>
      <PanelHeader
        action={(
          <Button icon={<Icon name="mail" size={16} />} onClick={onInviteUser} size="sm" type="button" variant={inviteVariant}>
            Invite user
          </Button>
        )}
        divided
        iconName="shieldCheck"
        title="Client access"
      />
      <PanelBody className="p-0">
        {revokeError ? (
          <div className="p-card">
            <ErrorBlock title="Client access could not be updated">
              {revokeError}
            </ErrorBlock>
          </div>
        ) : null}
        <DataTable
          columns={columns}
          data={memberships}
          emptyMessage="No client users yet. Invite a user to give this client access."
          getRowId={(membership) => membership.id}
        />
      </PanelBody>
    </Panel>
  )
}
