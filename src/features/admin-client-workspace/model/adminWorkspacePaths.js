import { ROUTE_PATHS } from '../../../domain/navigation/routePaths'

function getWorkspaceId(workspaceOrId) {
  return typeof workspaceOrId === 'object' ? workspaceOrId?.id : workspaceOrId
}

function getWorkspaceSearch(workspaceOrId) {
  const workspaceId = getWorkspaceId(workspaceOrId)
  const search = new URLSearchParams()

  if (workspaceId) {
    search.set('workspaceId', workspaceId)
  }

  const queryString = search.toString()

  return queryString ? `?${queryString}` : ''
}

export function getWorkspaceSetupPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClientAccess}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceDataSourcesPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClientAccess}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceReviewPath(workspaceOrId) {
  return `${ROUTE_PATHS.portalGrowthReview}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceReviewSetupPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClientAccess}${getWorkspaceSearch(workspaceOrId)}`
}

export function getDefaultWorkspaceAdminPath(workspace) {
  return getWorkspaceSetupPath(workspace)
}

export function resolveRouteWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.workspaceId
    ?? routeParams.clientId
    ?? runtime?.defaultClientId
    ?? runtime?.viewer?.activeWorkspaceId
    ?? null
}
