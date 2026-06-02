function normalizeText(value) {
  return value === undefined || value === null ? '' : String(value)
}

export const WORKSPACE_CLIENT_ACCESS_POLICIES = Object.freeze({
  NONE: 'none',
  OWNERS_ADMINS: 'owners_admins',
})

function normalizeNullableText(value) {
  return value === undefined || value === null || value === '' ? null : String(value)
}

export function normalizeBackendWorkspace(source = {}) {
  const agencyId = normalizeNullableText(source.agency_id ?? source.agencyId)
  const clientId = normalizeNullableText(source.client_id ?? source.clientId)

  return {
    ...source,
    agencyId,
    agencyName: normalizeText(source.agency_name ?? source.agencyName),
    agency_id: agencyId,
    agency_name: normalizeText(source.agency_name ?? source.agencyName),
    clientId,
    clientName: normalizeText(source.client_name ?? source.clientName),
    client_id: clientId,
    client_name: normalizeText(source.client_name ?? source.clientName),
    createdAt: normalizeNullableText(source.created_at ?? source.createdAt),
    createdBy: normalizeNullableText(source.created_by ?? source.createdBy),
    created_at: normalizeNullableText(source.created_at ?? source.createdAt),
    created_by: normalizeNullableText(source.created_by ?? source.createdBy),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    slug: normalizeText(source.slug),
    status: normalizeText(source.status) || 'active',
    type: normalizeText(source.type) || 'generic',
    updatedAt: normalizeNullableText(source.updated_at ?? source.updatedAt),
    updated_at: normalizeNullableText(source.updated_at ?? source.updatedAt),
  }
}

export function normalizeBackendWorkspacesPayload(payload = {}) {
  return {
    ...payload,
    workspaces: (payload.workspaces ?? []).map(normalizeBackendWorkspace),
  }
}
