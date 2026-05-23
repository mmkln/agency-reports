import {
  CLIENT_MEMBERSHIP_ROLE_META,
  CLIENT_MEMBERSHIP_ROLES,
} from '../model'
import {
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

export function ClientMembershipRoleSelect({
  allowedRoles = Object.values(CLIENT_MEMBERSHIP_ROLES),
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
            {CLIENT_MEMBERSHIP_ROLE_META[role]?.label ?? role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
