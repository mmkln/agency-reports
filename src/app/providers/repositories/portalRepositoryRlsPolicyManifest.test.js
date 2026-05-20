import { describe, expect, it } from 'vitest'

import {
  PORTAL_CLIENT_READABLE_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'
import {
  PORTAL_ACCESS_MODES,
} from './portalRepositoryAccessManifest'
import {
  createPortalRepositoryRlsPolicyManifest,
  getPortalRepositoryRlsPolicies,
  isClientScopedRlsTable,
  PORTAL_RLS_ACTORS,
  PORTAL_RLS_OPERATIONS,
} from './portalRepositoryRlsPolicyManifest'

describe('portalRepositoryRlsPolicyManifest', () => {
  it('describes server-side policy intent for every repository table', () => {
    const manifest = createPortalRepositoryRlsPolicyManifest()

    expect(manifest).toHaveLength(PORTAL_REPOSITORY_COLLECTIONS.length)
    expect(manifest.map((entry) => entry.tableName)).toEqual(PORTAL_TABLE_NAMES)

    for (const entry of manifest) {
      expect(entry.policies.length, entry.tableName).toBeGreaterThan(0)
      expect(entry.policies, entry.tableName).toEqual(expect.arrayContaining([
        expect.objectContaining({
          actor: PORTAL_RLS_ACTORS.AGENCY,
          operations: [PORTAL_RLS_OPERATIONS.ALL],
        }),
      ]))
    }
  })

  it('adds membership-based select policies only for client-readable tables', () => {
    const manifest = createPortalRepositoryRlsPolicyManifest()

    for (const entry of manifest) {
      const clientPolicy = entry.policies.find((policy) => policy.actor === PORTAL_RLS_ACTORS.CLIENT_MEMBER)

      if (entry.accessMode === PORTAL_ACCESS_MODES.CLIENT_READABLE) {
        expect(clientPolicy, entry.tableName).toBeDefined()
        expect(clientPolicy.operations, entry.tableName).toEqual([PORTAL_RLS_OPERATIONS.SELECT])
        expect(clientPolicy.checks, entry.tableName).toEqual(expect.arrayContaining([
          expect.objectContaining({ type: 'client_membership' }),
        ]))
        expect(
          isClientScopedRlsTable(entry) || entry.tableName === 'clients',
          entry.tableName,
        ).toBe(true)
      } else {
        expect(clientPolicy, entry.tableName).toBeUndefined()
      }
    }
  })

  it('carries published-state filters into client-facing clinic aggregate policies', () => {
    for (const tableName of PORTAL_CLIENT_READABLE_CLINIC_PUBLISH_STATE_TABLES) {
      const entry = getPortalRepositoryRlsPolicies(tableName)
      const clientPolicy = entry.policies.find((policy) => policy.actor === PORTAL_RLS_ACTORS.CLIENT_MEMBER)

      expect(entry.aggregateOnly, tableName).toBe(true)
      expect(clientPolicy.checks, tableName).toEqual(expect.arrayContaining([
        expect.objectContaining({
          column: 'publish_state',
          type: 'record_filter',
          values: ['published'],
        }),
      ]))
    }
  })

  it('does not create client member policies for internal clinic reporting layers', () => {
    for (const tableName of ['clinic_daily_operations', 'clinic_weekly_operator_periods']) {
      const entry = getPortalRepositoryRlsPolicies(tableName)
      const clientPolicy = entry.policies.find((policy) => policy.actor === PORTAL_RLS_ACTORS.CLIENT_MEMBER)

      expect(PORTAL_CLINIC_PUBLISH_STATE_TABLES, tableName).toContain(tableName)
      expect(entry.aggregateOnly, tableName).toBe(true)
      expect(clientPolicy, tableName).toBeUndefined()
    }
  })

  it('keeps profile-owner and invitation-token policies explicit', () => {
    expect(getPortalRepositoryRlsPolicies('profiles').policies).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actor: PORTAL_RLS_ACTORS.PROFILE_OWNER,
        operations: [PORTAL_RLS_OPERATIONS.SELECT, PORTAL_RLS_OPERATIONS.UPDATE],
      }),
    ]))

    expect(getPortalRepositoryRlsPolicies('client_invitations').policies).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actor: PORTAL_RLS_ACTORS.INVITATION_TOKEN,
        operations: [PORTAL_RLS_OPERATIONS.SELECT],
      }),
    ]))
  })
})
