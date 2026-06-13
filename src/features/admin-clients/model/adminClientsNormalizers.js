import { normalizeBackendClient, normalizeBackendClientsPayload } from '@/entities/client'

export function normalizeAdminClientsPayload(payload = {}) {
  return normalizeBackendClientsPayload(payload).clients
}

export function normalizeAdminClientPayload(payload = {}) {
  return normalizeBackendClient(payload.client)
}
