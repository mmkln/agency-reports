import {
  Button,
} from '@/shared/ui'

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

function getMemberInitial(member) {
  return (member.name || member.email || 'U').trim().charAt(0).toUpperCase()
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
    <article className="flex flex-col gap-control rounded-control border border-control-border px-component py-control lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-control">
        <span className="flex size-control-large shrink-0 items-center justify-center rounded-full bg-block-subtle text-ui font-medium text-text-primary">
          {getMemberInitial(member)}
        </span>
        <div className="min-w-0 space-y-tag">
          <div className="flex flex-wrap items-center gap-item">
            <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{member.name || 'Unnamed user'}</h3>
            <span className="text-ui text-text-muted">{member.roleLabel ?? roleMeta?.label ?? member.role}</span>
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <span className="inline-flex items-center gap-tag text-ui text-text-secondary">
              <span className={`size-1.5 rounded-full ${statusDotClassName}`} aria-hidden="true" />
              {formatStatusLabel(status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
            {member.email ? (
              <span>{member.email}</span>
            ) : (
              <span className="text-text-quaternary">Missing email</span>
            )}
          </div>
        </div>
      </div>

      {!readOnly && isActive ? (
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(member)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Revoke access
          </Button>
        </div>
      ) : null}
    </article>
  )
}
