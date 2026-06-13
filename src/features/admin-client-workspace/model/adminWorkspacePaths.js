import {
  getAgencyWorkspaceAccessPath,
  getAgencyWorkspaceDataPath,
  getAgencyWorkspaceReviewPath,
  getAgencyWorkspaceReviewSetupPath,
  getAgencyWorkspaceSetupPath,
} from '../../../domain/navigation/routePaths'

function getWorkspaceId(workspaceOrId) {
  return typeof workspaceOrId === 'object' ? workspaceOrId?.id : workspaceOrId
}

export function getWorkspaceSetupPath(workspaceOrId) {
  return getAgencyWorkspaceSetupPath(getWorkspaceId(workspaceOrId))
}

export function getWorkspaceDataSourcesPath(workspaceOrId) {
  return getAgencyWorkspaceDataPath(getWorkspaceId(workspaceOrId))
}

export function getWorkspaceReviewPath(workspaceOrId) {
  return getAgencyWorkspaceReviewPath(getWorkspaceId(workspaceOrId))
}

export function getWorkspaceReviewSetupPath(workspaceOrId) {
  return getAgencyWorkspaceReviewSetupPath(getWorkspaceId(workspaceOrId))
}

export function getWorkspaceAccessPath(workspaceOrId) {
  return getAgencyWorkspaceAccessPath(getWorkspaceId(workspaceOrId))
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
