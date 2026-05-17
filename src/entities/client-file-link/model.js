export const CLIENT_FILE_LINK_TYPES = Object.freeze({
  BRAND_ASSET: 'brand_asset',
  CLIENT_UPLOAD: 'client_upload',
  CONTRACT_ADMIN: 'contract_admin',
  DELIVERABLE: 'deliverable',
  REPORT: 'report',
  SHARED_LINK: 'shared_link',
})

export const CLIENT_FILE_LINK_STATUSES = Object.freeze({
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  UNAVAILABLE: 'unavailable',
})

export const CLIENT_FILE_LINK_TYPE_META = Object.freeze({
  [CLIENT_FILE_LINK_TYPES.DELIVERABLE]: {
    icon: 'checkCircle2',
    label: 'Deliverable',
    tone: 'green',
  },
  [CLIENT_FILE_LINK_TYPES.CLIENT_UPLOAD]: {
    icon: 'fileText',
    label: 'Client upload',
    tone: 'blue',
  },
  [CLIENT_FILE_LINK_TYPES.REPORT]: {
    icon: 'fileText',
    label: 'Report',
    tone: 'neutral',
  },
  [CLIENT_FILE_LINK_TYPES.BRAND_ASSET]: {
    icon: 'sparkles',
    label: 'Brand asset',
    tone: 'purple',
  },
  [CLIENT_FILE_LINK_TYPES.SHARED_LINK]: {
    icon: 'arrowUpRight',
    label: 'Shared link',
    tone: 'blue',
  },
  [CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN]: {
    icon: 'shieldCheck',
    label: 'Contract/admin',
    tone: 'amber',
  },
})

export const CLIENT_FILE_LINK_STATUS_META = Object.freeze({
  [CLIENT_FILE_LINK_STATUSES.ACTIVE]: {
    icon: 'checkCircle2',
    label: 'Active',
    tone: 'green',
  },
  [CLIENT_FILE_LINK_STATUSES.UNAVAILABLE]: {
    icon: 'triangleAlert',
    label: 'Unavailable',
    tone: 'amber',
  },
  [CLIENT_FILE_LINK_STATUSES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})

const validTypes = new Set(Object.values(CLIENT_FILE_LINK_TYPES))
const validStatuses = new Set(Object.values(CLIENT_FILE_LINK_STATUSES))

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value)

  return normalizedValue || null
}

function normalizeType(type) {
  return validTypes.has(type) ? type : CLIENT_FILE_LINK_TYPES.SHARED_LINK
}

function normalizeStatus(status) {
  return validStatuses.has(status) ? status : CLIENT_FILE_LINK_STATUSES.ACTIVE
}

export function normalizeClientFileLink(record = {}) {
  return {
    client_id: normalizeText(record.client_id),
    created_at: record.created_at ?? null,
    description: normalizeText(record.description),
    display_order: Number.isFinite(Number(record.display_order)) ? Number(record.display_order) : 0,
    file_name: normalizeText(record.file_name),
    id: normalizeText(record.id),
    mime_type: normalizeText(record.mime_type),
    project_id: normalizeNullableText(record.project_id),
    related_report_id: normalizeNullableText(record.related_report_id),
    related_work_item_id: normalizeNullableText(record.related_work_item_id),
    status: normalizeStatus(record.status),
    title: normalizeText(record.title),
    type: normalizeType(record.type),
    updated_at: record.updated_at ?? record.created_at ?? null,
    uploaded_by_name: normalizeText(record.uploaded_by_name),
    url: normalizeText(record.url),
    visibility: normalizeText(record.visibility),
  }
}
