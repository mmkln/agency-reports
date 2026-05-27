import {
  getWorkspaceMembershipCapabilities,
  WORKSPACE_ROLES,
} from '../../../entities/workspace-membership'
import { createAuthApiClient, AuthApiError } from './authApiClient'

const DJANGO_ROLE_TO_WORKSPACE_ROLE = Object.freeze({
  owner: WORKSPACE_ROLES.CLINIC_OWNER,
})

function mapWorkspaceMembership(workspace, userId) {
  const role = DJANGO_ROLE_TO_WORKSPACE_ROLE[workspace.role] ?? WORKSPACE_ROLES.VIEWER
  const membership = {
    capabilities: Array.isArray(workspace.capabilities) ? workspace.capabilities : [],
    id: `${workspace.id}:${userId}`,
    role,
    status: 'active',
    userId,
    workspaceId: workspace.id,
  }

  return {
    ...membership,
    capabilities: membership.capabilities.length
      ? [...new Set(membership.capabilities)]
      : getWorkspaceMembershipCapabilities(membership),
  }
}

export function mapDjangoUserToViewer(user) {
  if (!user) {
    return null
  }

  const workspaceMemberships = (user.workspaces ?? [])
    .map((workspace) => mapWorkspaceMembership(workspace, String(user.id)))
  const capabilities = [...new Set(workspaceMemberships.flatMap((membership) => membership.capabilities))]
  const activeWorkspaceId = workspaceMemberships[0]?.workspaceId ?? null
  const name = user.email || user.username || 'Signed in user'

  return {
    activeAgencyId: null,
    activeWorkspaceId,
    agencyMemberships: [],
    authSource: 'django-session',
    capabilities,
    email: user.email ?? '',
    managedWorkspaceRelationships: [],
    name,
    profileId: String(user.id),
    user: {
      email: user.email ?? '',
      id: String(user.id),
      name,
      profileId: String(user.id),
      status: 'active',
    },
    userId: String(user.id),
    workspaceMemberships,
  }
}

export function createDjangoSessionAuthClient({
  apiClient = createAuthApiClient(),
} = {}) {
  async function fetchCurrentViewer() {
    try {
      const user = await apiClient.get('/api/auth/me/')
      return mapDjangoUserToViewer(user)
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
    listLoginProfiles() {
      return Promise.resolve([])
    },
    async signInWithEmail({ email, password }) {
      await this.fetchCsrf()
      const response = await apiClient.post('/api/auth/login/', {
        password,
        username: email,
      })

      return mapDjangoUserToViewer(response.user)
    },
    async signOut() {
      await this.fetchCsrf()
      await apiClient.post('/api/auth/logout/', {})
    },
    startDemoSession() {
      return Promise.resolve()
    },
  }
}
