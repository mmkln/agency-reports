const syncedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatSourceTagSyncDate(value) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Unknown' : syncedAtFormatter.format(date)
}

export function formatSourceTagConnection(sourceConnection = {}) {
  const provider = sourceConnection.provider
    ? sourceConnection.provider.toUpperCase()
    : 'Source'

  return sourceConnection.externalAccountId
    ? `${provider} · ${sourceConnection.externalAccountId}`
    : provider
}

export function filterSourceTags(tags, query) {
  const normalizedQuery = String(query ?? '').trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return tags
  }

  return tags.filter((tag) => [
    tag.name,
    tag.description,
    tag.externalId,
    tag.sourceConnection?.externalAccountId,
    ...tag.usages.flatMap((usage) => [usage.campaignName, usage.signalLabel]),
  ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedQuery)))
}
