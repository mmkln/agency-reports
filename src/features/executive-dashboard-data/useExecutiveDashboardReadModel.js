import { executiveDashboardStaticData } from './executiveDashboardStaticData'

function resolveWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.workspaceId
    ?? routeParams.clientId
    ?? runtime?.defaultClientId
    ?? runtime?.viewer?.activeWorkspaceId
    ?? null
}

export function useExecutiveDashboardReadModel({
  routeParams = {},
  runtime,
}) {
  const workspaceId = resolveWorkspaceId({ routeParams, runtime })

  return {
    page: {
      ...executiveDashboardStaticData,
      workspaceId,
    },
    status: 'ready',
    workspaceId,
  }
}
