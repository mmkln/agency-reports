import {
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import {
  WORKSPACE_ROLE_META,
  WORKSPACE_ROLES,
} from '../model'

export function WorkspaceMembershipRoleSelect({
  allowedRoles = Object.values(WORKSPACE_ROLES),
  className,
  disabled = false,
  onValueChange,
  value,
}) {
  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        {allowedRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {WORKSPACE_ROLE_META[role]?.label ?? role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
