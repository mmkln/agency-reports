function normalizeText(value) {
  return value === undefined || value === null ? '' : String(value)
}

export function normalizeBackendClientMembership(source = {}, userId = '') {
  const clientId = normalizeText(source.client_id ?? source.clientId)
  const agencyId = normalizeText(source.agency_id ?? source.agencyId)

  return {
    agencyId,
    agencyName: normalizeText(source.agency_name ?? source.agencyName),
    clientId,
    clientName: normalizeText(source.client_name ?? source.clientName),
    id: normalizeText(source.id) || `${clientId}:${userId}`,
    role: normalizeText(source.role),
    status: normalizeText(source.status) || 'active',
    userId: normalizeText(source.user_id ?? source.userId ?? userId),
  }
}
