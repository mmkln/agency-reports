import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../../entities/client-work-item'
import { CLINIC_RECORD_PUBLISH_STATES } from '../../../entities/clinic'
import { REPORT_STATUSES } from '../../../entities/report'
import { VISIBILITY } from '../../../entities/update'
import { PORTAL_CLINIC_PUBLISH_STATE_TABLES } from './portalRepositoryContract'
import {
  createPortalRepositorySchemaManifest,
  PORTAL_REPOSITORY_CLIENT_SCOPE,
} from './portalRepositorySchema'

export const PORTAL_ACCESS_RULES = Object.freeze({
  AGENCY_SCOPE_REQUIRED: 'agency_scope_required',
  CLIENT_MEMBERSHIP_REQUIRED: 'client_membership_required',
  CLIENT_SAFE_VISIBILITY_REQUIRED: 'client_safe_visibility_required',
  OWN_PROFILE_ONLY: 'own_profile_only',
  PUBLISHED_STATE_REQUIRED: 'published_state_required',
  SERVER_AUDIT_REQUIRED: 'server_audit_required',
})

export const PORTAL_ACCESS_MODES = Object.freeze({
  AGENCY_ONLY: 'agency_only',
  CLIENT_READABLE: 'client_readable',
  SELF_OR_AGENCY: 'self_or_agency',
  TOKEN_GATED: 'token_gated',
})

const CLIENT_READABLE_TABLES = new Set([
  'booking_pipeline_snapshots',
  'call_booking_metrics',
  'client_file_links',
  'client_requests',
  'client_work_items',
  'clients',
  'compliance_reviews',
  'dashboard_links',
  'location_performance',
  'needed_from_client',
  'medical_approvals',
  'patient_acquisition_snapshots',
  'performance_dashboard_periods',
  'projects',
  'reports',
  'reputation_snapshots',
  'service_line_performance',
  'updates',
])

const CLIENT_SAFE_VISIBILITY_TABLES = new Set([
  'client_file_links',
  'dashboard_links',
  'updates',
])

const CLIENT_PUBLISHED_STATE_FILTERS = Object.freeze({
  client_work_items: {
    column: 'publish_state',
    values: [CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED],
  },
  reports: {
    column: 'status',
    values: [REPORT_STATUSES.PUBLISHED, REPORT_STATUSES.ARCHIVED],
  },
})

function getClientReadFilters(tableName) {
  const filters = []

  if (PORTAL_CLINIC_PUBLISH_STATE_TABLES.includes(tableName)) {
    filters.push({
      column: 'publish_state',
      values: [CLINIC_RECORD_PUBLISH_STATES.PUBLISHED],
    })
  }

  if (CLIENT_SAFE_VISIBILITY_TABLES.has(tableName)) {
    filters.push({
      column: 'visibility',
      values: [VISIBILITY.CLIENT_VISIBLE],
    })
  }

  if (CLIENT_PUBLISHED_STATE_FILTERS[tableName]) {
    filters.push(CLIENT_PUBLISHED_STATE_FILTERS[tableName])
  }

  return filters
}

function getAccessMode(tableSchema) {
  if (tableSchema.tableName === 'profiles') {
    return PORTAL_ACCESS_MODES.SELF_OR_AGENCY
  }

  if (tableSchema.tableName === 'client_invitations') {
    return PORTAL_ACCESS_MODES.TOKEN_GATED
  }

  return CLIENT_READABLE_TABLES.has(tableSchema.tableName)
    ? PORTAL_ACCESS_MODES.CLIENT_READABLE
    : PORTAL_ACCESS_MODES.AGENCY_ONLY
}

function createAccessRules(tableSchema, accessMode) {
  const rules = [PORTAL_ACCESS_RULES.AGENCY_SCOPE_REQUIRED]

  if (
    tableSchema.clientScope !== PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL
    && accessMode !== PORTAL_ACCESS_MODES.TOKEN_GATED
  ) {
    rules.push(PORTAL_ACCESS_RULES.CLIENT_MEMBERSHIP_REQUIRED)
  }

  if (accessMode === PORTAL_ACCESS_MODES.SELF_OR_AGENCY) {
    rules.push(PORTAL_ACCESS_RULES.OWN_PROFILE_ONLY)
  }

  if (
    PORTAL_CLINIC_PUBLISH_STATE_TABLES.includes(tableSchema.tableName)
    || CLIENT_PUBLISHED_STATE_FILTERS[tableSchema.tableName]
  ) {
    rules.push(PORTAL_ACCESS_RULES.PUBLISHED_STATE_REQUIRED)
  }

  if (CLIENT_SAFE_VISIBILITY_TABLES.has(tableSchema.tableName)) {
    rules.push(PORTAL_ACCESS_RULES.CLIENT_SAFE_VISIBILITY_REQUIRED)
  }

  rules.push(PORTAL_ACCESS_RULES.SERVER_AUDIT_REQUIRED)

  return [...new Set(rules)]
}

export function createPortalRepositoryAccessManifest() {
  return createPortalRepositorySchemaManifest().map((tableSchema) => {
    const accessMode = getAccessMode(tableSchema)

    return {
      accessMode,
      aggregateOnly: PORTAL_CLINIC_PUBLISH_STATE_TABLES.includes(tableSchema.tableName),
      clientScope: tableSchema.clientScope,
      clientReadFilters: getClientReadFilters(tableSchema.tableName),
      repositoryKey: tableSchema.repositoryKey,
      rules: createAccessRules(tableSchema, accessMode),
      tableName: tableSchema.tableName,
    }
  })
}

export function getPortalRepositoryAccessRules(tableName) {
  return createPortalRepositoryAccessManifest().find((accessRules) => accessRules.tableName === tableName) ?? null
}
