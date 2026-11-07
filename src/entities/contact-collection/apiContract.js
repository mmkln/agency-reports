function normalizeText(value) {
  return typeof value === 'string' ? value : ''
}

function normalizeItem(item) {
  return {
    contact: {
      externalId: normalizeText(item?.contact?.external_id),
      externalUrl: normalizeText(item?.contact?.external_url),
      name: normalizeText(item?.contact?.name),
    },
    context: {
      externalId: normalizeText(item?.context?.external_id),
      label: normalizeText(item?.context?.label),
      type: normalizeText(item?.context?.type),
    },
    destination: {
      label: normalizeText(item?.destination?.label),
      type: normalizeText(item?.destination?.type),
      url: normalizeText(item?.destination?.url),
    },
    details: Array.isArray(item?.details)
      ? item.details.map((detail) => ({
          key: normalizeText(detail?.key),
          label: normalizeText(detail?.label),
          value: normalizeText(detail?.value),
        }))
      : [],
    id: normalizeText(item?.id),
    occurredAt: item?.occurred_at ?? null,
    source: {
      detail: normalizeText(item?.source?.detail),
      key: normalizeText(item?.source?.key),
      label: normalizeText(item?.source?.label),
    },
    status: {
      key: normalizeText(item?.status?.key),
      label: normalizeText(item?.status?.label),
    },
  }
}

export function normalizeContactCollection(payload) {
  if (!payload?.collection?.key || !payload?.collection?.title) {
    throw new Error('Contact Collection API returned an invalid payload.')
  }

  return {
    grain: normalizeText(payload.collection.grain),
    itemLabel: normalizeText(payload.collection.item_label) || 'record',
    itemLabelPlural: normalizeText(payload.collection.item_label_plural) || 'records',
    items: Array.isArray(payload.items) ? payload.items.map(normalizeItem) : [],
    key: payload.collection.key,
    pagination: {
      page: Number(payload.pagination?.page ?? 1),
      pageSize: Number(payload.pagination?.page_size ?? 25),
      totalItems: Number(payload.pagination?.total_items ?? 0),
      totalPages: Number(payload.pagination?.total_pages ?? 1),
    },
    title: payload.collection.title,
    totalRecords: Number(payload.collection.total_records ?? 0),
    uniqueContacts: Number(payload.collection.unique_contacts ?? 0),
  }
}
