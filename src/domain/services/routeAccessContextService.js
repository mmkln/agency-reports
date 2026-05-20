import { CLIENT_TYPES } from '../../entities/client'

export function getRouteAccessClientContext({
  clientId,
  repositories,
}) {
  if (!clientId) {
    return {
      clientId: null,
      clientType: CLIENT_TYPES.GENERIC,
    }
  }

  const client = repositories.clients.findById(clientId)

  return {
    clientId,
    clientType: client?.type ?? CLIENT_TYPES.GENERIC,
  }
}
