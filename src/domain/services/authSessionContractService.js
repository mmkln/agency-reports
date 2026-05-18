import { USER_ROLES } from '../../entities/profile'

export const SERVER_AUTH_SESSION_CHECKS = Object.freeze({
  ACTIVE_SESSION: 'active_session',
  AGENCY_MEMBERSHIP: 'agency_membership',
  CLIENT_MEMBERSHIP: 'client_membership',
  PROFILE_EXISTS: 'profile_exists',
  SESSION_NOT_EXPIRED: 'session_not_expired',
})

export const SERVER_AUTH_VIEWER_FIELDS = Object.freeze([
  'agencyId',
  'clientId',
  'clientIds',
  'email',
  'name',
  'profileId',
  'role',
  'userId',
])

export const SERVER_AUTH_ROLE_CONTRACTS = Object.freeze({
  [USER_ROLES.AGENCY_ADMIN]: {
    allowedClientSource: 'agency_scope',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
    ],
  },
  [USER_ROLES.AGENCY_TEAM]: {
    allowedClientSource: 'assigned_client_memberships',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
      SERVER_AUTH_SESSION_CHECKS.CLIENT_MEMBERSHIP,
    ],
  },
  [USER_ROLES.CLIENT_USER]: {
    allowedClientSource: 'client_memberships_only',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.CLIENT_MEMBERSHIP,
    ],
  },
})

export function createServerAuthSessionContract() {
  return {
    sessionClaims: [
      'session_id',
      'user_id',
      'expires_at',
    ],
    viewerFields: [...SERVER_AUTH_VIEWER_FIELDS],
    roleContracts: Object.fromEntries(
      Object.entries(SERVER_AUTH_ROLE_CONTRACTS)
        .map(([role, contract]) => [role, {
          allowedClientSource: contract.allowedClientSource,
          requiredChecks: [...contract.requiredChecks],
        }]),
    ),
    invariants: [
      'Client users derive portal access from active client_memberships, never profile.client_id fallback.',
      'Route clientId is a requested resource identifier, not proof of access.',
      'Expired sessions are denied before profile or membership data reaches read models.',
      'Agency team users are limited to assigned client memberships unless server policy explicitly grants broader agency scope.',
      'Frontend buildViewerFromProfile semantics must match the server viewer payload.',
    ],
  }
}

export function getServerAuthRoleContract(role) {
  return createServerAuthSessionContract().roleContracts[role] ?? null
}
