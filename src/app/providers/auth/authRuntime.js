export function buildAuthRuntime({
  dataClient,
  defaultClientId = null,
  skipRepositoryRouteContext = false,
  viewer,
}) {
  return {
    defaultClientId: defaultClientId ?? viewer?.activeWorkspaceId ?? null,
    dataClient,
    skipRepositoryRouteContext,
    viewer,
  }
}
