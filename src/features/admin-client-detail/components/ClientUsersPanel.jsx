import { CLIENT_ROLE_META } from '@/entities/client-membership'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  return (
    <Panel>
      <PanelHeader
        action={(
          <Button icon={<Icon name="mail" size={16} />} onClick={onInviteUser} size="sm" type="button" variant="outline">
            Invite user
          </Button>
        )}
        divided
        iconName="shieldCheck"
        title="Client users"
      />
      <PanelBody className="overflow-x-auto p-0">
        {revokeError ? (
          <div className="p-card">
            <ErrorBlock title="Client access could not be updated">
              {revokeError}
            </ErrorBlock>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invite status</TableHead>
              <TableHead>Accepted</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((membership) => {
              const roleMeta = CLIENT_ROLE_META[membership.role]
              const canRevoke = membership.status === 'active'

              return (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">{membership.name || 'Unnamed user'}</TableCell>
                  <TableCell>{membership.email || 'Not set'}</TableCell>
                  <TableCell>
                    <Badge tone={roleMeta?.tone ?? 'neutral'}>
                      {roleMeta?.label ?? membership.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge meta={getMembershipStatusMeta(membership)} />
                  </TableCell>
                  <TableCell>{formatDetailDate(membership.createdAt)}</TableCell>
                  <TableActionCell>
                    {canRevoke ? (
                      <Button icon={<Icon name="circleX" size={16} />} onClick={() => onRevokeAccess(membership)} size="sm" type="button" variant="outline">
                        Revoke access
                      </Button>
                    ) : (
                      <span className="text-text-muted">No actions</span>
                    )}
                  </TableActionCell>
                </TableRow>
              )
            })}
            {memberships.length === 0 ? (
              <TableRow>
                <TableCell className="text-text-muted" colSpan={6}>
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
