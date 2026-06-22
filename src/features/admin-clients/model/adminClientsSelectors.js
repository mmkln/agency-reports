export function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

export function getPrimaryClientWorkspace(client) {
  return (client?.workspaces ?? []).find((workspace) => workspace.status === 'active')
    ?? client?.workspaces?.[0]
    ?? null
}

export function findClientById(clients = [], clientId = '') {
  return clients.find((client) => client.id === clientId) ?? null
}
