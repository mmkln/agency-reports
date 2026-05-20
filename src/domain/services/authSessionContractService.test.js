import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import {
  createServerAuthSessionContract,
  getServerAuthRoleContract,
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

  it('requires client memberships as the only client-user access source', () => {
    expect(getServerAuthRoleContract(USER_ROLES.CLIENT_USER)).toEqual({
      allowedClientSource: 'client_memberships_only',
      requiredChecks: [
        SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
        SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
        SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
        SERVER_AUTH_SESSION_CHECKS.CLIENT_MEMBERSHIP,
      ],
    })
    expect(getServerAuthRoleContract(USER_ROLES.CLIENT_TEAM)).toEqual({
      allowedClientSource: 'client_memberships_only',
      requiredChecks: [
        SERVER_AUTH_SESSION_CHECKS.ACTIVE_SESSION,
        SERVER_AUTH_SESSION_CHECKS.SESSION_NOT_EXPIRED,
        SERVER_AUTH_SESSION_CHECKS.PROFILE_EXISTS,
        SERVER_AUTH_SESSION_CHECKS.CLIENT_MEMBERSHIP,
      ],
    })
  })

  it('keeps agency and team role contracts explicit', () => {
    expect(getServerAuthRoleContract(USER_ROLES.AGENCY_ADMIN)).toMatchObject({
      allowedClientSource: 'agency_scope',
      requiredChecks: expect.arrayContaining([
        SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
      ]),
    })
    expect(getServerAuthRoleContract(USER_ROLES.AGENCY_TEAM)).toMatchObject({
      allowedClientSource: 'assigned_client_memberships',
      requiredChecks: expect.arrayContaining([
        SERVER_AUTH_SESSION_CHECKS.AGENCY_MEMBERSHIP,
        SERVER_AUTH_SESSION_CHECKS.CLIENT_MEMBERSHIP,
      ]),
    })
  })

  it('documents invariants that preserve current frontend viewer semantics', () => {
    const contract = createServerAuthSessionContract()

    expect(contract.invariants).toEqual(expect.arrayContaining([
      'Client users derive portal access from active client_memberships, never profile.client_id fallback.',
      'Route clientId is a requested resource identifier, not proof of access.',
      'Frontend buildViewerFromProfile semantics must match the server viewer payload.',
    ]))
    expect(getServerAuthRoleContract('unknown-role')).toBeNull()
  })
})
