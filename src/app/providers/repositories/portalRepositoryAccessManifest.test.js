import { describe, expect, it } from 'vitest'

import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../../entities/client-work-item'
import { CLINIC_RECORD_PUBLISH_STATES } from '../../../entities/clinic'
import { VISIBILITY } from '../../../entities/update'
import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'
import {
  createPortalRepositoryAccessManifest,
  getPortalRepositoryAccessRules,
  PORTAL_ACCESS_MODES,
  PORTAL_ACCESS_RULES,
} from './portalRepositoryAccessManifest'

describe('portalRepositoryAccessManifest', () => {
  it('describes access requirements for every repository table', () => {
    const manifest = createPortalRepositoryAccessManifest()

    expect(manifest).toHaveLength(PORTAL_REPOSITORY_COLLECTIONS.length)
    expect(manifest.map((entry) => entry.tableName)).toEqual(PORTAL_TABLE_NAMES)

    for (const entry of manifest) {
      expect(entry.rules, entry.tableName).toContain(PORTAL_ACCESS_RULES.AGENCY_SCOPE_REQUIRED)
      expect(entry.rules, entry.tableName).toContain(PORTAL_ACCESS_RULES.SERVER_AUDIT_REQUIRED)
    }
  })

  it('keeps internal task and activity tables agency-only', () => {
    expect(getPortalRepositoryAccessRules('tasks')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.AGENCY_ONLY,
      clientReadFilters: [],
    })
    expect(getPortalRepositoryAccessRules('activity_events')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.AGENCY_ONLY,
      clientReadFilters: [],
    })
  })

  it('requires published state for client work item client reads', () => {
    expect(getPortalRepositoryAccessRules('client_work_items')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.CLIENT_READABLE,
      clientReadFilters: [
        {
          column: 'publish_state',
          values: [CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED],
        },
      ],
    })
  })

  it('requires client-safe visibility for visibility-based client records', () => {
    expect(getPortalRepositoryAccessRules('updates')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.CLIENT_READABLE,
      clientReadFilters: [
        {
          column: 'visibility',
          values: [VISIBILITY.CLIENT_VISIBLE],
        },
      ],
    })
  })

  it('marks clinic aggregate tables as aggregate-only published client reads', () => {
    for (const tableName of PORTAL_CLINIC_PUBLISH_STATE_TABLES) {
      const accessRules = getPortalRepositoryAccessRules(tableName)

      expect(accessRules.aggregateOnly, tableName).toBe(true)
      expect(accessRules.accessMode, tableName).toBe(PORTAL_ACCESS_MODES.CLIENT_READABLE)
      expect(accessRules.rules, tableName).toEqual(expect.arrayContaining([
        PORTAL_ACCESS_RULES.CLIENT_MEMBERSHIP_REQUIRED,
        PORTAL_ACCESS_RULES.PUBLISHED_STATE_REQUIRED,
      ]))
      expect(accessRules.clientReadFilters, tableName).toEqual(expect.arrayContaining([
        {
          column: 'publish_state',
          values: [CLINIC_RECORD_PUBLISH_STATES.PUBLISHED],
        },
      ]))
    }
  })

  it('keeps profile access self-or-agency and invitations token-gated', () => {
    expect(getPortalRepositoryAccessRules('profiles')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.SELF_OR_AGENCY,
      rules: expect.arrayContaining([PORTAL_ACCESS_RULES.OWN_PROFILE_ONLY]),
    })

    expect(getPortalRepositoryAccessRules('client_invitations')).toMatchObject({
      accessMode: PORTAL_ACCESS_MODES.TOKEN_GATED,
    })
    expect(getPortalRepositoryAccessRules('client_invitations').rules).not.toContain(
      PORTAL_ACCESS_RULES.CLIENT_MEMBERSHIP_REQUIRED,
    )
  })
})
