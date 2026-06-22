function normalizeText(value) {
  return value === undefined || value === null ? '' : String(value)
}

function normalizeNullableText(value) {
  return value === undefined || value === null || value === '' ? null : String(value)
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeWorkspaceSummary(source = {}) {
  return {
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    slug: normalizeText(source.slug),
    status: normalizeText(source.status) || 'active',
  }
}

export function normalizeBackendClient(source = {}) {
  const agencyId = normalizeNullableText(source.agency_id ?? source.agencyId)
  const membershipCount = normalizeNumber(source.membership_count ?? source.membershipCount)
  const workspaceCount = normalizeNumber(source.workspace_count ?? source.workspaceCount)
  const workspaces = (source.workspaces ?? []).map(normalizeWorkspaceSummary)

  return {
    ...source,
    agencyId,
    agency_id: agencyId,
    createdAt: normalizeNullableText(source.created_at ?? source.createdAt),
    createdBy: normalizeNullableText(source.created_by ?? source.createdBy),
    created_at: normalizeNullableText(source.created_at ?? source.createdAt),
    created_by: normalizeNullableText(source.created_by ?? source.createdBy),
    id: normalizeText(source.id),
    membershipCount,
    membership_count: membershipCount,
    name: normalizeText(source.name),
    status: normalizeText(source.status) || 'active',
    updatedAt: normalizeNullableText(source.updated_at ?? source.updatedAt),
    updated_at: normalizeNullableText(source.updated_at ?? source.updatedAt),
    workspaceCount,
    workspace_count: workspaceCount,
    workspaces,
  }
}

export function normalizeBackendClientsPayload(payload = {}) {
  return {
    ...payload,
    clients: (payload.clients ?? []).map(normalizeBackendClient),
  }
}
