export function getClientAccountWorkspacesPath(clientId) {
  return `/admin/workspaces?clientAccountId=${clientId}`
}

export function getWorkspaceAdminPath(workspace, client) {
  if (workspace?.type === 'clinic') {
    return `/admin/clinic-setup?clientId=${workspace.id}`
  }

  return getClientAccountWorkspacesPath(client.id)
}

export function getAdminClientsPath(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const queryString = search.toString()
  return queryString ? `/admin/clients?${queryString}` : '/admin/clients'
}
