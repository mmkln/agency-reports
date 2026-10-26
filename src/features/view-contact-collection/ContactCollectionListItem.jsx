import { Icon } from '@/shared/icons'

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

function normalizeComparableText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase()
}

export function ContactCollectionListItem({ item, timezone }) {
  const contactLabel = item.contact.name || 'Unnamed contact'
  const contactName = normalizeComparableText(contactLabel)
  const contextLabel = normalizeComparableText(item.context.label) === contactName
    ? ''
    : item.context.label
  const context = [contextLabel, item.source.label].filter(Boolean).join(' · ')
  const externalUrl = item.contact.externalUrl

  const rowContent = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ui font-medium text-text-primary transition-colors duration-motion-fast group-hover:text-link group-focus-visible:text-link">
          {contactLabel}
        </p>
        {context ? <p className="mt-micro truncate text-label text-text-muted">{context}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-item">
        {item.occurredAt ? (
          <time className="whitespace-nowrap text-label text-text-muted" dateTime={item.occurredAt}>
            {formatOccurredAt(item.occurredAt, timezone)}
          </time>
        ) : null}
        {externalUrl ? (
          <Icon
            className="text-text-quaternary opacity-0 transition-opacity duration-motion-fast group-hover:opacity-100 group-focus-visible:opacity-100"
            name="arrowUpRight"
            size={14}
          />
        ) : null}
      </div>
    </>
  )

  return (
    <li>
      {externalUrl ? (
        <a
          aria-label={`Open ${contactLabel} in GoHighLevel`}
          className="group flex min-h-target items-start justify-between gap-control px-panel py-item no-underline transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/35"
          href={externalUrl}
          rel="noreferrer"
          target="_blank"
        >
          {rowContent}
        </a>
      ) : (
        <div className="flex min-h-target items-start justify-between gap-control px-panel py-item">
          {rowContent}
        </div>
      )}
    </li>
  )
}
