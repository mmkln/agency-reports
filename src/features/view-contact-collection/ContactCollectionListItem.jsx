function formatOccurredAt(value, timezone) {
  if (!value) {
    return ''
  }
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: timezone || 'UTC',
  }).format(new Date(value))
}

export function ContactCollectionListItem({ item, timezone }) {
  const contactName = item.contact.name.trim().toLocaleLowerCase()
  const contextLabel = item.context.label.trim().toLocaleLowerCase() === contactName
    ? ''
    : item.context.label
  const context = [contextLabel, item.source.label].filter(Boolean).join(' · ')

  return (
    <li className="flex items-start justify-between gap-control px-panel py-item">
      <div className="min-w-0">
        <p className="truncate text-ui font-medium text-text-primary">
          {item.contact.name || 'Unnamed contact'}
        </p>
        {context ? <p className="mt-micro truncate text-label text-text-muted">{context}</p> : null}
      </div>
      {item.occurredAt ? (
        <time className="whitespace-nowrap text-label text-text-muted" dateTime={item.occurredAt}>
          {formatOccurredAt(item.occurredAt, timezone)}
        </time>
      ) : null}
    </li>
  )
}
