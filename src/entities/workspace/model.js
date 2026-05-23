import {
  CLIENT_STATUSES,
  CLIENT_STATUS_META,
  CLIENT_TYPES,
  CLIENT_TYPE_META,
} from '../client'

export const WORKSPACE_STATUSES = CLIENT_STATUSES
export const WORKSPACE_STATUS_META = CLIENT_STATUS_META
export const WORKSPACE_TYPES = CLIENT_TYPES
export const WORKSPACE_TYPE_META = CLIENT_TYPE_META

export function normalizeWorkspaceId(value) {
  return value ? String(value) : null
}

export function isClinicWorkspace(workspace) {
  return workspace?.type === WORKSPACE_TYPES.CLINIC
}

