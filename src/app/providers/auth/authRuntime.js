export function buildAuthRuntime({ dataClient, defaultClientId = null, viewer }) {
  return {
    defaultClientId: defaultClientId ?? viewer?.activeWorkspaceId ?? null,
    dataClient,
    viewer,
  }
}
