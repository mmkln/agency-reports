import { describe, expect, it } from 'vitest'

import {
  createServerAuthSessionContract,
  getServerAuthAccessContextContract,
  SERVER_AUTH_SESSION_CHECKS,
  SERVER_AUTH_VIEWER_FIELDS,
} from './authSessionContractService'

describe('authSessionContractService', () => {
  it('defines the server viewer payload expected by frontend read models', () => {
    const contract = createServerAuthSessionContract()

    expect(contract.viewerFields).toEqual(SERVER_AUTH_VIEWER_FIELDS)
    expect(contract.sessionClaims).toEqual([
      'session_id',
      'user_id',
      'expires_at',
    ])
  })

  it('requires workspace memberships as the only direct workspace-user access source', () => {
    expect(getServerAuthAccessContextContract('workspace_member')).toEqual({
      allowedWorkspaceSource: 'active_workspace_memberships',
      requiredChecks: [
        SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
        SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
        SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
        SERVER_AUTH_SESSION_CHECKS.WORKSPACE_MEMBERSHIP,
      ],
    })
    expect(getServerAuthAccessContextContract('multi_context_user')).toEqual({
      allowedWorkspaceSource: 'active_memberships_and_relationships',
      requiredChecks: [
        SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
        SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
        SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
        SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
        SERVER_AUTH_SESSION_CHECKS.WORKSPACE_MEMBERSHIP,
      ],
    })
  })

  it('keeps agency membership contracts explicit', () => {
    expect(getServerAuthAccessContextContract('agency_member')).toMatchObject({
      allowedWorkspaceSource: 'active_agency_workspace_relationships',
      requiredChecks: expect.arrayContaining([
        SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
      ]),
    })
  })

  it('documents invariants that preserve current frontend viewer semantics', () => {
    const contract = createServerAuthSessionContract()

    expect(contract.invariants).toEqual(expect.arrayContaining([
      'Portal users derive access from active workspace memberships, never profile.client_id fallback.',
      'Route clientId is a requested resource identifier, not proof of access.',
      'Frontend buildViewerAccessContext semantics must match the server viewer payload.',
    ]))
    expect(getServerAuthAccessContextContract('unknown-context')).toBeNull()
  })
})
