import { StatusBadge } from '@/shared/ui'

export function AccessHistoryRow({
  dateLabel = '',
  email,
  name,
  role,
  statusMeta,
  typeLabel,
}) {
  return (
    <div className="grid gap-control px-component py-control sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-item">
          <span className="truncate text-ui font-medium text-text-primary">
            {name || 'Unnamed user'}
          </span>
          {role ? (
            <span className="text-ui text-text-muted">{role}</span>
          ) : null}
        </div>
        <div className="truncate text-ui text-text-muted">{email || 'Missing email'}</div>
      </div>

      <span className="text-ui text-text-muted">{typeLabel}</span>

      <div className="flex items-center gap-item sm:justify-end">
        <StatusBadge meta={statusMeta} />
        {dateLabel ? (
          <span className="text-ui text-text-muted">{dateLabel}</span>
        ) : null}
      </div>
    </div>
  )
}
