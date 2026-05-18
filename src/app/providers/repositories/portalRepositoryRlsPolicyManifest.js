import {
  createPortalRepositoryAccessManifest,
  PORTAL_ACCESS_MODES,
} from './portalRepositoryAccessManifest'
import { PORTAL_REPOSITORY_CLIENT_SCOPE } from './portalRepositorySchema'

export const PORTAL_RLS_ACTORS = Object.freeze({
  AGENCY: 'agency',
  CLIENT_MEMBER: 'client_member',
  INVITATION_TOKEN: 'invitation_token',
  PROFILE_OWNER: 'profile_owner',
})

export const PORTAL_RLS_OPERATIONS = Object.freeze({
  ALL: 'all',
  SELECT: 'select',
  UPDATE: 'update',
})

function createAgencyPolicy(entry) {
  return {
    actor: PORTAL_RLS_ACTORS.AGENCY,
    checks: [
      {
        description: 'Authenticated user belongs to the agency that owns this record.',
        type: 'agency_membership',
      },
    ],
    name: `${entry.tableName}_agency_all`,
    operations: [PORTAL_RLS_OPERATIONS.ALL],
    tableName: entry.tableName,
  }
}

function createClientReadPolicy(entry) {
  const membershipRecordColumn = entry.tableName === 'clients' ? 'id' : 'client_id'

  return {
    actor: PORTAL_RLS_ACTORS.CLIENT_MEMBER,
    checks: [
      {
        description: 'Authenticated user has an active membership for the record client.',
        recordColumn: membershipRecordColumn,
        type: 'client_membership',
      },
      ...entry.clientReadFilters.map((filter) => ({
        column: filter.column,
        description: `Client reads are limited to ${filter.column} values allowed by the access manifest.`,
        type: 'record_filter',
        values: filter.values,
      })),
    ],
    name: `${entry.tableName}_client_select`,
    operations: [PORTAL_RLS_OPERATIONS.SELECT],
    tableName: entry.tableName,
  }
}

function createProfileOwnerPolicy(entry) {
  return {
    actor: PORTAL_RLS_ACTORS.PROFILE_OWNER,
    checks: [
      {
        column: 'user_id',
        description: 'Authenticated user may read and update only their own profile.',
        type: 'auth_user_match',
      },
    ],
    name: `${entry.tableName}_profile_owner`,
    operations: [PORTAL_RLS_OPERATIONS.SELECT, PORTAL_RLS_OPERATIONS.UPDATE],
    tableName: entry.tableName,
  }
}

function createInvitationTokenPolicy(entry) {
  return {
    actor: PORTAL_RLS_ACTORS.INVITATION_TOKEN,
    checks: [
      {
        column: 'token',
        description: 'Invitation access is limited to a valid pending invitation token.',
        type: 'valid_invitation_token',
      },
    ],
    name: `${entry.tableName}_token_select`,
    operations: [PORTAL_RLS_OPERATIONS.SELECT],
    tableName: entry.tableName,
  }
}

function createPoliciesForEntry(entry) {
  const policies = [createAgencyPolicy(entry)]

  if (entry.accessMode === PORTAL_ACCESS_MODES.CLIENT_READABLE) {
    policies.push(createClientReadPolicy(entry))
  }

  if (entry.accessMode === PORTAL_ACCESS_MODES.SELF_OR_AGENCY) {
    policies.push(createProfileOwnerPolicy(entry))
  }

  if (entry.accessMode === PORTAL_ACCESS_MODES.TOKEN_GATED) {
    policies.push(createInvitationTokenPolicy(entry))
  }

  return policies
}

export function createPortalRepositoryRlsPolicyManifest() {
  return createPortalRepositoryAccessManifest().map((entry) => ({
    accessMode: entry.accessMode,
    aggregateOnly: entry.aggregateOnly,
    clientScope: entry.clientScope,
    policies: createPoliciesForEntry(entry),
    repositoryKey: entry.repositoryKey,
    tableName: entry.tableName,
  }))
}

export function getPortalRepositoryRlsPolicies(tableName) {
  return createPortalRepositoryRlsPolicyManifest().find((entry) => entry.tableName === tableName) ?? null
}

export function isClientScopedRlsTable(entry) {
  return entry.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.REQUIRED
    || entry.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.OPTIONAL
}
