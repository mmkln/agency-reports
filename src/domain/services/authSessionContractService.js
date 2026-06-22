export const SERVER_AUTH_SESSION_CHECKS = Object.freeze({
  ACTIVE_SESSION: 'active_session',
  AGENCY_MEMBERSHIP: 'agency_membership',
  WORKSPACE_MEMBERSHIP: 'workspace_membership',
  PROFILE_EXISTS: 'profile_exists',
  SESSION_NOT_EXPIRED: 'session_not_expired',
})

export const SERVER_AUTH_VIEWER_FIELDS = Object.freeze([
  'activeAgencyId',
  'activeWorkspaceId',
  'agencyMemberships',
  'capabilities',
  'email',
  'managedWorkspaceRelationships',
  'name',
  'profileId',
  'userId',
  'workspaceMemberships',
])

export const SERVER_AUTH_ACCESS_CONTEXTS = Object.freeze({
  agency_member: {
    allowedWorkspaceSource: 'active_agency_workspace_relationships',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
    ],
  },
  workspace_member: {
    allowedWorkspaceSource: 'active_workspace_memberships',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.WORKSPACE_MEMBERSHIP,
    ],
  },
  multi_context_user: {
    allowedWorkspaceSource: 'active_memberships_and_relationships',
    requiredChecks: [
      SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
      SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
      SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
      SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
      SERVER_AUTH_SESSION_CHECKS.WORKSPACE_MEMBERSHIP,
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
    accessContexts: Object.fromEntries(
      Object.entries(SERVER_AUTH_ACCESS_CONTEXTS)
        .map(([context, contract]) => [context, {
          allowedWorkspaceSource: contract.allowedWorkspaceSource,
          requiredChecks: [...contract.requiredChecks],
        }]),
    ),
    invariants: [
      'Portal users derive access from active workspace memberships, never profile.client_id fallback.',
      'Route clientId is a requested resource identifier, not proof of access.',
      'Expired sessions are denied before profile or membership data reaches read models.',
      'Agency workspace access requires active agency membership and active agency-workspace relationship.',
      'Frontend buildViewerAccessContext semantics must match the server viewer payload.',
    ],
  }
}

export function getServerAuthAccessContextContract(context) {
  return createServerAuthSessionContract().accessContexts[context] ?? null
}
