import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { WORKSPACE_ROLE_META } from '../../../entities/workspace-membership'

function formatStatusLabel(value) {
  if (!value) {
    return 'Unknown'
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function AccessMemberCard({
  member,
  onRemove,
  readOnly = false,
}) {
  const roleMeta = WORKSPACE_ROLE_META[member.role]
  const status = member.status ?? 'active'
  const isActive = status === 'active'
  const statusDotClassName = isActive ? 'bg-success' : 'bg-fill-secondary'

  return (
    <article className="grid gap-control px-component py-control md:grid-cols-[minmax(240px,1.4fr)_160px_120px_44px] md:items-center">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{member.name || 'Unnamed user'}</h3>
        <p className="m-0 truncate text-ui text-text-muted">
          {member.email || 'Missing email'}
        </p>
      </div>

      <span className="truncate text-ui text-text-muted">{member.roleLabel ?? roleMeta?.label ?? member.role}</span>
      <span className="inline-flex items-center gap-tag text-ui text-text-secondary">
        <span className={`size-1.5 rounded-full ${statusDotClassName}`} aria-hidden="true" />
        {formatStatusLabel(status)}
      </span>
      {!readOnly && isActive ? (
        <div className="flex justify-start md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Member actions"
                icon={<Icon name="ellipsis" size={16} />}
                size="icon-sm"
                type="button"
                variant="ghost"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRemove(member)}
              >
                Revoke access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
    </article>
  )
}
