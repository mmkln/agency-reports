import {
  Button,
  ListRow,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { WORKSPACE_ROLE_META, WORKSPACE_ROLES } from '../../../entities/workspace-membership'
import { Icon } from '../../../shared/icons'

export function AccessMemberCard({
  member,
  onRemove,
  onRoleChange,
}) {
  return (
    <ListRow
      className="min-h-[72px] max-[520px]:flex-col max-[520px]:items-start max-[520px]:gap-3"
      description={member.email}
      leading={(
        <span className="flex size-9 items-center justify-center rounded-full bg-action-muted text-ui text-action">
          {member.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      title={member.name}
      trailing={(
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(role) => onRoleChange(member, role)}
            value={member.role}
          >
            <SelectTrigger className="h-control-small w-[124px] bg-block text-label">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WORKSPACE_ROLES).map((role) => (
                <SelectItem key={role} value={role}>{WORKSPACE_ROLE_META[role]?.label ?? role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="text-text-quaternary hover:text-destructive"
            onClick={() => onRemove(member)}
            size="icon-sm"
            title="Remove member"
            type="button"
            variant="ghost"
          >
            <Icon name="close" size={14} />
          </Button>
        </div>
      )}
    />
  )
}
