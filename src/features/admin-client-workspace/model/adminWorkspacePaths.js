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
  return `${ROUTE_PATHS.agencyClinicSetup}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceDataSourcesPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClinicDataSources}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceReviewPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClinicReview}${getWorkspaceSearch(workspaceOrId)}`
}

export function getWorkspaceReviewSetupPath(workspaceOrId) {
  return `${ROUTE_PATHS.agencyClinicReviewSetup}${getWorkspaceSearch(workspaceOrId)}`
}

export function getDefaultWorkspaceAdminPath(workspace) {
  if (workspace?.type === 'clinic') {
    return getWorkspaceSetupPath(workspace)
  }

  return getWorkspaceSetupPath(workspace)
}

export function resolveRouteWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.workspaceId
    ?? routeParams.clientId
    ?? runtime?.defaultClientId
    ?? runtime?.viewer?.activeWorkspaceId
    ?? null
}
