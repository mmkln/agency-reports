function normalizeText(value) {
  return value === undefined || value === null ? '' : String(value)
}

function normalizeCapabilities(capabilities) {
  return Array.isArray(capabilities) ? [...new Set(capabilities)] : []
}

export function normalizeBackendClientMembership(source = {}, userId = '') {
  const clientId = normalizeText(source.client_id ?? source.clientId)
  const agencyId = normalizeText(source.agency_id ?? source.agencyId)

  return {
    agencyId,
    agencyName: normalizeText(source.agency_name ?? source.agencyName),
    capabilities: normalizeCapabilities(source.capabilities),
    clientId,
    clientName: normalizeText(source.client_name ?? source.clientName),
    createdAt: normalizeText(source.created_at ?? source.createdAt),
    email: normalizeText(source.email),
    id: normalizeText(source.id) || `${clientId}:${userId}`,
    name: normalizeText(source.name),
    role: normalizeText(source.role),
    status: normalizeText(source.status) || 'active',
    userId: normalizeText(source.user_id ?? source.userId ?? userId),
  }
}
