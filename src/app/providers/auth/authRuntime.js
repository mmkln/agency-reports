export function buildAuthRuntime({ dataClient, defaultClientId = null, viewer }) {
  return {
    defaultClientId: defaultClientId ?? viewer?.clientId ?? viewer?.clientIds?.[0] ?? null,
    dataClient,
    viewer,
  }
}
