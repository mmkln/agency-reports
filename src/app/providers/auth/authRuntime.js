export function buildAuthRuntime({
  apiClient,
  dataClient,
  defaultClientId = null,
  skipRepositoryRouteContext = false,
  viewer,
}) {
  return {
    apiClient,
    defaultClientId: defaultClientId ?? viewer?.activeWorkspaceId ?? null,
    dataClient,
    skipRepositoryRouteContext,
    viewer,
  }
}
