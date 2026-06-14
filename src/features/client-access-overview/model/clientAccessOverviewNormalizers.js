function normalizeText(value) {
  return value === undefined || value === null ? '' : String(value)
}

function normalizeAccessGrant(source = {}) {
  return {
    capabilities: Array.isArray(source.capabilities) ? source.capabilities : [],
    createdAt: normalizeText(source.created_at ?? source.createdAt),
    expiresAt: normalizeText(source.expires_at ?? source.expiresAt),
    id: normalizeText(source.id),
    kind: normalizeText(source.kind),
    role: normalizeText(source.role),
    status: normalizeText(source.status) || 'active',
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
    workspaceName: normalizeText(source.workspace_name ?? source.workspaceName),
  }
}

function normalizePrincipal(source = {}) {
  const kind = normalizeText(source.kind) || 'user'
  const email = normalizeText(source.email)
  const userId = normalizeText(source.user_id ?? source.userId)

  return {
    access: (source.access ?? []).map(normalizeAccessGrant),
    email,
    id: kind === 'user' ? userId : `${kind}:${email.toLowerCase()}`,
    kind,
    name: normalizeText(source.name),
    userId,
  }
}

export function normalizeClientAccessOverviewPayload(payload = {}) {
  return {
    client: {
      id: normalizeText(payload.client?.id),
      name: normalizeText(payload.client?.name),
    },
    principals: (payload.principals ?? []).map(normalizePrincipal),
    workspaces: (payload.workspaces ?? []).map((workspace) => ({
      id: normalizeText(workspace.id),
      name: normalizeText(workspace.name),
      status: normalizeText(workspace.status) || 'active',
    })),
  }
}
