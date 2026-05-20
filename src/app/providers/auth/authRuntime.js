import { USER_ROLES } from '../../../entities/profile'

export function buildAuthRuntime({ dataClient, repositories, viewer }) {
  return {
    defaultClientId: viewer?.role === USER_ROLES.AGENCY_ADMIN
      ? repositories.clients.list()[0]?.id ?? null
      : viewer?.clientId ?? viewer?.clientIds?.[0] ?? null,
    dataClient,
    repositories,
    viewer,
  }
}
