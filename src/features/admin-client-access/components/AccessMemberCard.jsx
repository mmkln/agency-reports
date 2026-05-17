import {
  Button,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { Icon } from '../../../shared/icons'

export function AccessMemberCard({
  member,
  onRemove,
  onRoleChange,
}) {
  return (
    <article className="rounded-control bg-block-subtle p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action-muted text-ui text-action">
          {member.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-ui text-text-primary">{member.name}</p>
          <p className="truncate text-label font-normal text-text-muted">{member.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <Select
              onValueChange={(role) => onRoleChange(member, role)}
              value={member.role}
            >
              <SelectTrigger className="h-8 w-[130px] bg-block text-label">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
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
        </div>
      </div>
    </article>
  )
}
