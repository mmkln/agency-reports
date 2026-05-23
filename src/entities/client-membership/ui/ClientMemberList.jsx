import {
  AvatarFallback,
  Badge,
  Button,
  EmptyState,
  ListPanel,
  ListRow,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'
import { CLIENT_MEMBERSHIP_ROLE_META } from '../model'

function ClientMemberRoleBadge({ role, roleLabel }) {
  const meta = CLIENT_MEMBERSHIP_ROLE_META[role]

  return (
    <Badge tone={meta?.tone ?? 'neutral'}>
      {roleLabel ?? meta?.label ?? role}
    </Badge>
  )
}

export function ClientMemberList({
  canEdit = false,
  canRemove = false,
  emptyDescription = 'No members are currently attached to this workspace.',
  emptyTitle = 'No members',
  members = [],
  onEditMember,
  onRemoveMember,
}) {
  if (!members.length) {
    return (
      <EmptyState
        className="m-card"
        description={emptyDescription}
        iconName="users"
        title={emptyTitle}
      />
    )
  }

  return (
    <ListPanel>
      {members.map((member) => (
        <ListRow
          className="group/member-row"
          description={member.email}
          key={member.id}
          leading={<AvatarFallback name={member.name} />}
          title={member.name}
          trailing={(
            <div className="flex items-center gap-control">
              <ClientMemberRoleBadge role={member.role} roleLabel={member.roleLabel} />
              {canEdit ? (
                <Button
                  aria-label={`Edit ${member.name}`}
                  className="opacity-100 transition-opacity duration-motion-fast ease-motion-standard md:opacity-0 md:group-hover/member-row:opacity-100 md:group-focus-within/member-row:opacity-100"
                  onClick={() => onEditMember?.(member)}
                  size="icon-sm"
                  title="Edit member"
                  type="button"
                  variant="ghost"
                >
                  <Icon name="pencil" size={14} />
                </Button>
              ) : null}
              {canRemove ? (
                <Button
                  aria-label={`Remove ${member.name}`}
                  className="text-text-quaternary opacity-100 transition-opacity duration-motion-fast ease-motion-standard hover:text-destructive md:opacity-0 md:group-hover/member-row:opacity-100 md:group-focus-within/member-row:opacity-100"
                  onClick={() => onRemoveMember?.(member)}
                  size="icon-sm"
                  title="Remove member"
                  type="button"
                  variant="ghost"
                >
                  <Icon name="close" size={14} />
                </Button>
              ) : null}
            </div>
          )}
        />
      ))}
    </ListPanel>
  )
}
