import { createAuthApiClient, AuthApiError } from './authApiClient'

function normalizeCapabilities(capabilities) {
  return Array.isArray(capabilities) ? [...new Set(capabilities)] : []
}

function mapAgencyMembership(membership, userId) {
  const agencyId = String(membership.agency_id ?? '')

  return {
    agencyId,
    agencyName: membership.agency_name ?? '',
    capabilities: normalizeCapabilities(membership.capabilities),
    id: String(membership.id ?? `${agencyId}:${userId}`),
    role: membership.role ?? '',
    status: membership.status ?? 'active',
    userId,
  }
}

function mapWorkspaceMembership(workspace, userId) {
  const workspaceId = String(workspace.workspace_id ?? '')

  return {
    capabilities: normalizeCapabilities(workspace.capabilities),
    id: String(workspace.id ?? `${workspaceId}:${userId}`),
    role: workspace.role ?? '',
    status: workspace.status ?? 'active',
    userId,
    workspaceId,
    workspaceName: workspace.workspace_name ?? '',
    workspaceSlug: workspace.workspace_slug ?? '',
    workspaceType: workspace.workspace_type ?? 'generic',
  }
}

function mapManagedWorkspaceRelationship(relationship) {
  const agencyId = String(relationship.agency_id ?? '')
  const workspaceId = String(relationship.workspace_id ?? '')

  return {
    agencyId,
    id: String(relationship.id ?? `${agencyId}:${workspaceId}`),
    status: relationship.status ?? 'active',
    workspaceId,
    workspaceName: relationship.workspace_name ?? '',
    workspaceSlug: relationship.workspace_slug ?? '',
    workspaceType: relationship.workspace_type ?? 'generic',
  }
}

export function mapDjangoViewerContextToViewer(viewerContext) {
  if (!viewerContext?.user?.id) {
    return null
  }

  const { user } = viewerContext
  const userId = String(user.id)
  const agencyMemberships = (viewerContext.agency_memberships ?? [])
    .map((membership) => mapAgencyMembership(membership, userId))
    .filter((membership) => membership.agencyId)
  const workspaceMemberships = (viewerContext.workspace_memberships ?? [])
    .map((workspace) => mapWorkspaceMembership(workspace, userId))
    .filter((membership) => membership.workspaceId)
  const managedWorkspaceRelationships = (viewerContext.managed_workspace_relationships ?? [])
    .map(mapManagedWorkspaceRelationship)
    .filter((relationship) => relationship.agencyId && relationship.workspaceId)
  const capabilities = [...new Set([
    ...agencyMemberships.flatMap((membership) => membership.capabilities),
    ...workspaceMemberships.flatMap((membership) => membership.capabilities),
  ])]
  const activeAgencyId = agencyMemberships[0]?.agencyId ?? null
  const activeWorkspaceId = workspaceMemberships[0]?.workspaceId
    ?? managedWorkspaceRelationships[0]?.workspaceId
    ?? null
  const name = user.name || user.email || 'Signed in user'

  return {
    activeAgencyId,
    activeWorkspaceId,
    agencyMemberships,
    authSource: 'django-session',
    capabilities,
    email: user.email ?? '',
    managedWorkspaceRelationships,
    name,
    profileId: userId,
    user: {
      email: user.email ?? '',
      id: userId,
      name,
      profileId: userId,
      status: 'active',
    },
    userId,
    workspaceMemberships,
  }
}

export function createDjangoSessionAuthClient({
  apiClient = createAuthApiClient(),
} = {}) {
  async function fetchCurrentViewer() {
    try {
      const viewerContext = await apiClient.get('/api/auth/me/')
      return mapDjangoViewerContextToViewer(viewerContext)
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        return null
      }

      throw error
    }
  }

  return {
    async fetchCsrf() {
      return apiClient.get('/api/auth/csrf/')
    },
    getCurrentViewer() {
      return fetchCurrentViewer()
    },
    async signInWithUsername({ username, password }) {
      await this.fetchCsrf()
      const response = await apiClient.post('/api/auth/login/', {
        password,
        username,
      })

      return mapDjangoViewerContextToViewer(response.viewer)
    },
    async signOut() {
      await this.fetchCsrf()
      await apiClient.post('/api/auth/logout/', {})
    },
  }
}
