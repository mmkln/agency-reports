export function buildAuthRuntime({
  apiClient,
  defaultClientId = null,
  viewer,
}) {
  return {
    apiClient,
    defaultClientId: defaultClientId ?? viewer?.activeWorkspaceId ?? null,
    viewer,
  }
}
