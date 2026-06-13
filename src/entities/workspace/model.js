import {
  CLIENT_STATUSES,
  CLIENT_STATUS_META,
} from '../client'

export const WORKSPACE_STATUSES = CLIENT_STATUSES
export const WORKSPACE_STATUS_META = CLIENT_STATUS_META

export function normalizeWorkspaceId(value) {
  return value ? String(value) : null
}
